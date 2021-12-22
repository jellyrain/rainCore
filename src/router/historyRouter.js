var historyRoutes = {}

export function History() {
    history.pushState = bindEventListener('pushState')
    window.addEventListener('popstate', function () {
        popstate()
    })
    window.addEventListener('pushState', function () {
        popstate()
    })
}

export function route(route) {
    historyRoutes[route.path] = route
}

export function routeJump(path) {
    history.pushState(null, null, path)
}

function popstate() {
    var path = location.pathname
    historyRoutes[path].callback && historyRoutes[path].callback()
}

function bindEventListener(type) {
    var historyEvent = history[type]
    return function () {
        var newEvent = historyEvent.apply(this, arguments)
        var e = new Event(type)
        e.arguments = arguments
        window.dispatchEvent(e)
        return newEvent
    }
}