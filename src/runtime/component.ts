import { instance, vNode } from './utils'
import { reactive } from '../reactivity/index'

/* 初始化 Props 不接的 当成 attrs属性 处理 */
function initProps(instance: instance, vNode: vNode) {
    const { type: Component, props: vNodeProps } = vNode
    const props: any = (instance.props = {})
    const attrs: any = (instance.attrs = {})
    for (const key in vNodeProps) {
        if ((Component as any).props?.includes(key)) {
            props[key] = (vNodeProps as any)[key];
        } else {
            attrs[key] = (vNodeProps as any)[key];
        }
    }
    /* props 设置成 响应式 */
    instance.props = reactive(instance.props)
}

function fallThrough(instance: instance, subTree: vNode) {
    if (Object.keys((instance as any).attrs).length) {
        subTree.props = {
            ...subTree.props,
            ...instance.attrs,
        };
    }
}

function updateComponent(n1: vNode | null, n2: vNode) {
    n2.component = n1!.component;
    (n2.component as any).next = n2;
    (n2.component as any).update()
}

export { initProps, fallThrough, updateComponent }