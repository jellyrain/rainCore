import { watch } from '../reactive/main'
import { patch } from '../diff/main'
import { astToVDom } from './astToVDom'
import { contentUpdate } from './contentReplacement'

export function watchRender(obData, key, ast, vNode) {
    watch(obData, key, function (newValue) {
        contentUpdate(key, newValue)
        var newVNode = astToVDom(ast)
        patch(vNode, newVNode)
        vNode = newVNode
    })
}