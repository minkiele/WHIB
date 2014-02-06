define (require, exports, module) ->
  URI = require 'URI'
  class StaticMap
    BASE_URL = 'http://maps.googleapis.com/maps/api/staticmap'
    constructor: (@sensor = no) ->
      @GMAPS_KEY = module.config().key
      @uri = URI(BASE_URL).addSearch
        sensor: if @sensor then "true" else "false"
      .addSearch
        key: @GMAPS_KEY
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
  exportsStaticMap