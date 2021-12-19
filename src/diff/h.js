import { vNode } from './create'

export function h(sel, data, children, text) {
    var key

    if (children != undefined) {
        if (typeof children == 'string') text = children, children = []
    } else {
        children = []
    }

    if (data != undefined) {
        if (typeof data === 'string') {
            text = data, data = {}
        } else {
            if (data.constructor === Array) children = data, data = {}
        }
    } else {
        data = {}
    }

    data == undefined ? key = undefined : key = data.key

    return vNode(sel, data, children, undefined, text, key)
}