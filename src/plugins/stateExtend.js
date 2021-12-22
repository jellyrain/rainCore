import { addState, dispatch, commit } from '../state/main'

export function stateExtend(options) {
    this.init(options)

}

stateExtend.prototype.init = function (options) {
    this.watchReducer = {}
    addState(options.state)
    for (var i = 0; i < options.reducer.length; i++) {
        var reducer = options.reducer[i]
        this.dispatch(reducer.key, reducer.callback)
    }
}

stateExtend.prototype.dispatch = function (key, callback) {
    this.watchReducer[key] = []
    dispatch(key, callback)
    return this
}

stateExtend.prototype.commit = function (key) {
    commit(key)
    for (var i = 0; i < this.watchReducer[key].length; i++) {
        this.watchReducer[key][i]()
    }
}

stateExtend.prototype.subscribe = function (key, callback) {
    this.watchReducer[key] && this.watchReducer[key].push(callback)
    return this
}