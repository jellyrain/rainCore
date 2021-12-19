import { h } from '../diff/main'

export function astToVDom(ast) {
    var children = []
    for (var i = 0; i < ast.children.length; i++) {
        children.push(astToVDom(ast.children[i]))
    }
    var vDom = h(ast.sel, ast.data, children, ast.text)
    return vDom
}