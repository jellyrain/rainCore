import { vNode, isString, isNumber, isArray, ShapeFlags, vNodeType, Fragment, Text, isObject } from './utils'

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

    return { type, props, children, shapeFlag, elm: null, anchor: null, key: props && (props as any).key, component: null }
}

/* render 返回值 二次处理 */
function normalizeVNode(result: any) {
    /* 数组 用 Fragment 包起来 */
    if (Array.isArray(result)) {
        return h(Fragment, null, result as any);
    }
    /* 对象 直接返回 */
    if (isObject(result)) {
        return result;
    }
    /* 字符串 或 数组 文Text 包起来 */
    return h(Text, null, result.toString());
}

export { h, normalizeVNode }