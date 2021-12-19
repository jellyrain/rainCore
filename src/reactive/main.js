export { observer } from './observer'
import { Watch } from './watch'
import { uid } from '../tool/main'

var watches = {}
export function watch(data, key, callback) {
    var w = new Watch(data, key, callback)
    var id = uid(8)
    watches[id] = w
    return id
}

export function remove(id) {
    if (id) {
        watches[id].remove()
        delete watches[id]
    } else {
        for (key in watches) {
            watches[key].remove()
        }
        watches = {}
    }
}