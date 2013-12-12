DEFAULT_ZOOM = 1
DEFAULT_POSITION = new google.maps.LatLng(0, 0)

class window.WHIB
  constructor: (node) ->
    @node = jQuery(node).get 0
    @places = new WHIB.Places()
    @places.fetch()
  createMapObject: (position = DEFAULT_POSITION, zoom = DEFAULT_ZOOM) ->
    def = new jQuery.Deferred()
    if @map?
      def.resolveWith @
    else
      @map = new google.maps.Map @node,
        center: position
        zoom: zoom
        scaleControl: no
        scrollwheel: no
        panControl: no
        mapTypeControl: no
        mapTypeId: google.maps.MapTypeId.ROADMAP
      if not @map? then def.rejectWith @
      else
        @map.addListener 'idle', =>
          def.resolveWith @
    def.done =>
      @map.addListener 'click', (evt) ->
        place = new WHIB.Place
          lat: evt.latlng.lat()
          lng: evt.latlng.lng()
        @places.add place
        undefined
    def.promise()

class WHIB.Place extends Backbone.Model
  getLatLng: ->
  	new google.maps.LatLng @get('lat'), @get 'lng'

class WHIB.Places extends Backbone.Collection
  model: WHIB.Place
  localStorage: new Backbone.LocalStorage 'WHIB'
