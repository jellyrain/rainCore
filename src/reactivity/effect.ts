const effectStack: any = []
/* 暴露依赖 */
let activeEffect: any

function effect(func: Function, options: any = {}): Function {
    const effectFn = () => {
        try {
            effectStack.push(effectFn)
            activeEffect = effectFn
            return func()
        } finally {
            effectStack.pop()
            activeEffect = effectStack[effectStack.length - 1]
        }
    }
    /* 是否先执行一次 */
    if (!options.lazy) effectFn()

    effectFn.scheduler = options.scheduler

    return effectFn
}

/* 收集依赖 */
const targetMap: WeakMap<object, any> = new WeakMap()

function track(target: any, key: string | symbol): void {
    /* 是否有依赖需要收集 没有直接发返回 */
    if (!activeEffect) return
    /* 
        查找是否有此响应式数据对应的依赖组 
        如果没有为该数据创建 Map 
    */
    let depsMap = targetMap.get(target)
    if (!depsMap) targetMap.set(target, (depsMap = new Map()))
    /* 
        查找是否有此响应式数据内数据的依赖组 
        如果没有为该数据创建 Set 
    */
    let deps = depsMap.get(key)
    if (!deps) depsMap.set(key, (deps = new Set()))
    /* 把用到此数据的依赖挂载到 effectFn 上 提供删除 */
    activeEffect.deps = deps
    /* 添加依赖 */
    deps.add(activeEffect)
}

/* 触发依赖 */
function trigger(target: any, key: string | symbol, value?: any): void {
    const depsMap = targetMap.get(target)
    /* 
        查找是否有此响应式数据对应的依赖组 
        没有就直接返回
    */
    if (!depsMap) return
    /* 
       查找是否有此响应式数据内数据的依赖组 
       没有就直接返回
    */
    const deps = depsMap.get(key)
    if (!deps) return
    /* 触发依赖 */
    deps.forEach((effect: { (): any; scheduler: (effect: any, value: any) => any }) => {
        /* 有调度 scheduler 优先触发 scheduler */
        effect.scheduler ? effect.scheduler(effect, value) : effect()
    })
}

export { effect, track, trigger, targetMap }