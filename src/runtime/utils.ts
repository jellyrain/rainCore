/* vNode 类型 */
export type vNode = {
    /* 类型 */
    type: string | Symbol | object,
    /* 属性 */
    props: object | null,
    /* 孩子 */
    children: string | number | [] | null,
    /* 类型标签 */
    shapeFlag: number,
    /* DOM 节点 */
    elm: HTMLElement | Text | null,
    /* Fragment 专属属性 anchor */
    anchor: Text | null
}

/* vNode 类型判断 使用位运算 可以提高效率 */
export const ShapeFlags = {
    ELEMENT: 1, // 00000001 元素
    TEXT: 1 << 1, // 00000010 文本
    FRAGMENT: 1 << 2, // 00000100 容器
    COMPONENT: 1 << 3, // 00001000 组件
    TEXT_CHILDREN: 1 << 4, // 00010000 string 孩子
    ARRAY_CHILDREN: 1 << 5, // 00100000 数组 孩子
    CHILDREN: (1 << 4) | (1 << 5), //00110000 孩子
}

/* 文本唯一标识 */
export const Text = Symbol('Text')

/* 容器唯一标识 */
export const Fragment = Symbol('Fragment')

/* 判断是否是字符串 */
export function isString(target: any) {
    return typeof target === 'string'
}

/* 判断是否是字符串 */
export function isNumber(target: any) {
    return typeof target === 'number'
}

/* 判断是否是字符串 */
export function isArray(target: any) {
    return Array.isArray(target)
}

/* 判断是否是同类型的vNode */
export function isSameVNode(n1: vNode, n2: vNode) {
    return n1.type === n2.type
}

/* 判断孩子是否都有key */
export function isChildrenKey(c1: [], c2: []) {
    let c1True = 0, c2True = 0
    c1.forEach(c => {
        if (c && c['key'] != null) c1True++
    })
    c2.forEach(c => {
        if (c && c['key'] != null) c2True++
    })
    return c1True === c1.length && c2True === c2.length
}

/* 判断 vNode 类型 */
export function vNodeType(type: string | Symbol | object): number {
    /* 判断是否是标签 */
    if (isString(type)) return ShapeFlags.ELEMENT
    /* 判断是否是文本 */
    if (type === Text) return ShapeFlags.TEXT
    /* 是否是容器 */
    if (type === Fragment) return ShapeFlags.FRAGMENT
    /* 是否是组件 */
    return ShapeFlags.COMPONENT
}

/* dom 属性正则 */
export const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/