import { advanceBy, isEnd, textData, advanceSpaces, camelize } from './utils'
import { createRoot, createParserContext, astContext, NodeTypes, ElementTypes } from './ast'

/* 模板解析器 */
function parse(template: string) {
    const context = createParserContext(template)
    return createRoot(parseChildren(context))
}

/* 解析孩子 */
function parseChildren(context: astContext) {
    const nodes = []

    while (!isEnd(context)) {
        const template = context.source
        let node: any
        /* 开头是否是 插值标识符 */
        if (template.startsWith(context.options.delimiters[0])) {
            node = parseInterpolation(context)

            /* 开头是否是 < */
        } else if (template.startsWith('<')) {
            node = parseElement(context)

            /* 文本节点 */
        } else {
            node = parseText(context)
        }
        nodes.push(node)
    }

    /* 优化 空格 和 换行 */
    /* 是否删除文本节点开关 */
    let removedWhitespace = false;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        /* 判断是否是文本节点 */
        if (node.type === NodeTypes.TEXT) {
            /* 判断是否此文本节点为空 */
            if (!/[^\t\r\n\f ]/.test(node.content)) {
                const prev = nodes[i - 1]
                const next = nodes[i + 1]
                /* 前一个节点为空 或 后一个节点为空 或 前后都是元素节点且本节点有换行符 则删除本节点 否则 压缩空格 */
                if (!prev || !next || (prev.type === NodeTypes.ELEMENT && next.type === NodeTypes.ELEMENT && /[\r\n]/.test(node.content))) {
                    removedWhitespace = true
                    nodes[i] = null
                } else {
                    node.content = ' '
                }
            } else {
                /* 不为空 压缩空格 */
                node.content = node.content.replace(/[\t\r\n\f ]+/g, ' ')
            }
        }
    }
    return removedWhitespace ? nodes.filter(Boolean) : nodes
}

/* 解析插值语法 */
function parseInterpolation(context: astContext) {
    /* 拿出插值标识符 */
    const [open, close] = context.options.delimiters
    /* 删除左插值符 */
    advanceBy(context, open.length)
    /* 取出内容并删除模板内对应数据 */
    const closeIndex = context.source.indexOf(close)
    const content = textData(context, closeIndex).trim()
    /* 删除右插值符 */
    advanceBy(context, close.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content,
            isStatic: false,
        }
    }
}

/* 解析元素 */
function parseElement(context: astContext) {
    /* 解析元素 */
    const element: any = parseTag(context)
    /* 如果是自闭合标签 直接返回 */
    if (element.isSelfClosing || context.options.isVoidTag(element.tag)) return element
    /* 解析孩子 */
    element.children = parseChildren(context)
    /* 解析结束标签 但是不做收集 */
    parseTag(context)

    return element
}

/* 解析元素标签 */
function parseTag(context: astContext) {
    const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)
    /* 读取元素标签 */
    const tag = match![1]
    /* 删除 标签 接下来的空格 */
    advanceBy(context, match![0].length)
    advanceSpaces(context)
    /* 获取标签类型 原生 还是 组件 */
    const tagType = context.options.isNativeTag(tag) ? ElementTypes.ELEMENT : ElementTypes.COMPONENT
    /* 解析 属性 和 指令 */
    const { props, directives } = parseAttributes(context)
    /* 判断是否是自闭合标签 */
    const isSelfClosing = context.source.startsWith('/>')
    /* 删除结束 > 或者 /> */
    advanceBy(context, isSelfClosing ? 2 : 1)

    return {
        type: NodeTypes.ELEMENT,
        tag,
        tagType,
        props,
        directives,
        isSelfClosing,
        children: [],
    }
}

/* 解析元素标签属性 */
function parseAttributes(context: astContext) {
    const props: any = [], directives: any = []
    /* 解析 属性 合 指令 */
    while (context.source.length && !context.source.startsWith('>') && !context.source.startsWith('/>')) {
        let attr = parseAttribute(context)
        attr.type === NodeTypes.DIRECTIVE ? directives.push(attr) : props.push(attr)
    }
    return { props, directives }
}

/* 解析单个属性 */
function parseAttribute(context: astContext) {
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
    /* 获取 属性 活 指令 名 */
    const name = match![0]
    advanceBy(context, name.length)
    advanceSpaces(context)

    /* 获取 属性 或 指令 对应的值 */
    let content: any
    if (context.source[0] === '=') {
        advanceBy(context, 1)
        advanceSpaces(context)
        content = parseAttributeValue(context)
        advanceSpaces(context)
    }

    /* 是否是 指令 */
    if (/^(r-|@|:)/.test(name)) {
        let dirName: any, argContent: any

        if (name[0] === ':') {
            dirName = 'bind'
            argContent = name.slice(1)
        }

        if (name[0] === '@') {
            dirName = 'on'
            argContent = name.slice(1)
        }

        if (name.startsWith('r-')) {
            [dirName, argContent] = name.slice(2).split(':')
        }

        /* 返回 指令 */
        return {
            type: NodeTypes.DIRECTIVE,
            name: dirName,
            arg: argContent && {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: camelize(argContent),
                isStatic: true,
            },
            exp: content && {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: content,
                isStatic: false,
            }
        }
    }

    /* 返回 属性 */
    return {
        type: NodeTypes.ATTRIBUTE,
        name,
        value: content && {
            type: NodeTypes.TEXT,
            content: content,
        }
    }
}

/* 解析单个属性对应的值 */
function parseAttributeValue(context: astContext) {
    /* 获取是 单引号 还是 双引号 */
    const quote = context.source[0]
    advanceBy(context, 1)
    const endIndex = context.source.indexOf(quote)
    /* 获取内容 */
    const content = textData(context, endIndex)
    advanceBy(context, 1)

    return content
}

/* 解析文本 */
function parseText(context: astContext) {
    const { delimiters } = context.options
    /* < < > 判断正则 */
    const lessRegexp = /\<[^\<\>]+(\<[^\<\>]+\>)/
    /* 插值 {{ {{ }} 判断正则 */
    const interpolation = new RegExp(`${delimiters[0]}[^${delimiters[0]}${delimiters[1]}]+(${delimiters[0]}[^${delimiters[0]}${delimiters[1]}]+${delimiters[1]})`)
    /* 结束长度 */
    let endIndex = context.source.length

    /* 
        判断 文本节点中是否带 < 
        如果有 就找最先满足 < > 的位置
        没有 就直接找最先的 < 
    */
    /* 对比是否小于 结束长度 并替换 */
    if (lessRegexp.test(context.source)) {
        const index = context.source.indexOf(lessRegexp.exec(context.source)![1])
        if (index !== -1 && endIndex > index) endIndex = index
    } else {
        const index = context.source.indexOf('<')
        if (index !== -1 && endIndex > index) endIndex = index
    }

    /* 
        判断 文本节点中是否带 左插值 
        如果有 就找最先满足 完整插值 的位置 
        没有 就直接找最先的 左插值 
    */
    /* 对比是否小于 结束长度 并替换 */
    if (interpolation.test(context.source)) {
        const index = context.source.indexOf(interpolation.exec(context.source)![1])
        if (index !== -1 && endIndex > index) endIndex = index
    } else {
        const index = context.source.indexOf(delimiters[0])
        if (index !== -1 && endIndex > index) endIndex = index
    }
    const content = textData(context, endIndex)

    return {
        type: NodeTypes.TEXT,
        content
    }
}

export { parse }