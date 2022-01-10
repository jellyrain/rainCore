import { vNode, isSameVNode, ShapeFlags, domPropsRE, isChildrenKey, getSequence } from "./utils"
import { processComponent, processFragment, processText, processElement } from './process'
import { unmount, unmountChildren } from './unmount'
import { mountChildren } from './mount'

function patch(n1: vNode | null, n2: vNode, container: HTMLElement, anchor?: Text) {
    if (n1 && !isSameVNode(n1, n2)) {
        /* n1被卸载后，n2将会创建，因此anchor至关重要。需要将它设置为n1的下一个兄弟节点 */
        (anchor as any) = (n1.anchor || n1.elm)!.nextSibling
        unmount(n1)
        n1 = null
    }

    const { shapeFlag } = n2
    /* 判断 n2 是否是组件 */
    if (shapeFlag & ShapeFlags.COMPONENT) processComponent(n1, n2, container, anchor)
    /* 判断 n2 是否是文本 */
    if (shapeFlag & ShapeFlags.TEXT) processText(n1, n2, container, anchor)
    /* 判断 n2 是否是元素 */
    if (shapeFlag & ShapeFlags.FRAGMENT) processFragment(n1, n2, container, anchor)
    /* 判断 n2 是否是容器 */
    if (shapeFlag & ShapeFlags.ELEMENT) processElement(n1, n2, container, anchor)
}

/* 更新元素 */
function patchElement(n1: vNode | null, n2: vNode) {
    n2.elm = n1!.elm
    patchProps(n1!.props as object, n2.props as object, n2.elm as HTMLElement)
    patchChildren(n1, n2, n2.elm as HTMLElement)
}

/* 更新属性 */
function patchProps(oldProps: object | null, newProps: object | null, container: HTMLElement) {
    if (oldProps === newProps) return
    oldProps = oldProps || {}
    newProps = newProps || {}
    for (const key in newProps) {
        if (key === 'key') continue
        const prev = (oldProps as any)[key]
        const next = (newProps as any)[key]
        if (prev !== next) {
            patchDomProp(container, key, prev, next)
        }
    }
    for (const key in oldProps) {
        if (key !== 'key' && !(key in newProps)) {
            patchDomProp(container, key, (oldProps as any)[key], null)
        }
    }
}

/* 更新 DOM 属性 */
function patchDomProp(el: HTMLElement, key: string, prev: string | object, next: string | object | null) {
    switch (key) {
        case 'class':
            // 暂时认为class就是字符串
            // next可能为null，会变成'null'，因此要设成''
            el.className = next as string || ''
            break
        case 'style':
            // style为对象
            if (!next) {
                el.removeAttribute('style')
            } else {
                for (const styleName in next as object) {
                    (el.style as any)[styleName] = (next as any)[styleName]
                }
                if (prev) {
                    for (const styleName in prev as object) {
                        if ((next as any)[styleName] == null) {
                            (el.style as any)[styleName] = ''
                        }
                    }
                }
            }
            break
        default:
            if (/^on[^a-z]/.test(key)) {
                // 事件
                if (prev !== next) {
                    const eventName = key.slice(2).toLowerCase()
                    if (prev) {
                        (el.removeEventListener as any)(eventName, prev)
                    }
                    if (next) {
                        (el.addEventListener as any)(eventName, next)
                    }
                }
            } else if (domPropsRE.test(key)) {
                if (next === '' && typeof (el as any)[key] === 'boolean') {
                    (next as any) = true
                }
                (el as any)[key] = next
            } else {
                // 例如自定义属性{custom: ''}，应该用setAttribute设置为<input custom />
                // 而{custom: null}，应用removeAttribute设置为<input />
                if (next == null || next as any === false) {
                    el.removeAttribute(key)
                } else {
                    el.setAttribute(key, (next as any))
                }
            }
            break
    }
}

/* 更新孩子 */
function patchChildren(n1: vNode | null, n2: vNode, container: HTMLElement, anchor?: Text) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1!
    const { shapeFlag, children: c2 } = n2

    /* 新 vNode 孩子是 文本 */
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        /* 旧 vNode 孩子是 数组  卸载孩子*/
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) unmountChildren(c1 as [])
        /* 如果 新旧孩子文本内容不一致 文本内容设置为 新孩子    PS：旧 vNode 孩子是 数组 testContent 是 null */
        if (c2 !== c1) container.textContent = c2 as string | null

        /* 新 vNode 孩子是 数组 */
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        /* 旧 vNode 孩子是 数组*/
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            /* 判断是否有key 调用不同的 diff 算法 */
            if (isChildrenKey(c1 as [], c2 as [])) {
                /* 有 key 时 */
                patchKeyedChildren(c1 as [], c2 as [], container, anchor)
            } else {
                /* 无 key 时 */
                patchUnKeyedChildren(c1 as [], c2 as [], container, anchor)
            }
        } else {
            /* 旧 vNode 孩子是 文本 或 null */
            container.textContent = null
            mountChildren(c2 as [], container, anchor)
        }

        /* 新 vNode 孩子是 null */
    } else {
        /* 旧 vNode 孩子是 文本 */
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) container.textContent = null
        /* 旧 vNode 孩子是 数组 */
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) unmountChildren(c1 as [])
    }
}

