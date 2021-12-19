import { createElement } from './create'

export function contrastNode(oldVNode, newVNode) {
    return oldVNode.sel === newVNode.sel && oldVNode.key === newVNode.key
}

export function replaceNode(oldDomNode, newDomNode) {
    oldDomNode.parentNode.insertBefore(newDomNode, oldDomNode)
    oldDomNode.parentNode.removeChild(oldDomNode)
}

function comparisonChild(dom, oldVNodeChild, newVNodeChild) {
    var oldStartIdx = 0,
        newStartIdx = 0,
        oldEndIdx = oldVNodeChild.length - 1,
        newEndIdx = newVNodeChild.length - 1
    var oldStartVNode = oldVNodeChild[oldStartIdx],
        oldEndVNode = oldVNodeChild[oldEndIdx],
        newStartVNode = newVNodeChild[newStartIdx],
        newEndVNode = newVNodeChild[newEndIdx]
    var keyMap = null
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldVNodeChild[oldStartIdx] == undefined || oldStartVNode == undefined) {
            oldStartVNode = oldVNodeChild[++oldStartIdx]
            continue
        }
        if (oldVNodeChild[oldEndIdx] == undefined || oldEndVNode == undefined) {
            oldEndVNode = oldVNodeChild[--oldEndIdx]
            continue
        }
        if (newVNodeChild[newStartIdx] == undefined || newStartVNode == undefined) {
            newStartVNode = newVNodeChild[++newStartIdx]
            continue
        }
        if (newVNodeChild[newEndIdx] == undefined || newEndVNode == undefined) {
            newEndVNode = newVNodeChild[--newEndIdx]
            continue
        }
        if (contrastNode(oldStartVNode, newStartVNode)) {
            finePatch(oldStartVNode, newStartVNode)
            oldStartVNode = oldVNodeChild[++oldStartIdx]
            newStartVNode = newVNodeChild[++newStartIdx]
            continue
        }
        if (contrastNode(oldEndVNode, newEndVNode)) {
            finePatch(oldEndVNode, newEndVNode)
            oldEndVNode = oldVNodeChild[--oldEndIdx]
            newEndVNode = newVNodeChild[--newEndIdx]
            continue
        }
        if (contrastNode(oldStartVNode, newEndVNode)) {
            finePatch(oldStartVNode, newEndVNode)
            dom.insertBefore(oldStartVNode.elm, oldEndVNode.elm.nextSibling)
            oldStartVNode = oldVNodeChild[++oldStartIdx]
            newEndVNode = newVNodeChild[--newEndIdx]
            continue
        }
        if (contrastNode(oldEndVNode, newStartVNode)) {
            finePatch(oldEndVNode, newStartVNode)
            dom.insertBefore(oldEndVNode, oldStartVNode.elm)
            oldEndVNode = oldVNodeChild[--oldEndIdx]
            newStartVNode = newVNodeChild[++newStartIdx]
            continue
        }
        if (!keyMap) {
            keyMap = {}
            for (var i = oldStartIdx; i <= oldEndIdx; i++) {
                var key = oldVNodeChild[i].key
                if (key != undefined) keyMap[key] = i
            }
        }
        var idxInOld = keyMap[newStartIdx.key]
        if (idxInOld == undefined) {
            dom.insertBefore(createElement(newStartVNode), oldStartVNode.elm)
        } else {
            var elmToMove = oldVNodeChild[idxInOld]
            finePatch(elmToMove, newStartVNode)
            oldVNodeChild[idxInOld] = undefined
            dom.insertBefore(elmToMove.elm, oldStartVNode.elm)
        }
        newStartVNode = newVNodeChild[++newEndIdx]
    }
    if (newStartIdx <= newEndIdx) {
        for (var i = newStartIdx; i <= newEndIdx; i++) {
            dom.insertBefore(createElement(newVNodeChild[i]), oldVNodeChild[oldStartIdx] == undefined ? null : oldVNodeChild[oldStartIdx].elm)
        }
    }
    if (oldStartIdx <= oldEndIdx) {
        for (var i = oldStartIdx; i <= oldEndIdx; i++) {
            if (oldVNodeChild[i]) dom.removeChild(oldVNodeChild[i].elm)
        }
    }
}

export function finePatch(oldVNode, newVNode) {
    if (oldVNode === newVNode) return
    if (newVNode.text != undefined && (newVNode.children == undefined || newVNode.children.length === 0)) {
        if (oldVNode.text !== newVNode.text) oldVNode.elm.innerText = newVNode.text
    } else {
        if (oldVNode.children != undefined && oldVNode.children.length > 0) {
            comparisonChild(oldVNode.elm, oldVNode.children, newVNode.children)
        } else {
            oldVNode.elm.innerHTML = ''
            var fragment = document.createDocumentFragment()
            for (var i = 0; i < newVNode.children.length; i++) {
                fragment.appendChild(createElement(newVNode.children[i]))
            }
            oldVNode.elm.appendChild(fragment)
        }
    }
    if (newVNode.data !== {}) {
        if (oldVNode.data !== {}) {
            for (var key in newVNode.data) {
                if (oldVNode.data[key]) oldVNode.data[key] = undefined
                oldVNode.elm.setAttribute(key, newVNode.data[key])
            }
            for (var key in oldVNode.data) {
                if (oldVNode.data[key]) oldVNode.elm.removeAttribute(key)
            }
        } else {
            for (var key in newVNode.data) {
                oldVNode.elm.setAttribute(key, newVNode.data[key])
            }
        }
    } else {
        if (oldVNode.data !== {}) {
            for (var key in oldVNode.data) {
                oldVNode.elm.removeAttribute(key)
            }
        }
    }
    newVNode.elm = oldVNode.elm
}