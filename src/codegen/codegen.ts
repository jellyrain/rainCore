import { NodeTypes, ElementTypes } from '../compiler/ast'
import { createDirectives, pluck, directiveIf, directiveFor, directiveModel } from './directives'

/* 生成 render 渲染函数 */
function generate(ast: any) {
    return `
    const { h, Text, Fragment, renderList, resolveComponent } = rainCore
        with(ctx) {
            return ${traverseNode(ast)}
        }
   `
}

/* 解析 ast 和 指令 生成 渲染函数 */
function traverseNode(node: any, parent?: any) {
    switch (node.type) {
        case NodeTypes.ROOT:
            return createChildrenVNode(node)
        case NodeTypes.ELEMENT:
            return resolveElementASTNode(node, parent)
        case NodeTypes.INTERPOLATION:
            return createInterpolationVNode(node)
        case NodeTypes.TEXT:
            return createTextVNode(node)
    }
}

/* 处理 特殊指令 */
function resolveElementASTNode(node: any, parent?: any) {
    /* 解析 if else-if else */
    const ifNode = pluck(node.directives, 'if') || pluck(node.directives, 'else-if')
    if (ifNode) return directiveIf(ifNode, node, parent)
    /* 解析 model */
    const modelNode = pluck(node.directives, 'model')
    if (modelNode) directiveModel(modelNode, node)
    /* 解析 for */
    const forNode = pluck(node.directives, 'for')
    if (forNode) return directiveFor(forNode, node)

    return createElementVNode(node)
}


/* 生成元素节点 渲染函数 */
function createElementVNode(node: any) {
    /* 获取标签名 */
    const tag = node.tagType === ElementTypes.ELEMENT ? `"${node.tag}"` : `resolveComponent("${node.tag}")`

    /* 解析属性和指令 */
    const propsArr = createPropsArr(node)
    const props = propsArr.length ? `{ ${propsArr.join(', ')} }` : null
    /* 解析孩子 */
    const children = node.children.length ? createChildrenVNode(node) : null
    return `h(${tag}, ${props}, ${children})`
}

/* 解析 属性 和 指令 */
function createPropsArr(node: any) {
    const { props, directives } = node
    return [
        /* 解析 属性 */
        ...props.map((prop: any) => `${prop.name}: ${createText(prop.value)}`),
        /* 解析指令 */
        ...createDirectives(directives, node)
    ]
}

/* 生成孩子节点 渲染函数 */
function createChildrenVNode(node: any): string {
    const { children } = node
    const result = []
    for (let i = 0; i < children.length; i++) {
        result.push(traverseNode(children[i], node))
    }
    return `[${result.join(', ')}]`
}

/* 生成插值节点 渲染函数 */
function createInterpolationVNode(node: any) {
    return `h(Text, null, ${createText(node.content)})`
}

/* 生成文本节点 渲染函数 */
function createTextVNode(node?: any) {
    return `h(Text, null, ${createText(node)})`
}

/* 生成 静态文本 还是 表达式 */
function createText({ isStatic = true, content = '' } = {}) {
    return isStatic ? JSON.stringify(content) : content
}

export { generate, createText, resolveElementASTNode, createTextVNode }