import { vNode, isString, isNumber, isArray, ShapeFlags, vNodeType } from './utils'

function h(type: string | Symbol | object, props: object | null, children: string | number | [] | null): vNode {
    let shapeFlag: number = vNodeType(type)

    /* 判断 孩子 是否是 字符串 或者 数字 */
    if (isString(children) || isNumber(children)) {
        /* 用位或运算整合 */
        shapeFlag |= ShapeFlags.TEXT_CHILDREN
        children = children!.toString()
    }

    /* 判断 孩子 是否是 数组 */
    if (isArray(children)) {
        /* 用位或运算整合 */
        shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    return { type, props, children, shapeFlag, elm: null, anchor: null }
}

export { h }