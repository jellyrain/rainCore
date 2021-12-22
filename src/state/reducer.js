import { getAllState } from './state'

var allReducer = {}

export function dispatch(key, callback) {
    allReducer[key] = callback
}

export function commit(key) {
    allReducer[key](getAllState())
}
