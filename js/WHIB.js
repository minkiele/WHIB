(function() {
  var DEFAULT_POSITION, DEFAULT_SYNC_TIME, DEFAULT_ZOOM, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DEFAULT_ZOOM = 1;

  DEFAULT_POSITION = new google.maps.LatLng(0, 0);

  DEFAULT_SYNC_TIME = 500;

  window.WHIB = (function() {
    function WHIB(node) {
      var _this = this;
      this.node = jQuery(node).get(0);
      this.places = new WHIB.Places();
      this.places.fetch({
        reset: true
      });
      this.places.on('add', function(place) {
        return _this.createMarkerFor(place);
      });
      this.buttons = new WHIB.Buttons({
        collection: this.places
      });
    }

    WHIB.prototype.createMapObject = function(position, zoom) {
      var def,
        _this = this;
      if (zoom == null) {
        zoom = DEFAULT_ZOOM;
      }
      if (position == null) {
        position = this.places.size() > 0 ? this.places.getLatLngBounds().getCenter() : DEFAULT_POSITION;
      }
      def = new jQuery.Deferred();
      if (this.map != null) {
        def.resolveWith(this);
      } else {
        this.map = new google.maps.Map(this.node, {
          center: position,
          zoom: zoom,
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
            return def.resolveWith(_this);
          });
        }
      }
      def.done(function() {
        var _this = this;
        return this.map.addListener('click', function(evt) {
          var place;
          place = new WHIB.Place({
            lat: evt.latLng.lat(),
            lng: evt.latLng.lng()
          });
          _this.places.add(place);
          return void 0;
        });
      });
      def.done(function() {
        var _this = this;
        return this.places.each(function(place) {
          return _this.createMarkerFor(place);
        });
      });
      return def.promise();
    };

    WHIB.prototype.createMarkerFor = function(place) {
      return console.log('Marker creation logic (%f, %f)', place.get('lat'), place.get('lng'));
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

    Places.prototype.initialize = function() {};

    Places.prototype.model = WHIB.Place;

    Places.prototype.localStorage = new Backbone.LocalStorage('WHIB');

    Places.prototype.getLatLngBounds = function() {
      var lats, lngs, maxLat, maxLng, minLat, minLng;
      lats = [];
      lngs = [];
      this.each(function(model) {
        lats.push(model.get('lat'));
        return lngs.push(model.get('lng'));
      });
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

  WHIB.Buttons = (function(_super) {
    __extends(Buttons, _super);

    function Buttons() {
      _ref2 = Buttons.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Buttons.prototype.el = '#buttons';

    Buttons.prototype.events = {
      'click #save-places': 'save',
      'click #reset-places': 'reset'
    };

    Buttons.prototype.save = function() {
      return this.collection.each(function(place) {
        return place.save();
      });
    };

    Buttons.prototype.reset = function() {
      return this.collection.each(function(place) {
        return place.destroy();
      });
    };

    return Buttons;

  })(Backbone.View);

}).call(this);
