`
/*!
 * Chronicles
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone', 'moment', 'store', './StaticMap', 'modernizr', 'localstorage', 'async', 'gmaps'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'), require('backbone'), require('moment'), require('store'), require('./StaticMap'), require('modernizr'), require('localstorage'), require('async'), require('gmaps'));
    } else {
        root.returnExports = factory(root.jQuery, root.Backbone, root.moment, root.store, root.StaticMap, root.Modernizr);
    }
}(this, function (jQuery, Backbone, moment, store, StaticMap, Modernizr) {
`
DEFAULT_ZOOM = 1
DEFAULT_POSITION = new google.maps.LatLng(0, 0)
DEFAULT_SYNC_TIME = 500
DEFAULT_DBLCLICK_HACK_TIMEOUT = 400
DELAY_BETWEEN_MARKERS = 200

DATE_FORMAT_SHOW = 'DD/MM/YYYY'
DATE_FORMAT = unless Modernizr.inputtypes.date then DATE_FORMAT_SHOW else 'YYYY-MM-DD'

#Main controller
class Chronicles
#Initialize the node and preload the places collection
  constructor: (position, zoom = DEFAULT_ZOOM) ->
    @node = jQuery('#gmap').get 0
    @timeline = jQuery('#timeline').get 0
    @search =  jQuery('#search-form').get 0
    @places = new Chronicles.Places()
    @places.fetch
      reset: true
    @mapView = new Chronicles.MapView
      position: position
      zoom: zoom
      el: @node
      collection: @places
    @export = new Chronicles.ExportView
      collection: @places
    @timelineView = new Chronicles.TimelineView
      el: @timeline
      collection: @places
    @searchView = new Chronicles.SearchView
      el: @search

    @searchView.on 'foundAddress', (address) =>
      @mapView.map.setCenter address

#Model for a single place
class Chronicles.Place extends Backbone.Model
  initialize: ->
    @collection.listenTo @, 'change:time', @collection.sort
    #@on 'change:time', @collection.sort, @collection
  getLatLng: ->
    new google.maps.LatLng @get('lat'), @get 'lng'
  validate: (attrs) ->
    if (not attrs.lat?) then return 'Missing lat'
    if (not attrs.lng?) then return 'Missing lng'
    if (not attrs.description?) or attrs.description.length is 0 then return 'Missing description'
    if (not attrs.time?) then return 'Missing time'

#Model for a collection of places
class Chronicles.Places extends Backbone.Collection
  model: Chronicles.Place
  localStorage: new Backbone.LocalStorage 'Chronicles'
  comparator: (aPlace, bPlace) ->
    aMoment = moment aPlace.get 'time'
    bMoment = moment bPlace.get 'time'
    if aMoment.isBefore(bMoment) then -1 else if aMoment.isSame(bMoment) then 0 else 1
  getLatLngBounds: ->
    bounds = new google.maps.LatLngBounds()
    @each (model) ->
      bounds.extend model.getLatLng()
    bounds

#Class with static methods (like reverse geocoder)
class Chronicles.Services
  #Wrapper for jQuery.Deferred to resolve reverse geocoding
  @Geocoder = (request) ->
    jQuery.Deferred (def) ->
      geocoder = new google.maps.Geocoder()
      geocoder.geocode request, (result, status) ->
        if status is google.maps.GeocoderStatus.OK
          def.resolve result
        else
          def.reject status
    .promise()
  @AddressFinder = (latLng) ->
    @Geocoder
      location: latLng
    .then (entries) ->
      if entries?.length?
        for entry in entries
          for component in entry.address_components
            if jQuery.inArray('locality', component.types) > -1
              return component.short_name
        entries[0].formatted_address
  @Geocode = (address) ->
    @Geocoder
      address: address
    .then (entries) ->
      if entries?.length? then entries[0].geometry.location

#View for interaction with collection (Interact also with the map)
class Chronicles.MapView extends Backbone.View

  if store.enabled then mapTypeId = store.get 'mapTypeId'
  if not mapTypeId? then mapTypeId = google.maps.MapTypeId.SATELLITE

  mapTypeId: mapTypeId

  initialize: (options) ->
    if (not options?.position?)
      position = if @collection.size() > 0 then @collection.getLatLngBounds().getCenter() else DEFAULT_POSITION
    else position = options.position
    @def = def = new jQuery.Deferred()
    if @map?
      def.resolveWith @
    else
      @map = new google.maps.Map @el,
        center: position
        zoom: options.zoom
        scaleControl: no
        scrollwheel: no
        panControl: no
        mapTypeControl: yes
        mapTypeControlOptions:
          mapTypeIds: (google.maps.MapTypeId[mapType] for mapType in ['ROADMAP', 'HYBRID', 'SATELLITE'])
        mapTypeId: @mapTypeId
      if not @map? then def.rejectWith @
      else
        google.maps.event.addListenerOnce @map, 'idle', =>
          def.resolveWith @

    def.done @addMapListeners
    def.done @populateMap
    def.done @fitBounds
    def.done @addPersistence

  addMapListeners: ->

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
    delay = 0
    @collection.each (place) =>
      setTimeout => @createViewFor(place)
      ,
      delay
      delay += DELAY_BETWEEN_MARKERS
    @collection.on 'add', (place) =>
      @createViewFor place
    undefined

  fitBounds: ->
    if @collection.size() > 0
      @map.fitBounds @collection.getLatLngBounds()

  addPersistence: ->
    if store.enabled
      @map.addListener 'maptypeid_changed', =>
        @mapTypeId = @map.getMapTypeId()
        store.set 'mapTypeId', @mapTypeId

  createViewFor: (place) ->
    new Chronicles.PlaceView
      model: place
      collection: @collection
      map: @map

