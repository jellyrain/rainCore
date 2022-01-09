import { vNode, isSameVNode, ShapeFlags, domPropsRE, isChildrenKey } from "./utils"
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
                patchKeyedChildren()
            } else {
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

function patchKeyedChildren() { }

function patchUnKeyedChildren(c1: [], c2: [], container: HTMLElement, anchor?: Text) {
    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)
    for (let i = 0; i < commonLength; i++) {
        patch(c1[i], c2[i], container, anchor)
    }
    if (newLength > oldLength) {
        mountChildren(c2.slice(commonLength) as [], container, anchor)
    } else if (newLength < oldLength) {
        unmountChildren(c1.slice(commonLength) as [])
    }
}

export { patch, patchElement, patchProps, patchChildren }