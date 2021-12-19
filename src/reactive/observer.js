import { defineReactive } from './defineReactive'
import { Dep } from './watch'

export function observer(data) {
    if (typeof data !== 'object') return
    var ob = data.__ob__ && data.__ob__ instanceof Observer ? data.__ob__ : new Observer(data)
    return ob
}

function Observer(data) {
    this._data = data
    this.def()
    if (this._data.constructor === Array) {
        this.proxyPrototype()
        this.array()
    } else {
        this.walk()
    }
}

Observer.prototype.walk = function () {
    for (var key in this._data) {
        defineReactive(this._data, key)
    }
}

Observer.prototype.array = function () {
    for (var i = 0; i < this._data.length; i++) {
        observer(this._data[i])
    }
}

Observer.prototype.proxyPrototype = function () {
    var arrayPrototype = Array.prototype
    var arrayMethod = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']
    var prototype = {}
    prototype.__proto__ = arrayPrototype
    for (var i = 0; i < arrayMethod.length; i++) {
        (function (method) {
            Object.defineProperty(prototype, method, {
                value: function () {
                    var result = arrayPrototype[method].apply(this, arguments)
                    if (method === 'push' || method === 'unshift') this.__ob__.array(arguments)
                    if (method === 'splice') this.__ob__.array(arguments.slice(2))
                    this.__ob__.dep.notify()
                    return result
                },
                enumerable: false,
                writable: true,
                configurable: true
            })
        })(arrayMethod[i])
    }
    this._data.__proto__ = prototype
}

Observer.prototype.def = function () {
    this.dep = new Dep()
    Object.defineProperty(this._data, '__ob__', {
        value: this,
        enumerable: false,
        writable: true,
        configurable: true
    })
}