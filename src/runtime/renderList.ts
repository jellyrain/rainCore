import { isArray, isNumber, isObject, isString } from './utils'
function renderList(source: any, renderItem: Function) {
    const nodes: any = []
    /* 传入值为 数字 */
    if (isNumber(source)) {
        for (let i = 0; i < source; i++) {
            nodes.push(renderItem(i + 1, i))
        }
        return nodes
    }
    /* 传入值为 数组 或 字符串 */
    if (isArray(source) || isString(source)) {
        for (let i = 0; i < source.length; i++) {
            nodes.push(renderItem(source[i], i))
        }
        return nodes
    }
    /* 传入值为 对象 */
    if (isObject(source)) {
        const keys = Object.keys(source)
        keys.forEach((key, index) => {
            nodes.push(renderItem(source[key], key, index))
        })
        return nodes
    }

    return nodes
}

export { renderList }