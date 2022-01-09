import { vNode, ShapeFlags } from './utils'
import { patch, patchProps } from './patch'

/* 挂载元素 */
function mountElement(vNode: vNode, container: HTMLElement, anchor?: Text) {
    const { type, props, shapeFlag, children } = vNode
    const el = document.createElement(type as string)
    if (props) patchProps(null, props, el)
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) el.textContent = vNode.children as string
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) mountChildren(children as [], el)
    vNode.elm = el
    container.insertBefore(el, anchor as Text)
}

/* 挂载文本 */
function mountTextNode(vNode: vNode, container: HTMLElement, anchor?: Text) {
    const textNode = document.createTextNode(vNode.children as string)
    vNode.elm = textNode
    container.insertBefore(textNode, anchor as Text)
}

/* 挂载孩子 */
function mountChildren(children: [], container: HTMLElement, anchor?: Text) {
    children.forEach(child => {
        patch(null, child, container, anchor!)
    })
}

export { mountElement, mountTextNode, mountChildren }