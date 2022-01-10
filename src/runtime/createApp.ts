import { isString } from './utils'
import { h } from './vnode'
import { render } from './render'

function createApp(component: object) {
    return {
        mount(container: any) {
            if (isString(container)) container = document.querySelector(container as string)
            render(h(component, null, null), container)
        }
    }
}

export { createApp }