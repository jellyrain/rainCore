import { internalFront, internalBack } from '../parser/mapper'
import { lookup } from '../tool/main'

var watchContext, contextAst

export function contentReplacement(data, mapperContentAst) {
    watchContext = {}, contextAst = mapperContentAst
    for (var i = 0; i < mapperContentAst.length; i++) {
        var temp = mapperContentAst[i].text
        temp = temp.replace(new RegExp(internalFront), '').replace(new RegExp(internalBack), '')
        var text = lookup(data, temp)
        if (watchContext[temp]) {
            watchContext[temp].mapper.push(i)
        } else {
            watchContext[temp] = {
                name: temp,
                mapper: [i],
                value: text
            }
        }
        mapperContentAst[i].text = text
    }
}

export function contentUpdate(key, value) {
    if (watchContext[key]) {
        if (watchContext[key].value !== value) {
            var mapper = watchContext[key].mapper
            for (var i = 0; i < mapper.length; i++) {
                contextAst[mapper[i]].text = value
            }
            watchContext[key].value = value
        }
    }
}


