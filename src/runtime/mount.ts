import { vNode, instance, ShapeFlags } from './utils'
import { patch, patchProps } from './patch'
import { initProps, fallThrough } from './component'
import { effect } from '../reactivity/effect'
import { normalizeVNode } from './vnode'
import { queueJob } from './scheduler'

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

/* 挂载组件 */
function mountComponent(vNode: vNode, container: HTMLElement, anchor?: Text) {
    const { type: Component } = vNode
    /* 实例模板 */
    const instance: instance = (vNode.component = {
        props: {},
        attrs: {},
        setupState: null,
        ctx: null,
        update: null,
        isMounted: false,
        subTree: null,
        next: null
    })
    /* 初始化 Props */
    initProps(instance, vNode)
    /* 运行 setup */
    instance.setupState = (Component as any).setup?.(instance.props, {
        attrs: instance.attrs
    })
    /* 设置 ctx */
    instance.ctx = { ...instance.props, ...instance.setupState }
    /* 设置渲染函数 */
    instance.update = effect(
        () => {
            /* 判断是否未挂载 */
            if (!instance.isMounted) {
                const subTree: vNode = (instance.subTree = normalizeVNode(
                    (Component as any).render(instance.ctx)
                ))
                /* 设置 subTree 的 props 属性 */
                fallThrough(instance, subTree)
                /* 挂载组件 */
                patch(null, subTree, container, anchor)
                instance.isMounted = true
                vNode.elm = subTree.elm
            } else {
                // instance.next存在，代表是被动更新。否则是主动更新
                if (instance.next) {
                    (vNode as any) = instance.next
                    instance.next = null
                    initProps(instance, vNode)
                    instance.ctx = { ...instance.props, ...instance.setupState, }
                }
                /* 获取上一次 render 返回的 vNode */
                const prev: any = instance.subTree
                const subTree = (instance.subTree = normalizeVNode(
                    (Component as any).render(instance.ctx)
                ))
                /* 设置 subTree 的 props 属性 */
                fallThrough(instance, subTree)
                /* 对比 两次 render 返回的 vNode*/
                patch(prev, subTree, container, anchor)
                vNode.elm = subTree.elm
            }
        }, {
        scheduler: queueJob
    })
}

export { mountElement, mountTextNode, mountChildren, mountComponent }