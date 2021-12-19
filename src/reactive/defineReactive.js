import { observer } from './observer'
import { Dep } from './watch'

export function defineReactive(obj, key, value) {
    value = value || obj[key]
    var dep = new Dep()
    var ob = observer(value)
    Object.defineProperty(obj, key, {
        get: function () {
            dep.depend()
            if (ob) {
                ob.dep.depend()
                if (value.constructor === Array) dependArray(value)
            }
            return value
        },
        set: function (newValue) {
            if (newValue === value) return
            value = newValue
            ob = observer(newValue)
            dep.notify()
        }
    })
}

function dependArray(array) {
    for (var i = 0; i < array.length; i++) {
        array[i] && array[i].__ob__ && array[i].__ob__.dep.depend()
        if (array[i].constructor === Array) dependArray(array[i])
    }
}