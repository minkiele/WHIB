DEFAULT_ZOOM = 15

class window.WHIB
  constructor: (node) ->
    @node = jQuery(node).get 0
  render: (position, zoom = DEFAULT_ZOOM) ->
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
    def.promise()

class WHIB.Place extends Backbone.Model
  getLatLng: ->
  	new google.maps.LatLng @get('lat'), @get 'lng'

class WHIB.Places extends Backbone.Collection
  model: WHIB.Place