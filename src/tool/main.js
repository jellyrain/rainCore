export function lookup(obj, key) {
    var temp = obj
    var keys = key.split('.')
    for (var i = 0; i < keys.length; i++) {
        temp = temp[keys[i]]
    }
    return temp
}

export function indexOf(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (value === array[i]) return i
    }
    return -1
}

export function uid(length) {
    var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = ''
    for (var i = 0; i < length; i++) {
        result += str[Math.floor(Math.random() * (str.length))]
    }
    return result
}

export function map(array, callback) {
    var result = []
    for (var i = 0; i < array.length; i++) {
        result.push(callback(array[i], i, array))
    }
    return result
}