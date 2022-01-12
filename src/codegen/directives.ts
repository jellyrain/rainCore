import { NodeTypes } from '../compiler/ast'
import { createText, resolveElementASTNode, createTextVNode } from './codegen'
import { capitalize } from './utils'

/* 解析 普通指令 */
function createDirectives(directives: any, node: any): any[] {
    const resultDirectives = directives.map((directive: any) => {
        switch (directive.name) {
            case 'bind':
                return `${directive.arg.content}: ${createText(directive.exp)}`
            case 'on':
                let exp = directive.exp.content
                let result = directive.exp.content
                /* 支持 加减乘除 简单运算表达式 */
                if (/(\+|\-|\*|\/)/.test(exp) && !exp.includes('=>') && !exp.includes('function')) result = `$event => (${exp})`

                /* 支持传递参数版本 */
                if (/\([^\)]*?\)$/.test(exp)) if (!/^(\$event)/.test(result)) result = `$event => (${exp})`

                return `on${capitalize(directive.arg.content)}: ${result}`
            default:
                return `${directive.name}: ${createText(directive.exp)}`
        }
    })
    return resultDirectives
}

/* 解析 特殊指令 */
/* 解析 if else-if else */
function directiveIf(ifNode: any, node: any, parent: any): any {
    const { exp } = ifNode
    /* if */
    const consequent: any = resolveElementASTNode(node, parent)
    /* else */
    let alternate: any
    const { children } = parent
    /* 寻找 else-if else */
    let index = children.findIndex((child: any) => child === node) + 1
    for (let i = index; i < children.length; i++) {
        /* 获取当前 node */
        const sibling = children[i]
        /* 删除 空白 文本节点 */
        if (sibling.type === NodeTypes.TEXT && !sibling.content.trim()) {
            children.splice(i, 1)
            i--
            continue
        }
        /* 解析 else-if else */
        if (sibling.type === NodeTypes.ELEMENT && (pluck(sibling.directives, 'else') || pluck(sibling.directives, 'else-if', false))) {
            alternate = resolveElementASTNode(sibling, parent)
            children.splice(i, 1)
        }
        break
    }
    return `${exp.content} ? ${consequent} : ${alternate || createTextVNode()}`
}

/* 解析 for */
function directiveFor(forNode: any, node: any): any {
    const { exp } = forNode
    /* 允许 in of */
    const [args, source] = exp.content.split(/\sin\s|\sof\s/)
    return `h(Fragment, null, renderList(${source.trim()}, ${args.trim()} => ${resolveElementASTNode(node)}))`
}

/* 解析 model */
function directiveModel(modelNode: any, node: any): any {
    node.directives.push(
        {
            type: NodeTypes.DIRECTIVE,
            name: 'bind',
            exp: modelNode.exp,
            arg: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: 'value',
                isStatic: true,
            },
        },
        {
            type: NodeTypes.DIRECTIVE,
            name: 'on',
            exp: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: `($event) => ${modelNode.exp.content} = $event.target.value`,
                isStatic: false,
            },
            arg: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: 'input',
                isStatic: true,
            },
        }
    )
}

/* 查找特殊指令 并 返回 且 决定是否 删除 */
function pluck(directives: any[], name: string, remove: boolean = true) {
    const index = directives.findIndex(directive => directive.name === name)
    const directive = directives[index]
    if (index > -1 && remove) directives.splice(index, 1)
    return directive
}

export { createDirectives, pluck, directiveIf, directiveFor, directiveModel }