import { track, trigger, effect } from './effect'
import { isFunction } from './utils'

function computed(getterOrOptions: any): ComputedRefImpl {
    let getter, setter;
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions
        setter = () => {
            console.warn('Write operation failed: computed value is readonly')
        }
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl {
    private _setter: Function
    private _value: any
    private _dirty: boolean
    private effect: any
    constructor(getter: Function, setter: Function) {
        this._setter = setter
        /* 缓存结果 */
        this._value = undefined
        /* 判断依赖值是否改变 */
        this._dirty = true
        /* 监听依赖变化 */
        this.effect = effect(getter, {
            lazy: true,
            scheduler: () => {
                if (!this._dirty) {
                    this._dirty = true
                    /* 触发依赖 */
                    trigger(this, 'value', this._value)
                }
            }
        })
    }

    get value() {
        if (this._dirty) {
            this._value = this.effect()
            this._dirty = false
            /* 收集依赖 */
            track(this, 'value')
        }
        return this._value
    }

    set value(value) {
        this._setter(value)
    }
}

export { computed }