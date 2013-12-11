(function() {
  var DEFAULT_ZOOM, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DEFAULT_ZOOM = 15;

  window.WHIB = (function() {
    function WHIB(node) {
      this.node = jQuery(node).get(0);
    }

    WHIB.prototype.render = function(position, zoom) {
      var def,
        _this = this;
      if (zoom == null) {
        zoom = DEFAULT_ZOOM;
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
          this.map.addListener('idle', function() {
            return def.resolveWith(_this);
          });
        }
      }
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

    return Places;

  })(Backbone.Collection);

}).call(this);