#View to interact with the single markers and the infowindows for the place
class Chronicles.PlaceView extends Backbone.View

  placeholder: 'What did you do here?'
  status: 'show'

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

    @marker.addListener 'click', => @render()

    @marker.addListener 'dblclick', ->
      clearTimeout dblclickHackTimerId

    @listenTo @model, 'destroy', =>
      @marker.setVisible no
      @marker.setMap()
      @info.close()

    @on 'render', (status) =>
      @status = status
      @render()

    if @model.isNew() then Chronicles.Services.AddressFinder(@model.getLatLng()).done (address) =>
      if address? then @placeholder = "#{address}?"
    .always => @trigger 'render', 'create'

    @listenTo @model, 'show-on-map', =>
      google.maps.event.trigger @marker, 'click'

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
          time: moment(@model.get 'time').format DATE_FORMAT_SHOW
      when 'create'
        @marker.setAnimation google.maps.Animation.BOUNCE
        @$el.html @createModeTemplate
          description: ''
          time: moment().format DATE_FORMAT
          placeholder: @placeholder
      when 'edit'
        @marker.setAnimation google.maps.Animation.BOUNCE
        @$el.html @editModeTemplate
          description: @model.get 'description'
          time: moment(@model.get 'time').format DATE_FORMAT

    @info.setContent @el
    @info.open @map, @marker

  events:
    'click .save': ->
      @model.set 'description', @$('.description').val()
      @model.set 'time', moment(@$('.time').val(), DATE_FORMAT).toDate()
      if @model.isValid()
        @model.save {},
          success: =>
            @trigger 'render', 'show'
    'click .delete': ->
      @model.destroy()
      @remove()
    'dblclick .show': -> @trigger 'render', 'edit'
    'click .show .edit': -> @trigger 'render', 'edit'
    'click .undo': ->
      if not @model.isValid()
        @model.fetch
          success: => @trigger 'render', 'show'
      else @trigger 'render', 'show'

class Chronicles.TimelineView extends Backbone.View
  initialize: ->
    @render()
    @listenTo @collection, 'sort', @render
    @listenTo @collection, 'add', @renderModel

  renderModel: (model) ->
    view = new Chronicles.TimelineBoxView
      model: model
    @$el.append view.el
    view.listenTo @collection, 'sort', view.remove

  render: ->
    doShow = @collection.length > 0
    @$el.parent().toggle doShow
    if doShow then @collection.each @renderModel, @

class Chronicles.TimelineBoxView extends Backbone.View
  initialize: ->
    tpl = jQuery '#timeline-box-template'
    @template = _.template tpl.html()
    @imgWidth = tpl.data 'img-width'
    @imgHeight = tpl.data 'img-height'
    @imgZoom = tpl.data 'img-zoom'

    if not @model.isNew() then @render()
    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove
  render: ->
    img = new StaticMap()
    img.setCenter @model.getLatLng()
    img.setSize @imgWidth, @imgHeight
    img.addMarker
      positions: [@model.getLatLng()]
    img.set 'zoom', @imgZoom
    @$el.html @template
      description: @model.get 'description'
      time: moment(@model.get 'time').format DATE_FORMAT_SHOW
      imgsrc: img.getUrl()

  events:
    'click .timeline-marker': -> @model.trigger 'show-on-map'

class Chronicles.SearchView extends Backbone.View
  initialize: ->
    @input = @$ 'input[type="search"]'
  events:
    'submit': (evt) ->
      evt.preventDefault()
      address = @input.val()
      if address.length > 0 then Chronicles.Services.Geocode(address).done (center) =>
        @trigger 'foundAddress', center

class Chronicles.ModalView extends Backbone.View
  initialize: (options) ->
    @title = if options?.title? then options.title else ''
    @body = if options?.body? then options.body else ''
    modal = jQuery(@template
      title: @title
      body: @body
    ).appendTo 'body'
    @setElement modal
    @on 'render', @render
    @$el.on 'hidden.bs.modal', => @trigger 'close'
  template: _.template jQuery('#modal-template').html()
  render: -> @$el.modal()
  events:
    'click .yes': => @trigger 'yes'

    
class Chronicles.ExportView extends Backbone.View
  initialize: ->
    @loadingBay = @$el.find '#loading-bay'
    @modal = new Chronicles.ModalView
      title: 'Import places',
      body: 'Are you sure you really want to import the places?'
    @listenTo @modal, 'yes', =>
      try
        json = JSON.parse @loadingBay.val()
        @collection.reset json
  el: '#import-export'
  events:
    'click #do-export': -> @loadingBay.val JSON.stringify @collection.toJSON()
    'click #do-import': -> @modal.trigger 'render'

    
return Chronicles
  
`
}));
`
