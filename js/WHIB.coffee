DEFAULT_ZOOM = 1
DEFAULT_POSITION = new google.maps.LatLng(0, 0)
DEFAULT_SYNC_TIME = 500;

class window.WHIB
  constructor: (node) ->
    @node = jQuery(node).get 0
    @places = new WHIB.Places()
    @places.fetch
      reset: true
    @places.on 'add', (place) =>
      @createMarkerFor place
    @buttons = new WHIB.Buttons
      collection: @places
  createMapObject: (position, zoom = DEFAULT_ZOOM) ->
    if (not position?)
      position = if @places.size() > 0 then @places.getLatLngBounds().getCenter() else DEFAULT_POSITION
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
        google.maps.event.addListenerOnce @map, 'idle', =>
          def.resolveWith @
    def.done ->
      @map.addListener 'click', (evt) =>
        place = new WHIB.Place
          lat: evt.latLng.lat()
          lng: evt.latLng.lng()
        @places.add place
        undefined
    def.done ->
      @places.each (place) =>
        @createMarkerFor place
    def.promise()
  createMarkerFor: (place) ->
    console.log 'Marker creation logic (%f, %f)', place.get('lat'), place.get 'lng'
class WHIB.Place extends Backbone.Model
  getLatLng: ->
  	new google.maps.LatLng @get('lat'), @get 'lng'

class WHIB.Places extends Backbone.Collection
  initialize: ->
    #@startSync()
  model: WHIB.Place
  localStorage: new Backbone.LocalStorage 'WHIB'
  getLatLngBounds: ->
    lats = []
    lngs = []
    @each (model) ->
  	  lats.push model.get 'lat'
  	  lngs.push model.get 'lng'
    minLat = Math.min lats...
    maxLat = Math.max lats...
    minLng = Math.min lngs...
    maxLng = Math.max lngs...
    new google.maps.LatLngBounds new google.maps.LatLng(minLat, minLng), new google.maps.LatLng maxLat, maxLng
  startSync: ->
    @stopSync()
    @syncTimerId = setInterval =>
      @sync()
    ,DEFAULT_SYNC_TIME
  stopSync: ->
  	clearInterval @syncTimerId

class WHIB.Buttons extends Backbone.View
  el: '#buttons'
  events:
    'click #save-places': 'save'
    'click #reset-places': 'reset'
  save: ->
    @collection.each (place) ->
      place.save()
  reset: ->
    @collection.each (place) ->
      place.destroy()
    