import { vNode, ShapeFlags } from './utils'

/* 卸载 vNode */
function unmount(vNode: vNode) {
    const { shapeFlag } = vNode
    if (shapeFlag & ShapeFlags.COMPONENT) {
        unmountComponent(vNode)
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        unmountFragment(vNode)
    } else {
        unmountElementOrText(vNode)
    }
}

// TODO 卸载组件
/* 卸载组件 */
function unmountComponent(vNode: vNode) { }

/* 卸载容器 */
function unmountFragment(vNode: vNode) {
    let { elm: cur, anchor: end } = vNode
    const parentNode = cur!.parentNode
    while (cur !== end) {
        const next = cur!.nextSibling
        parentNode!.removeChild(cur!);
        (cur as any) = next
    }
    parentNode!.removeChild(end!)
}

/* 卸载元素或文本 */
function unmountElementOrText(vNode: vNode) {
    const { elm } = vNode
    elm!.parentNode!.removeChild(elm as HTMLElement | Text)
}

/* 卸载孩子 */
function unmountChildren(children: []) {
    children.forEach(child => {
        unmount(child)
    })
}

export { unmount, unmountChildren }