const effectStack: any = []
/* 暴露依赖 */
let activeEffect: Function | null

function watchEffect(func: Function, options: any = {}): Function {
    const effect = () => {
        try {
            effectStack.push(effect)
            activeEffect = effect
            return func()
        } finally {
            effectStack.pop()
            activeEffect = effectStack[effectStack.length - 1]
        }
    }

    if (!options.lazy) effect()

    effect.scheduler = options.scheduler

    return effect
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
    /* 添加依赖 */
    deps.add(activeEffect)
}

/* 触发依赖 */
function trigger(target: any, key: string | symbol): void {
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
    deps.forEach((effect: () => any) => {
        effect()
    })
}

export { watchEffect, track, trigger }