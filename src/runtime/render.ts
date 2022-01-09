import { vNode } from './utils'
import { patch } from './patch'
import { unmount } from './unmount'

/* 渲染函数 */
function render(vNode: vNode | null, container: HTMLElement) {
    const pervVNode = (container as any)._vNode
    /*  判断是否传入新的vNode */
    if (vNode) {
        /* 进行 diff 算法 */
        patch(pervVNode, vNode, container)
    } else {
        /* 没有传入新的 vNode 且有旧的 vNode 卸载旧 vNode */
        if (pervVNode) unmount(pervVNode)
    }
    (container as any)._vNode = vNode
}

export { render }