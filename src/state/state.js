var allState = {}

export function addState(state) {
    for (var key in state) {
        allState[key] = state[key]
    }
}

export function getAllState() {
    return allState
}

export function setState(key, value) {
    allState[key] = value
}