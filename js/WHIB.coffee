class window.WHIB
  constructor: (node) ->
    @node = jQuery(node).get 0

class WHIB.Place extends Backbone.Model
  getLatLng: ->
  	new google.maps.LatLng @get('lat'), @get 'lng'

class WHIB.Places extends Backbone.Collection
  model: WHIB.Place