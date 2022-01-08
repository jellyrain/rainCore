import { IS_REACTIVE, RAW, isObject, isArray, isReactive, hasChanged } from './utils'
import { track, trigger } from './effect'

/* 保存响应式对象 */
const reactiveMap = new WeakMap()

function reactive(target: any) {
    /* 如果不是对象直接返回 */
    if (!isObject(target)) return target
    /* 是否已经是响应式对象 如果是直接返回 */
    if (isReactive(target)) return target
    /* 如果对象已经做过响应式 就直接返沪响应式对象 */
    if (reactiveMap.has(target)) return reactiveMap.get(target)
    /* 创建响应式对象 */
    return createReactiveObject(target)
}

/* 提供一个响应式对象，返回原始对象 */
function toRaw(target: any) {
    if (isReactive(target)) return target[RAW]
}

function createReactiveObject(target: any) {
    const raw = target
    const proxy: any = new Proxy(target, {
        get(target, key, receiver) {
            /* 判断是否是响应式对象 */
            if (key === IS_REACTIVE) return true
            /* 获取原对象 */
            if (key === RAW) return raw

            const result = Reflect.get(target, key, receiver)
            /* 收集依赖 */
            track(target, key)
            /* 返回值 */
            return isObject(result) ? reactive(result) : result
        },
        set(target, key, value, receiver) {
            /* 获取旧值 */
            const oldValue = target[key]
            const oldLength = target.length

            const result = Reflect.set(target, key, value, receiver)
            /* 判断新值和旧值是否不一样 */
            if (hasChanged(oldValue, value)) {
                /* 触发依赖 */
                trigger(target, key, value)
                /* 如果是数组 判断是否依赖长度 是 判断是否改变 改变触发依赖 */
                if (isArray(target) && target.length !== oldLength) trigger(target, 'length')
            }
            return result
        }
    })
    /* 添加记录 */
    reactiveMap.set(target, proxy)
    return proxy
}

export { reactive, toRaw }