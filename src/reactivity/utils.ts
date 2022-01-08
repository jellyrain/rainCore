/* reactive 响应式标识 */
export const IS_REACTIVE: string = '__isReactive'
/* reactive 响应式标识 */
export const IS_REF: string = '__isRef'
/* 代理前对象标识 */
export const RAW: string = '__raw'

/* 判断是否是对象 */
export function isObject(target: any) {
    return typeof target === 'object' && target != null
}

/* 判断是否是数组 */
export function isArray(target: any) {
    return Array.isArray(target)
}

/* 判断是否是函数 */
export function isFunction(target: any) {
    return typeof target === 'function' && target != null
}

/* 判断是否是 reactive 响应式对象 */
export function isReactive(target: any) {
    return !!(target && target[IS_REACTIVE])

}

/* 判断是否是 ref 响应式对象 */
export function isRef(value: any) {
    return !!(value && value[IS_REF])
}

/* 判断两个值是否一致 */
export function hasChanged(oldValue: any, newValue: any) {
    return oldValue !== newValue && !(Number.isNaN(oldValue) || Number.isNaN(newValue))
}