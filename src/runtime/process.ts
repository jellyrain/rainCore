import { vNode } from './utils'
import { patchElement, patchChildren } from './patch'
import { mountElement, mountTextNode, mountChildren, mountComponent } from './mount'
import { updateComponent } from './component'

/* 处理组件 */
function processComponent(n1: vNode | null, n2: vNode, container: HTMLElement, anchor?: Text) {
    if (n1) {
        updateComponent(n1, n2)
    } else {
        mountComponent(n2, container, anchor)
    }
}

/* 处理容器 */
function processFragment(n1: vNode | null, n2: vNode, container: HTMLElement, anchor?: Text) {
    const fragmentStartAnchor = n2.elm = n1 ? n1!.elm : document.createTextNode('')
    const fragmentEndAnchor = n2.anchor = n1 ? n1!.anchor : document.createTextNode('')

    if (n1) {
        patchChildren(n1, n2, container, fragmentEndAnchor as Text)
    } else {
        container.insertBefore(fragmentStartAnchor as Text, anchor as Text)
        container.insertBefore(fragmentEndAnchor as Text, anchor as Text)
        mountChildren(n2.children as [], container, fragmentEndAnchor as Text)
    }
}

/* 处理文本 */
function processText(n1: vNode | null, n2: vNode, container: HTMLElement, anchor?: Text) {
    if (n1) {
        if (n1.elm?.textContent !== n2.children) (n1 as any).elm.textContent = n2.children
        n2.elm = n1.elm
    } else {
        mountTextNode(n2, container, anchor)
    }
}

/* 处理元素 */
function processElement(n1: vNode | null, n2: vNode, container: HTMLElement, anchor?: Text) {
    if (n1) {
        patchElement(n1, n2)
    } else {
        mountElement(n2, container, anchor)
    }
}

export { processComponent, processFragment, processText, processElement } 