/* 有 key 时 使用的 diff 算法 */
function patchKeyedChildren(c1: [], c2: [], container: HTMLElement, anchor?: Text) {
    let start = 0, e1 = c1.length - 1, e2 = c2.length - 1
    /* 1. 从左向右对比 */
    while (start <= e1 && start <= e2 && (c1[start] as any).key === (c2[start] as any).key) {
        patch(c1[start], c2[start], container, anchor)
        start++
    }
    /* 2. 从右向左对比 */
    while (start <= e1 && start <= e2 && (c1 as any)[e1].key === (c2 as any)[e2].key) {
        patch((c1 as any)[e1], (c2 as any)[e2], container, anchor)
        e1--
        e2--
    }
    /* 3.1 比对后 旧孩子 已无元素 */
    if (start > e1) {
        const nextPos = e2 + 1
        const curAnchor = (c2[nextPos] && (c2[nextPos] as any).elm) || anchor
        for (let i = start; i <= e2; i++) {
            patch(null, c2[i], container, curAnchor)
        }
    }
    /* 3.2 对比后 新孩子 已无元素 */
    if (start > e2) {
        for (let i = start; i <= e1; i++) {
            unmount(c1[i])
        }
    }
    /* 4. 对比后 新旧孩子 都还有元素 采用传统diff算法，但不真的添加和移动，只做标记和删除 */
    if (start <= e1 && start <= e2) {
        /* 记录旧孩子 查询使用 */
        const map = new Map()
        for (let i = start; i <= e1; i++) {
            map.set((c1[i] as any).key, { prev: c1[i], index: i })
        }
        /* 旧孩子中上一个对比元素位置下标 */
        let maxNewIndexSoFar = 0
        /* 是否移动 开关 */
        let move = false
        /* 旧孩子中没有没有新孩子节点的下标 给未开启 move 使用 */
        const toMounted = []
        /* 初始化 sources 下标 数组 */
        const sources = new Array(e2 - start + 1).fill(-1)
        /* 查找新节点在旧节点的位置 并且 做标记 和 删除 map 中找到的元素 */
        for (let i = 0; i < e2 - start + 1; i++) {
            const nextPos: any = c2[i + start]
            /* 判断 旧孩子 中是否有 新孩子的key */
            if (map.has(nextPos.key)) {
                const { prev, index } = map.get(nextPos.key);
                /* 进行对比 */
                patch(prev, nextPos, container, anchor)
                /* 判断 当前位置是否需要移动  */
                if (index < maxNewIndexSoFar) {
                    move = true
                } else {
                    maxNewIndexSoFar = index
                }
                /* 设置 新旧孩子节点 下标对应关系 */
                sources[i] = index
                /* 删除 map 中对应的 key 值 */
                map.delete(nextPos.key)
            } else {
                /* 旧孩子中未找到新孩子节点的下标存入 toMounted */
                toMounted.push(i + start)
            }
        }
        /* 删除 旧孩子 剩余元素 */
        map.forEach(({ prev }) => {
            unmount(prev)
        })
        /* 5. 移动开关开启时 移动元素操作 采用新的最长上升子序列算法 */
        if (move) {
            /* 最长上升子序列 下标数组 */
            const sequence: any = getSequence(sources as any)
            /* 数组最长下标 */
            let length = sequence.length - 1
            for (let i = sources.length - 1; i >= 0; i--) {
                /* 下标符合 不做移动 */
                if (i === sequence[length]) {
                    length--
                } else {
                    const pos = i + start
                    const nextPos = pos + 1;
                    const curAnchor = (c2[nextPos] && (c2[nextPos] as any).elm) || anchor
                    if (sources[i] === -1) {
                        /* 旧孩子没有此节点 进行挂载 */
                        patch(null, c2[pos], container, curAnchor)
                    } else {
                        /* 移动操作 */
                        container.insertBefore((c2[pos] as any).elm, curAnchor)
                    }
                }
            }
            /* 6. 未开启 move 还有元素需要添加 情况 */
        } else if (toMounted.length) {
            for (let i = toMounted.length - 1; i >= 0; i++) {
                const pos = toMounted[i]
                const nextPos = pos + 1;
                const curAnchor = (c2[nextPos] && (c2[nextPos] as any).elm) || anchor
                patch(null, c2[pos], container, curAnchor)
            }
        }
    }
}

/* 无 key 时 使用的 diff 算法 */
function patchUnKeyedChildren(c1: [], c2: [], container: HTMLElement, anchor?: Text) {
    const oldLength = c1.length
    const newLength = c2.length
    /* 选取最短的子数组 */
    const commonLength = Math.min(oldLength, newLength)
    /* 对比共同长度的子节点 */
    for (let i = 0; i < commonLength; i++) {
        patch(c1[i], c2[i], container, anchor)
    }
    /* 新孩子 多于 旧孩子 剩下部分 挂载孩子 */
    if (newLength > oldLength) mountChildren(c2.slice(commonLength) as [], container, anchor)
    /* 旧孩子 多于 新孩子 剩下部分 卸载孩子 */
    if (newLength < oldLength) unmountChildren(c1.slice(commonLength) as [])

}

export { patch, patchElement, patchProps, patchChildren }