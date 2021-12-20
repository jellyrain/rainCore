export function astToDom(dom, ast) {
    dom.parentNode.insertBefore(createElement(ast), dom)
    dom.parentNode.removeChild(dom)
}

function createElement(ast) {
    var el = document.createElement(ast.sel)

    if (ast.data !== {}) {
        for (var key in ast.data) {
            el.setAttribute(key, ast.data[key])
        }
    }

    if (ast.text != undefined) el.innerText = ast.text

    if (ast.children !== []) {
        var fragment = document.createDocumentFragment()
        for (var i = 0; i < ast.children.length; i++) {
            fragment.appendChild(createElement(ast.children[i]))
        }
        el.appendChild(fragment)
    }

    ast.elm = el
    return el
}