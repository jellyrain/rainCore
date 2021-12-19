import { map } from '../tool/main'

export var internalFront = '{{', internalBack = '}}', internalHeader = 'r'
var isConversion = false

export function setContentReplacementTags(front, back) {
    internalFront = front
    internalBack = back
}

export function setInstructionHeader(header) {
    internalHeader = header
}

export function content(str) {
    if (!isConversion) {
        conversion()
        isConversion = true
    }
    var rsg = new RegExp(internalFront + '.+' + internalBack)
    return rsg.test(str)
}
export function instruction(str) {
    var rsg = new RegExp(internalHeader + '\-')
    return rsg.test(str)
}

function conversion() {
    internalFront = map(internalFront.split(''), function (item) {
        return '\\' + item
    }).join('')
    internalBack = map(internalBack.split(''), function (item) {
        return '\\' + item
    }).join('')
}