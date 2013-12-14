require.config({
    baseUrl: '..',
    paths: {
        jquery: 'bower_components/jquery/jquery.min',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
        underscore: 'bower_components/underscore/underscore-min',
        backbone: 'bower_components/backbone/backbone-min',
        localstorage: 'bower_components/Backbone.localStorage/backbone.localStorage-min',
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

//Docs say that this is WROOONG!
define('gmaps', ['async!https://maps.googleapis.com/maps/api/js?key=' + document.getElementById('whib-app').getAttribute('data-gmaps-key') + '&sensor=false'], function(){
    return window.google;
});
requirejs(['jquery', 'whib', 'bootstrap'], function($, WHIB){
    
});
