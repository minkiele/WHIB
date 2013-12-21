DEFAULT_ZOOM = 1
DEFAULT_POSITION = new google.maps.LatLng(0, 0)
DEFAULT_SYNC_TIME = 500
DEFAULT_DBLCLICK_HACK_TIMEOUT = 400

#Main controller
class window.WHIB
  constructor: (node) ->
    @node = jQuery(node).get 0
    @places = new WHIB.Places()
    @places.fetch
      reset: true
  createMapObject: (position, zoom = DEFAULT_ZOOM) ->
    @mapView = new WHIB.MapView
      position: position
      zoom: zoom
      el: @node
      collection: @places
    @mapView.promise()

#Model for a single place
class WHIB.Place extends Backbone.Model
  getLatLng: ->
  	new google.maps.LatLng @get('lat'), @get 'lng'
  validate: (attrs) ->
    if (not attrs.lat?) then 'Missing lat'
    if (not attrs.lng?) then 'Missing lng'
    if (not attrs.description?) or attrs.description.length is 0 then 'Missing description'
    if (not attrs.time?) then 'Missing time'

#Model for a collection of places
class WHIB.Places extends Backbone.Collection
  model: WHIB.Place
  localStorage: new Backbone.LocalStorage 'WHIB'
  getLatLngBounds: ->
    bounds = new google.maps.LatLngBounds()
    @each (model) ->
      bounds.extend model.getLatLng()
    bounds
  startSync: ->
    @stopSync()
    @syncTimerId = setInterval =>
      @sync()
    ,DEFAULT_SYNC_TIME
  stopSync: ->
  	clearInterval @syncTimerId
  
#View for interaction with collection
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
    @def.done @fitBounds
    
  addMapListener: ->
  
    dblclickHackTimerId = 0

    @map.addListener 'click', (evt) =>
      dblclickHackTimerId = setTimeout =>
        @collection.add
          lat: evt.latLng.lat()
          lng: evt.latLng.lng()
      , DEFAULT_DBLCLICK_HACK_TIMEOUT
      undefined

    @map.addListener 'dblclick', ->
      clearTimeout dblclickHackTimerId

  populateMap: ->
    @collection.each (place) =>
      @createViewFor place
    @collection.on 'add', (place) =>
      @createViewFor place
    undefined

  fitBounds: ->
    if @collection.size() > 0
      @map.fitBounds @collection.getLatLngBounds()

  createViewFor: (place) ->
    new WHIB.PlaceView
      model: place
      collection: @collection
      map: @map

  promise: ->
    @def.promise()

class WHIB.PlaceView extends Backbone.View
  initialize: (options) ->
    @map = options.map

    @marker = new google.maps.Marker
      position: @model.getLatLng()
      draggable: true
      map: @map
      animation: google.maps.Animation[if @model.isNew() then 'BOUNCE' else 'DROP']

    @marker.addListener 'dragend', =>
      position = @marker.getPosition()
      @model.set
        lat: position.lat()
        lng: position.lng()
      @model.save()

    @status = 'show'

    @marker.addListener 'click', => @render()

    @marker.addListener 'dblclick', ->
      clearTimeout dblclickHackTimerId
    
    @listenTo @model, 'change', @render

    @listenTo @model, 'destroy', =>
      @marker.setVisible no
      @marker.setMap()
      @info.close()

    @on 'render', (status) =>
      @status = status
      @render()

    if @model.isNew() then @trigger 'render', 'create'

  info: new google.maps.InfoWindow()

  createModeTemplate: _.template jQuery('#create-mode-template').html()
  editModeTemplate: _.template jQuery('#edit-mode-template').html()
  showModeTemplate: _.template jQuery('#show-mode-template').html()

  render: ->
    switch @status
      when 'show'
        @marker.setAnimation()
        @$el.html @showModeTemplate
          description: @model.get 'description'
          time: @model.get 'time'
      when 'create'
        @marker.setAnimation google.maps.Animation.BOUNCE
        @$el.html @createModeTemplate
          description: ''
          time: new Date()
      when 'edit'
        @marker.setAnimation google.maps.Animation.BOUNCE
        @$el.html @editModeTemplate
          description: @model.get 'description'
          time: @model.get 'time'

    @info.setContent @el
    @info.open @map, @marker

  events:
    'click .save': ->
      @model.set 'description', @$('.description').val()
      if @model.isValid()
        @model.save()
        @trigger 'render', 'show'
    'click .delete': ->
      @model.destroy()
      @remove()
    'dblclick .show': -> @trigger 'render', 'edit'
    'click .undo': ->
      @trigger 'render', 'show'
