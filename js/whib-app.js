(function() {
  
/*!
 * The start for the frontend application using RequireJS
 * @author Michele Montagner
 */
;
  require.config({
    baseUrl: '..',
    paths: {
      jquery: 'bower_components/jquery/jquery.min',
      bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
      underscore: 'bower_components/underscore/underscore-min',
      backbone: 'bower_components/backbone/backbone',
      localstorage: 'bower_components/Backbone.localStorage/backbone.localStorage',
      async: 'bower_components/requirejs-plugins/src/async',
      whib: 'js/WHIB'
    },
    shim: {
      backbone: {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
      },
      underscore: {
        exports: '_'
      },
      bootstrap: ['jquery'],
      whib: {
        deps: ['jquery', 'backbone', 'localstorage', 'gmaps'],
        exports: 'WHIB'
      }
    }
  });

  requirejs(['jquery', 'whib', 'bootstrap'], function($, WHIB) {
    return window.whibApp = new WHIB('#gmap').createMapObject();
  });

}).call(this);
