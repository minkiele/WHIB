(function() {
  var DEFAULT_POSITION, DEFAULT_ZOOM, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DEFAULT_ZOOM = 1;

  DEFAULT_POSITION = new google.maps.LatLng(0, 0);

  window.WHIB = (function() {
    function WHIB(node) {
      this.node = jQuery(node).get(0);
      this.places = new WHIB.Places();
      this.places.fetch();
    }

    WHIB.prototype.createMapObject = function(position, zoom) {
      var def,
        _this = this;
      if (zoom == null) {
        zoom = DEFAULT_ZOOM;
      }
      if (position == null) {
        position = this.places.size() > 0 ? this.places.getLatLng() : DEFAULT_POSITION;
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
        return _this.map.addListener('click', function(evt) {
          var place;
          place = new WHIB.Place({
            lat: evt.latLng.lat(),
            lng: evt.latLng.lng()
          });
          _this.places.add(place);
          return void 0;
        });
      });
      return def.promise();
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

    return Places;

  })(Backbone.Collection);

}).call(this);
