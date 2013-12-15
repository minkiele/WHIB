DEFAULT_ZOOM = 1
DEFAULT_POSITION = new google.maps.LatLng(0, 0)
DEFAULT_SYNC_TIME = 500;

class window.WHIB
  constructor: (node) ->
    @node = jQuery(node).get 0
    @places = new WHIB.Places()
    @places.fetch
      reset: true
    @buttons = new WHIB.Buttons
      collection: @places
  createMapObject: (position, zoom = DEFAULT_ZOOM) ->
    @mapView = new WHIB.MapView
      position: position
      zoom: zoom
      el: @node
      collection: @places

class WHIB.Place extends Backbone.Model
  getLatLng: ->
  	new google.maps.LatLng @get('lat'), @get 'lng'

class WHIB.Places extends Backbone.Collection
  model: WHIB.Place
  localStorage: new Backbone.LocalStorage 'WHIB'
  getLatLngBounds: ->
    lats = []
    lngs = []
    lats = @pluck 'lat'
    lngs = @pluck 'lng'
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
  
class WHIB.MapView extends Backbone.View
  initialize: (options) ->
    if (not options?.position?)
      position = if @collection.size() > 0 then @collection.getLatLngBounds().getCenter() else DEFAULT_POSITION
    else position = options.position
    @def = new jQuery.Deferred()
    if @map?
      @def.resolveWith @
    else
      @map = new google.maps.Map @el,
        center: position
        zoom: options.zoom
        scaleControl: no
        scrollwheel: no
        panControl: no
        mapTypeControl: no
        mapTypeId: google.maps.MapTypeId.ROADMAP
      if not @map? then def.rejectWith @
      else
        google.maps.event.addListenerOnce @map, 'idle', =>
          @def.resolveWith @
    @def.done @addMapListener
    @def.done @populateMap

  addMapListener: ->
    @map.addListener 'click', (evt) =>
      place = new WHIB.Place
        lat: evt.latLng.lat()
        lng: evt.latLng.lng()
      @collection.add place
      undefined

  populateMap: ->
    @collection.each (place) =>
      @createViewFor place
    @collection.on 'add', (place) =>
      @createViewFor place
    undefined

  promise: ->
    @def.promise()

  createViewFor: (place) ->
    new WHIB.PlaceView
      model: place
      collection: @collection
      map: @map

class WHIB.PlaceView extends Backbone.View
  initialize: (options) ->
    @marker = new google.maps.Marker
      position: @model.getLatLng()
      draggable: true
      map: options.map
      
    @info = new google.maps.InfoWindow()

    @marker.addListener 'dragend', =>
      position = @marker.getPosition()
      @model.set
        lat: position.lat()
        lng: position.lng()
    @marker.addListener 'click', =>
      @render()
      @info.open options.map, @marker

    @listenTo @model, 'change', @render

  render: ->
    if @model.isNew()
      @info.setContent 'EDIT MODE'
    else
      @info.setContent 'SHOW MODE'

class WHIB.Buttons extends Backbone.View
  el: '#buttons'
  events:
    'click #save-places': 'save'
    'click #reset-places': 'reset'
  save: ->
    @collection.each (place) ->
      place.save
        wait: true
      on
    undefined
  reset: ->
    @collection.each (place) ->
      place.destroy
        wait: true
      on
    undefined
    