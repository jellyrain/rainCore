import { isNativeTag, isVoidTag } from './utils'

/* 节点类型 */
enum NodeTypes {
    /* 根节点 */
    ROOT = 'ROOT',
    /* 元素节点 */
    ELEMENT = 'ELEMENT',
    /* 文本节点 */
    TEXT = 'TEXT',
    /* 表达式节点 */
    SIMPLE_EXPRESSION = 'SIMPLE_EXPRESSION',
    /* 插值节点 */
    INTERPOLATION = 'INTERPOLATION',
    /* 属性节点 */
    ATTRIBUTE = 'ATTRIBUTE',
    /* 指令节点 */
    DIRECTIVE = 'DIRECTIVE'
}

/* 元素类型 */
enum ElementTypes {
    /* 元素 */
    ELEMENT = 'ELEMENT',
    /* 组件 */
    COMPONENT = 'COMPONENT'
}

/* 模板上下文 类型 */
type astContext = {
    options: {
        delimiters: string[];
        isNativeTag: (value: string) => boolean;
        isVoidTag: (value: string) => boolean;
    };
    source: string;
}

/* 创建解析模板上下文 */
function createParserContext(template: string): astContext {
    return {
        options: {
            delimiters: ['{{', '}}'],
            isNativeTag,
            isVoidTag
        },
        source: template
    }
}

/* 创建 root 节点 */
function createRoot(children: any) {
    return {
        type: NodeTypes.ROOT,
        children,
    }
}

export { createParserContext, createRoot, astContext, NodeTypes, ElementTypes }