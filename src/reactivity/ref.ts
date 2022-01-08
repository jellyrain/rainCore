import { isObject, isRef, hasChanged } from './utils'
import { reactive } from './reactive'
import { track, trigger } from './effect'

function ref(value: any) {
    /* 是否已经是响应式对象 如果是直接返回 */
    if (isRef(value)) return value
    /* 创建响应式对象 */
    return new refImpl(value)
}

class refImpl {
    private __rawValue: any
    private __isRef: boolean
    private _value: any
    /* 
        都是基础类型  __rawValue 和 _value 相等
        如果是对象 
            __rawValue：原始对象
            _value：响应式对象
    */
    constructor(value: any) {
        this.__isRef = true
        this.__rawValue = value
        this._value = convert(value)
    }

    get value() {
        /* 收集依赖 */
        track(this, 'value')
        /* 返回值 */
        return this._value
    }

    set value(value) {
        if (hasChanged(this._value, value)) {
            /* 更新数据 */
            this._value = convert(value)
            this.__rawValue = value
            /* 触发依赖 */
            trigger(this, 'value', value)
        }
    }
}

function convert(value: any) {
    return isObject(value) ? reactive(value) : value
}

/* 自动判断是否是 ref 并且获取值 不是 旧返回参数 */
function unRef(ref: any) {
    return isRef(ref) ? ref.value : ref;
}

export { ref, unRef }