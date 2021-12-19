import { content, instruction } from './mapper'

var stack = [], mapperContentAst = [], mapperInstructionAst = []

export function parser(template) {
    template = removeSpace(template)
    while (template.length) {
        if (/(^\<[^\/][^\<\>]*[^\/]\>)|(^\<.\>)/.test(template)) {
            var el = generateAST(template.match(/(^\<[^\/][^\<\>]*[^\/]\>)|(^\<.\>)/)[0])
            stack.push(el)
            template = template.replace(/(^\<[^\/][^\<\>]*[^\/]\>)|(^\<.\>)/, '')
            continue
        }
        if (/^\<[^\/][^\<\>]*\/\>/.test(template)) {
            var el = generateAST(template.match(/^\<[^\/][^\<\>]*\/\>/)[0])
            if (stack.length > 1) {
                stack[stack.length - 1].children.push(el)
            } else {
                stack.push(el)
            }
            template = template.replace(/^\<[^\/][^\<\>]*\/\>/, '')
            continue
        }
        if (/^[^\<]+</.test(template)) {
            var text = template.match(/^[^\<]+</)
            if (text != undefined) {
                if (content(text)) mapperContentAst.push(stack[stack.length - 1])
                text = text[0].slice(0, -1)
                stack[stack.length - 1].text = text
                template = template.replace(/^[^\<]+</, '<')
            }
            continue
        }
        if (/^\<\/[^\<\>]+\>/.test(template)) {
            if (stack.length > 1) {
                var el = stack.pop()
                stack[stack.length - 1].children.push(el)
            }
            template = template.replace(/^\<\/[^\<\>]+\>/, '')
            continue
        }
    }
    return {
        ast: stack[0],
        mapperContentAst: mapperContentAst,
        mapperInstructionAst: mapperInstructionAst
    }
}

function generateAST(str) {
    var tag = str.replace(/\<|\>/g, '')
    var obj = {
        children: [],
        text: undefined,
    }
    obj.sel = tag.match(/^\w+/)[0]
    obj.data = attributes(tag, obj)
    var path = []
    for (var i = 0; i < stack.length; i++) {
        path.push(stack[i].children.length)
    }
    obj.path = path
    return obj
}

function attributes(tag, el) {
    var obj = {}, mapper = false
    tag = tag.replace(/\s*\//, '')
    var attr = tag.replace(/^\w+(\s+)?/, '').replace(/(\'|\")\s+/g, '=').replace(/(\'|\")/g, '')
    if (attr === '' || attr == undefined) return obj
    attr = attr.split('=')
    for (var i = 0; i < attr.length; i += 2) {
        if (instruction(attr[i])) mapper = true
        obj[attr[i]] = attr[i + 1]
    }
    if (mapper) mapperInstructionAst.push(el)
    return obj
}

function removeSpace(template) {
    var temp = template.trim()
    var rsg = /\>(\s+)\</g
    temp = temp.replace(rsg, '><',)
    return temp
}