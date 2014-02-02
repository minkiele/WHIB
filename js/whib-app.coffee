`
/*!
 * The start for the frontend application using RequireJS
 * @author Michele Montagner
 */
`
require.config
  baseUrl: '..'
  paths:
    jquery: 'bower_components/jquery/jquery.min'
    bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min'
    underscore: 'bower_components/underscore/underscore-min'
    backbone: 'bower_components/backbone/backbone'
    localstorage: 'bower_components/Backbone.localStorage/backbone.localStorage'
    async: 'bower_components/requirejs-plugins/src/async'
    moment: 'bower_components/momentjs/min/moment.min'
    store: 'bower_components/store.js/store.min'
  shim:
    backbone:
      deps: ['underscore', 'jquery']
      exports: 'Backbone'
    underscore:
      exports: '_'
    bootstrap: ['jquery']

require ['js/WHIB'], (WHIB) ->
  #The I choose a position automatically
  window.theWHIB = new WHIB()
