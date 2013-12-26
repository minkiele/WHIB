(function() {
  var DATE_FORMAT, DEFAULT_DBLCLICK_HACK_TIMEOUT, DEFAULT_POSITION, DEFAULT_SYNC_TIME, DEFAULT_ZOOM, _ref, _ref1, _ref2, _ref3, _ref4,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DEFAULT_ZOOM = 1;

  DEFAULT_POSITION = new google.maps.LatLng(0, 0);

  DEFAULT_SYNC_TIME = 500;

  DEFAULT_DBLCLICK_HACK_TIMEOUT = 400;

  DATE_FORMAT = 'DD/MM/YYYY';

  window.WHIB = (function() {
    function WHIB(node, position, zoom) {
      if (zoom == null) {
        zoom = DEFAULT_ZOOM;
      }
      this.node = jQuery(node).get(0);
      this.places = new WHIB.Places();
      this.places.fetch({
        reset: true
      });
      this.mapView = new WHIB.MapView({
        position: position,
        zoom: zoom,
        el: this.node,
        collection: this.places
      });
    }

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

    Place.prototype.validate = function(attrs) {
      if (attrs.lat == null) {
        'Missing lat';
      }
      if (attrs.lng == null) {
        'Missing lng';
      }
      if ((attrs.description == null) || attrs.description.length === 0) {
        'Missing description';
      }
      if (attrs.time == null) {
        return 'Missing time';
      }
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

    Places.prototype.comparator = function(aPlace, bPlace) {
      var aMoment, bMoment;
      aMoment = moment(aPlace.time);
      bMoment = moment(bPlace.time);
      if (aMoment.isBefore(bMoment)) {
        return -1;
      } else if (aMoment.isSame(bMoment)) {
        return 0;
      } else {
        return 1;
      }
    };

    Places.prototype.getLatLngBounds = function() {
      var bounds;
      bounds = new google.maps.LatLngBounds();
      this.each(function(model) {
        return bounds.extend(model.getLatLng());
      });
      return bounds;
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
      this.def.done(this.populateMap);
      return this.def.done(this.fitBounds);
    };

    MapView.prototype.addMapListener = function() {
      var dblclickHackTimerId,
        _this = this;
      dblclickHackTimerId = 0;
      this.map.addListener('click', function(evt) {
        dblclickHackTimerId = setTimeout(function() {
          return _this.collection.add({
            lat: evt.latLng.lat(),
            lng: evt.latLng.lng()
          });
        }, DEFAULT_DBLCLICK_HACK_TIMEOUT);
        return void 0;
      });
      return this.map.addListener('dblclick', function() {
        return clearTimeout(dblclickHackTimerId);
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

    MapView.prototype.fitBounds = function() {
      if (this.collection.size() > 0) {
        return this.map.fitBounds(this.collection.getLatLngBounds());
      }
    };

    MapView.prototype.createViewFor = function(place) {
      return new WHIB.PlaceView({
        model: place,
        collection: this.collection,
        map: this.map
      });
    };

    MapView.prototype.promise = function() {
      return this.def.promise();
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
      this.map = options.map;
      this.marker = new google.maps.Marker({
        position: this.model.getLatLng(),
        draggable: true,
        map: this.map,
        animation: google.maps.Animation[this.model.isNew() ? 'BOUNCE' : 'DROP']
      });
      this.marker.addListener('dragend', function() {
        var position;
        position = _this.marker.getPosition();
        _this.model.set({
          lat: position.lat(),
          lng: position.lng()
        });
        return _this.model.save();
      });
      this.status = 'show';
      this.marker.addListener('click', function() {
        return _this.render();
      });
      this.marker.addListener('dblclick', function() {
        return clearTimeout(dblclickHackTimerId);
      });
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', function() {
        _this.marker.setVisible(false);
        _this.marker.setMap();
        return _this.info.close();
      });
      this.on('render', function(status) {
        _this.status = status;
        return _this.render();
      });
      if (this.model.isNew()) {
        return this.trigger('render', 'create');
      }
    };

    PlaceView.prototype.info = new google.maps.InfoWindow();

    PlaceView.prototype.createModeTemplate = _.template(jQuery('#create-mode-template').html());

    PlaceView.prototype.editModeTemplate = _.template(jQuery('#edit-mode-template').html());

    PlaceView.prototype.showModeTemplate = _.template(jQuery('#show-mode-template').html());

    PlaceView.prototype.render = function() {
      switch (this.status) {
        case 'show':
          this.marker.setAnimation();
          this.$el.html(this.showModeTemplate({
            description: this.model.get('description'),
            time: moment(this.model.get('time')).format(DATE_FORMAT)
          }));
          break;
        case 'create':
          this.marker.setAnimation(google.maps.Animation.BOUNCE);
          this.$el.html(this.createModeTemplate({
            description: '',
            time: moment().format(DATE_FORMAT)
          }));
          break;
        case 'edit':
          this.marker.setAnimation(google.maps.Animation.BOUNCE);
          this.$el.html(this.editModeTemplate({
            description: this.model.get('description'),
            time: moment(this.model.get('time')).format(DATE_FORMAT)
          }));
      }
      this.info.setContent(this.el);
      return this.info.open(this.map, this.marker);
    };

    PlaceView.prototype.events = {
      'click .save': function() {
        this.model.set('description', this.$('.description').val());
        this.model.set('time', moment(this.$('.time').val(), DATE_FORMAT).toDate());
        if (this.model.isValid()) {
          this.model.save();
          return this.trigger('render', 'show');
        }
      },
      'click .delete': function() {
        this.model.destroy();
        return this.remove();
      },
      'dblclick .show': function() {
        return this.trigger('render', 'edit');
      },
      'click .undo': function() {
        return this.trigger('render', 'show');
      }
    };

    return PlaceView;

  })(Backbone.View);

  WHIB.ModalView = (function(_super) {
    var _this = this;

    __extends(ModalView, _super);

    function ModalView() {
      _ref4 = ModalView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    ModalView.prototype.initialize = function(options) {
      var modal,
        _this = this;
      this.title = (options != null ? options.title : void 0) != null ? options.title : '';
      this.body = (options != null ? options.body : void 0) != null ? options.body : '';
      modal = jQuery(this.template({
        title: this.title,
        body: this.body
      })).appendTo('body');
      this.setElement(modal);
      this.on('render', this.render);
      return this.$el.on('hidden.bs.modal', function() {
        return _this.trigger('close');
      });
    };

    ModalView.prototype.template = _.template(jQuery('#modal-template').html());

    ModalView.prototype.render = function() {
      return this.$el.modal();
    };

    ModalView.prototype.events = {
      'click .yes': function() {
        return ModalView.trigger('yes');
      }
    };

    return ModalView;

  }).call(this, Backbone.View);

}).call(this);
