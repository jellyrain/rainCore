import { watchRender } from './watchRender'
import { internalHeader } from '../parser/mapper'
import { lookup } from '../tool/main'

var DATA, AST, vDOM

export function registrationInstruction(obData, ast, vDom) {
    DATA = obData
    AST = ast
    vDOM = vDom
}

export function model(mapperInstructionAst) {
    for (var i = 0; i < mapperInstructionAst.length; i++) {
        var key = mapperInstructionAst[i].data[internalHeader + '-model']
        if (key) {
            watchRender(DATA, key, AST, vDOM)
            var el = lookElement(vDOM, mapperInstructionAst[i].path).elm
            el.addEventListener('input', function () { oninput(event, key) })
            el.value = lookup(DATA, key)
            el.removeAttribute(internalHeader + '-model')
            delete mapperInstructionAst[i].data[internalHeader + '-model']
        }
    }
}

function lookElement(obj, array) {
    var temp = obj
    for (var i = 0; i < array.length; i++) {
        temp = temp.children[array[i]]
    }
    return temp
}

function oninput(event, key) {
    var temp = obj
    var keys = key.split('.')
    for (var i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
            temp[keys[i]] = event.target.value
        } else {
            temp = temp[keys[i]]
        }
    }
}