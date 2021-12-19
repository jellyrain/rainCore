import { createElement } from './create'
import { contrastNode, replaceNode, finePatch } from './diff'

export function mountNode(dom, vNode) {
    replaceNode(dom, createElement(vNode))
}

export function patch(oldVNode, newVNode) {
    if (contrastNode(oldVNode, newVNode)) {
        finePatch(oldVNode, newVNode)
    } else {
        replaceNode(oldVNode.elm, createElement(newVNode))
    }
}