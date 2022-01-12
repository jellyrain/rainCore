import { isString } from '../runtime/utils'
import { h } from '../runtime/vnode'
import { render } from '../runtime/render'
import { compile } from './compile'

let components: any

function createApp(component: any) {
    /* 注册组件 */
    components = component.components || {}

    /* 不写渲染函数形式 且 有模板 */
    if (!component.render && component.template) {
        if (component.template[0] === '#') {
            const el = document.querySelector(component.template)
            el ? component.template = el.innerHTML : ''
        }
        component.render = new Function('ctx', compile(component.template)!)
    }

    return {
        mount(container: any) {
            /* 获取挂载点 */
            if (isString(container)) container = document.querySelector(container as string)
            /* 不写渲染函数形式 且 不写模板 */
            if (!component.render && !component.template) {
                component.template = container.innerHTML
                component.render = new Function('ctx', compile(component.template)!)
                container.innerHTML = ''
            }
            render(h(component, null, null), container)
        }
    }
}

function resolveComponent(name: string) {
    let component: any
    /* 傻逼浏览器乱弄大小写 */
    Object.keys(components).findIndex(key => {
        if (key.toLowerCase() === name.toLowerCase()) component = components[key]
    })

    if (!component.render && component.template) {
        if (component.template[0] === '#') {
            const el = document.querySelector(component.template)
            el ? component.template = el.innerHTML : ''
        }
        component.render = new Function('ctx', compile(component.template)!)
    }

    return component
}

export { createApp, resolveComponent }