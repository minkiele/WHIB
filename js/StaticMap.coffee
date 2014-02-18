`
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['URI', 'module'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('URI'), module);
    } else {
        // Browser globals (root is window)
        root.StaticMap = factory(root.URI, {});
    }
}(this, function (URI, module) {
`
getConfigKey = ->
  if typeof module?.config is 'function'
    config = module.config()
    return if config?.key? then config.key

class StaticMap
  BASE_URL = 'http://maps.googleapis.com/maps/api/staticmap'
  constructor: (@sensor = no, @key = getConfigKey()) ->
    @uri = URI(BASE_URL).addSearch
      sensor: if @sensor then "true" else "false"
    if @key? then @uri.addSearch
      key: @key
    @markers = []
    @params = {}
  setSize: (@width, @height = null) ->
    if not @height? then @height = @width
    @uri.addSearch
      size: "#{@width}x#{@height}"
  setCenter: (@center) ->
    @uri.addSearch
      center: if typeof @center is 'string' then @center else "#{@center.lat()},#{@center.lng()}"
  addMarker: (marker) ->
    @markers.push marker
    @uri.addSearch
      markers: ((
        merged = []
        if marker.style? then merged.push (("#{key}:#{value}" for key, value of marker.style).join '|')
        if marker.positions? then merged.push(if typeof value is 'string' then value else "#{value.lat()},#{value.lng()}") for value in marker.positions
        merged
      ).join '|') for marker in @markers
  set: (key, value) ->
    @uri.addSearch key, value
  getUrl: () ->
    @uri.toString()

return StaticMap

`
}));
`
