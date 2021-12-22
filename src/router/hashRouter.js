var hashRoutes = {}

export function hash() {
    window.onhashchange = function () {
        hashChange()
    }
}

export function route(route) {
    hashRoutes[route.path] = route
}

export function routeJump(path) {
    location.hash = '#' + path
}

function hashChange() {
    var path = location.hash.slice(1) || '/'
    hashRoutes[path].callback && hashRoutes[path].callback()
}