`
/*!
 * Startup the frontend application using RequireJS
 * @author Michele Montagner
 */
`

require.config
  waitSeconds: 15
  baseUrl: '..'
  paths:
    jquery: 'bower_components/jquery/dist/jquery.min'
    bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min'
    underscore: 'bower_components/underscore/underscore-min'
    backbone: 'bower_components/backbone/backbone'
    localstorage: 'bower_components/Backbone.localStorage/backbone.localStorage'
    async: 'bower_components/requirejs-plugins/src/async'
    moment: 'bower_components/momentjs/min/moment.min'
    store: 'bower_components/store.js/store.min'
    URI: 'bower_components/URIjs/src/URI'
    modernizr: 'js/modernizr.custom'
    jqueryuiselectable: 'bower_components/jquery-ui/ui/minified/jquery.ui.selectable.min'
  map:
    URI:
      punycode: 'bower_components/URIjs/src/punycode'
      IPv6: 'bower_components/URIjs/src/IPv6'
      SecondLevelDomains: 'bower_components/URIjs/src/SecondLevelDomains'
  shim:
    backbone:
      deps: ['underscore', 'jquery']
      exports: 'Backbone'
    underscore:
      exports: '_'
    bootstrap: ['jquery']
    modernizr:
      exports: 'Modernizr'
    jqueryuiselectable: ['jquery', 'bower_components/jquery-ui/ui/minified/jquery.ui.core.min', 'bower_components/jquery-ui/ui/minified/jquery.ui.widget.min', 'bower_components/jquery-ui/ui/minified/jquery.ui.mouse.min']

require ['js/chronicles'], (Chronicles) ->
  new Chronicles()
