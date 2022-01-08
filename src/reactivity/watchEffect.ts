import { effect } from './effect'

/* 返回一个函数 调用 停止监听 */
function watchEffect(func: Function): Function {
    let effectFn: any = effect(func)
    const deps = effectFn.deps
    return function () {
        deps.delete(effectFn)
        effectFn = null
    }
}

export { watchEffect }