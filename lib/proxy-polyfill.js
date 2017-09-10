window.Proxy = function(target, proxyHandler) {
  this.__target = target
  this.__proxyHandler = proxyHandler
}
function registerPropertyName(name) {
  Object.defineProperty(Proxy.prototype, name, {
    get: function() {
      return this.__proxyHandler.get(this.__target, name, this)
    },
    set: function(value) {
      this.__proxyHandler.get(this.__target, name, value, this)      
    }
  })
}
Proxy.registerPropertyNames = function() {
  for (var i = 0, l = arguments.length; i < l; i++) {
    registerPropertyName(arguments[i])
  }
}