(function() {
  var DEFAULT_POSITION, DEFAULT_SYNC_TIME, DEFAULT_ZOOM, _ref, _ref1, _ref2, _ref3, _ref4,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DEFAULT_ZOOM = 1;

  DEFAULT_POSITION = new google.maps.LatLng(0, 0);

  DEFAULT_SYNC_TIME = 500;

  window.WHIB = (function() {
    function WHIB(node) {
      this.node = jQuery(node).get(0);
      this.places = new WHIB.Places();
      this.places.fetch({
        reset: true
      });
      this.buttons = new WHIB.Buttons({
        collection: this.places
      });
    }

    WHIB.prototype.createMapObject = function(position, zoom) {
      if (zoom == null) {
        zoom = DEFAULT_ZOOM;
      }
      return this.mapView = new WHIB.MapView({
        position: position,
        zoom: zoom,
        el: this.node,
        collection: this.places
      });
    };

    return WHIB;

  })();

  WHIB.Place = (function(_super) {
    __extends(Place, _super);

    function Place() {
      _ref = Place.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Place.prototype.getLatLng = function() {
      return new google.maps.LatLng(this.get('lat'), this.get('lng'));
    };

    return Place;

  })(Backbone.Model);

  WHIB.Places = (function(_super) {
    __extends(Places, _super);

    function Places() {
      _ref1 = Places.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Places.prototype.model = WHIB.Place;

    Places.prototype.localStorage = new Backbone.LocalStorage('WHIB');

    Places.prototype.getLatLngBounds = function() {
      var lats, lngs, maxLat, maxLng, minLat, minLng;
      lats = [];
      lngs = [];
      lats = this.pluck('lat');
      lngs = this.pluck('lng');
      minLat = Math.min.apply(Math, lats);
      maxLat = Math.max.apply(Math, lats);
      minLng = Math.min.apply(Math, lngs);
      maxLng = Math.max.apply(Math, lngs);
      return new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLng), new google.maps.LatLng(maxLat, maxLng));
    };

    Places.prototype.startSync = function() {
      var _this = this;
      this.stopSync();
      return this.syncTimerId = setInterval(function() {
        return _this.sync();
      }, DEFAULT_SYNC_TIME);
    };

    Places.prototype.stopSync = function() {
      return clearInterval(this.syncTimerId);
    };

    return Places;

  })(Backbone.Collection);

  WHIB.MapView = (function(_super) {
    __extends(MapView, _super);

    function MapView() {
      _ref2 = MapView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    MapView.prototype.initialize = function(options) {
      var position,
        _this = this;
      if ((options != null ? options.position : void 0) == null) {
        position = this.collection.size() > 0 ? this.collection.getLatLngBounds().getCenter() : DEFAULT_POSITION;
      } else {
        position = options.position;
      }
      this.def = new jQuery.Deferred();
      if (this.map != null) {
        this.def.resolveWith(this);
      } else {
        this.map = new google.maps.Map(this.el, {
          center: position,
          zoom: options.zoom,
          scaleControl: false,
          scrollwheel: false,
          panControl: false,
          mapTypeControl: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        if (this.map == null) {
          def.rejectWith(this);
        } else {
          google.maps.event.addListenerOnce(this.map, 'idle', function() {
            return _this.def.resolveWith(_this);
          });
        }
      }
      this.def.done(this.addMapListener);
      return this.def.done(this.populateMap);
    };

    MapView.prototype.addMapListener = function() {
      var _this = this;
      return this.map.addListener('click', function(evt) {
        var place;
        place = new WHIB.Place({
          lat: evt.latLng.lat(),
          lng: evt.latLng.lng()
        });
        _this.collection.add(place);
        return void 0;
      });
    };

    MapView.prototype.populateMap = function() {
      var _this = this;
      this.collection.each(function(place) {
        return _this.createViewFor(place);
      });
      this.collection.on('add', function(place) {
        return _this.createViewFor(place);
      });
      return void 0;
    };

    MapView.prototype.promise = function() {
      return this.def.promise();
    };

    MapView.prototype.createViewFor = function(place) {
      return new WHIB.PlaceView({
        model: place,
        collection: this.collection,
        map: this.map
      });
    };

    return MapView;

  })(Backbone.View);

  WHIB.PlaceView = (function(_super) {
    __extends(PlaceView, _super);

    function PlaceView() {
      _ref3 = PlaceView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    PlaceView.prototype.initialize = function(options) {
      var _this = this;
      this.marker = new google.maps.Marker({
        position: this.model.getLatLng(),
        draggable: true,
        map: options.map
      });
      this.info = new google.maps.InfoWindow();
      this.marker.addListener('dragend', function() {
        var position;
        position = _this.marker.getPosition();
        return _this.model.set({
          lat: position.lat(),
          lng: position.lng()
        });
      });
      this.marker.addListener('click', function() {
        _this.render();
        return _this.info.open(options.map, _this.marker);
      });
      return this.listenTo(this.model, 'change', this.render);
    };

    PlaceView.prototype.render = function() {
      if (this.model.isNew()) {
        return this.info.setContent('EDIT MODE');
      } else {
        return this.info.setContent('SHOW MODE');
      }
    };

    return PlaceView;

  })(Backbone.View);

  WHIB.Buttons = (function(_super) {
    __extends(Buttons, _super);

    function Buttons() {
      _ref4 = Buttons.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Buttons.prototype.el = '#buttons';

    Buttons.prototype.events = {
      'click #save-places': 'save',
      'click #reset-places': 'reset'
    };

    Buttons.prototype.save = function() {
      this.collection.each(function(place) {
        place.save({
          wait: true
        });
        return true;
      });
      return void 0;
    };

    Buttons.prototype.reset = function() {
      this.collection.each(function(place) {
        place.destroy({
          wait: true
        });
        return true;
      });
      return void 0;
    };

    return Buttons;

  })(Backbone.View);

}).call(this);
