import { isRef } from './utils'
import { effect } from './effect'

function watch(getter: any, func: Function): Function {
    let _value = isRef(getter) ? getter.value : getter()

    let effectFn: any = effect(() => isRef(getter) ? getter.value : getter(), {
        scheduler: (effect: any, value: any) => {
            func(value, _value)
            _value = value
        }
    })
    const deps = effectFn.deps
    return function () {
        deps.delete(effectFn)
        effectFn = null
        _value = null
    }
}

export { watch }