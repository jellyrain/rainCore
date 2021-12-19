export function vNode(sel, data, children, elm, text, key) {
    return {
        sel: sel,
        data: data,
        children: children,
        elm: elm,
        text: text,
        key: key
    }
}

export function mountDomConversionVNode(domNode) {
    return vNode(domNode.tagName.toLowerCase(), { props: { id: domNode.id } }, [], domNode, undefined, undefined)
}

export function createElement(vNode) {
    var el = document.createElement(vNode.sel)

    if (vNode.data !== {}) {
        for (var key in vNode.data) {
            el.setAttribute(key, vNode.data[key])
        }
    }

    if (vNode.text != undefined) el.innerText = vNode.text

    if (vNode.children !== []) {
        var fragment = document.createDocumentFragment()
        for (var i = 0; i < vNode.children.length; i++) {
            fragment.appendChild(createElement(vNode.children[i]))
        }
        el.appendChild(fragment)
    }

    vNode.elm = el
    return el
}