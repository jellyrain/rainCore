/* 更新队列 */
const queue: any = []
/* 是否正在更新 */
let isFlushing = false
/* 使用微任务更新 */
const resolePromise = Promise.resolve()
let currentFlushingPromise: Promise<void> | null = null

/* 给队列添加事件 */
function queueJob(job: any) {
    if (!queue.length || !queue.includes(job)) {
        queue.push(job)
        queueFlushJob()
    }
}

/* 在微任务中执行事件 */
function queueFlushJob() {
    if (!isFlushing) {
        isFlushing = true
        currentFlushingPromise = resolePromise.then(flushJobs)
    }
}

function flushJobs() {
    try {
        for (let i = 0; i < queue.length; i++) {
            queue[i]()
        }
    } finally {
        queue.length = 0
        currentFlushingPromise = null
        isFlushing = false
    }
}

/* 将回调推迟到下一个 DOM 更新周期之后执行 */
function nextTick(func: Function) {
    const p = currentFlushingPromise || resolePromise
    return func ? p.then(func as any) : p
}

export { queueJob, nextTick }