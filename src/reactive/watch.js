import { lookup, indexOf, uid } from '../tool/main'

var watch, targetStack = []

function pushTarget(_target) {
    targetStack.push(watch)
    watch = _target
}
function popTarget() {
    watch = targetStack.pop()
}

export function Watch(data, key, callback) {
    this.data = data
    this.key = key
    this.callback = callback
    this.deps = {}
    this.value = this.get()
}

Watch.prototype.get = function () {
    pushTarget(this)
    var value = lookup(this.data, this.key)
    popTarget()
    return value
}

Watch.prototype.addDep = function (dep) {
    if (!(dep.id in this.deps)) {
        this.deps[dep.id] = dep
        dep.addSub(watch)
    }
}

Watch.prototype.update = function () {
    var oldValue = this.value
    this.value = lookup(this.data, this.key)
    this.callback(this.value, oldValue, this.data)
}

Watch.prototype.remove = function () {
    for (var key in this.deps) {
        this.deps[key].removeSub()
    }
}

export function Dep() {
    this.id = uid(8)
    this.subs = []
}

Dep.prototype.addSub = function (sub) {
    this.subs.push(sub)
}

Dep.prototype.depend = function () {
    if (watch) watch.addDep(this)
}

Dep.prototype.notify = function () {
    for (var i = 0; i < this.subs.length; i++) {
        this.subs[i].update()
    }
}
Dep.prototype.removeSub = function (sub) {
    var index = indexOf(this.addSub, sub)
    if (index > -1) this.subs.splice(index, 1)
}