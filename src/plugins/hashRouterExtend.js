import { hash, route, routeJump } from '../router/hashRouter'
import { patch } from '../diff/main'
import { parser } from '../parser/main'
import { astToVDom } from './astToVDom'
import { contentReplacement } from './contentParser'

export function hashRouterExtend() {
    this.init()

}

hashRouterExtend.prototype.init = function () {
    this.template = {}
    this.routeProps = {}
    this.interceptorsBefore = []
    this.interceptorsAfter = []
    window.onload = function () {
        hash()
    }
}

hashRouterExtend.prototype.bind = function (OldVDom, data) {
    this.vDom = OldVDom
    this._data = data
}

hashRouterExtend.prototype.route = function (routeData) {
    this.template[routeData.path] = routeData.template
    route({
        path: routeData.path,
        callback: callbackFunc(this)
    })
    return this
}

function callbackFunc(self) {
    return function () {
        var path = location.hash.slice(1) || '/'
        var template = self.template[path], routeProps = self.routeProps[path], data = self._data
        for (var i = 0; i < self.interceptorsBefore.length; i++) {
            self.interceptorsBefore[i](template, routeProps, data)
        }
        if (template) {
            var parse = parser(template)
            if (data) contentReplacement(data, parse.mapperContentAst)
            var vDom = astToVDom(parse.ast)
            patch(self.vDom, vDom)
            self.vDom = vDom
        }
        for (var i = 0; i < self.interceptorsAfter.length; i++) {
            self.interceptorsAfter[i](template, routeProps, data)
        }
    }
}

hashRouterExtend.prototype.routeJump = function (path, data, callback) {
    if (typeof data === 'function') callback = data, data = undefined
    callback(path, data)
    this.routeProps[path] = data
    routeJump(path)
}

hashRouterExtend.prototype.routeProp = function () {
    var path = location.hash.slice(1) || '/'
    return this.routeProps[path]
}

hashRouterExtend.prototype.before = function (callback) {
    this.interceptorsBefore.push(callback)
    return this
}
hashRouterExtend.prototype.after = function (callback) {
    this.interceptorsAfter.push(callback)
    return this
}


