/*global $,jQuery,Lawnchair*/

// KNOWN PROBLEMS:
// 1. Only Layers are able to listen for the controlchange event
// 2. Deleted layers are not removed from AUTOMATIC save

var LayerManager = (function ($, window, undefined) {

  // -------------------------------------------------- //
  // Layer Management                                   //
  // -------------------------------------------------- //
  // Layers represent each part of the card, it can be  //
  // text or image.                                     //
  // LayerManager is the object that will take care of  //
  // having the layers working together                 //
  // -------------------------------------------------- //

  /**
   * LayerManager has to be unique so it's a singleton like object.
   */
  var LayerManager = {
    layers : [],
    jDOM   : null,

    /**
     * This need to be called once the DOM is ready
     */
    init : function init () {
      this.jDOM = $('#canvas');

      // When clicking elsewhere than on a layer, all layer are deactivated
      this.jDOM.on('mousedown', function (event) {
        var target = $(event.target);
        if (!(target.hasClass('layer') || target.parents().hasClass('layer'))) {
          LayerManager.deactivateLayers();
        }
      });
    },

    /**
     * Deactivate all layers.
     */
    deactivateLayers : function deactivateLayers() {
      LayerManager.jDOM.find('.layer.active').trigger('deactive.layer');
      $(document)
        // Let the old layers no longer listen for change on control panels
        .off('controlchange')
        .trigger('layerdeactivate');
    },

    /**
     * Layer factory
     *
     * @param type string The type of layer to create. It can be "text" or "image" (case insensitive)
     * @param param any The expected param for the type constructor
     *   for text, it expect a string
     *   for image, it expect an URL (as a string)
     */
    create : function create(type, param) {
      var construct = {
        text : LayerText,
        image: LayerImage
      };

      this.layers.push(new construct[type](param));
    }
  };


  /**
   * Basic layer interface (Abstract Class)
   */
  function Layer() {}

  // Common object configuration procedure
  Layer.init = function () {
    // Set up common properties
    this.properties = $.extend({
      top : 0,
      left: 0,
      contentWidth: 0,
      contentHeight: 0,
      isLocked: false,
      isDraggable: true,
      isResizable: false,
      isRotatable: true
    }, this.properties);

    if (!this.properties.isLocked && this.properties.isDraggable) {

      this.jDOM
        // Make the layer draggable
        .draggable({
          // Broadcast position change when drag is over
          stop: (function () {
            this.properties.top  = this.jDOM.css('top').slice(0,-2);
            this.properties.left = this.jDOM.css('left').slice(0,-2);
            this.broadcast();
          }).bind(this),
          drag: (function() {
            try {
              this.checkCoordinates();
            }
            catch (e) {

              // @TODO: Display a message to the user.
              console.log(e);
            }
          }).bind(this),
          start: (function() {
            Layer.prototype.giveFocus(this.jDOM);
          }).bind(this),
          // Restrict the layer to its container.
          containment: LayerManager.jDOM,
          scroll: false
        });
    }

    if (!this.properties.isLocked && this.properties.isResizable) {

      this.jDOM
        // Make the content resizable.
        .find('.content').resizable({

          // Broadcast position change when drag is over
          stop: (function () {
            this.properties.contentWidth  = this.jDOM.find('.content').css('width').slice(0,-2);
            this.properties.contentHeight = this.jDOM.find('.content').css('height').slice(0,-2);
            this.broadcast();
          }).bind(this),

          // Check data when resizing.
          resize: (function() {
            try {
              this.checkCoordinates();
            }
            catch (e) {

              // @TODO: Display a message to the user.
              console.log(e);
            }
          }).bind(this),

          // Give focus when clicking.
          start: (function() {
            Layer.prototype.giveFocus(this.jDOM);
          }).bind(this)
        });
    }

    if (!this.properties.isLocked && this.properties.isRotatable) {
      this.jDOM.rotatable({
        start: function() {
          //Layer.prototype.giveFocus(this.jDOM);
        },
        rotate: (function() {
          try {

            // Get the coordinates of the right and bottom points to check them.
            var distanceX = 2 * this.jDOM.getCenterCoords().x - this.jDOM.offset().left;
            var distanceY = 2 * this.jDOM.getCenterCoords().y - this.jDOM.offset().top;

            this.checkCoordinates({
              right: distanceX,
              bottom: distanceY
            });
          }
          catch (e) {

            // @TODO: Display a message to the user.
            console.log(e);
          }
        }).bind(this)
      });
    }

    // Activate special UI event and options for layers
    this.jDOM.UILayer({
        // Options
        deletable : true, // Enable delete.layer event
        deleteUI  : true,  // Toggle build-in delete UI
        isLocked  : this.properties.isLocked
      })
      // Configure actions based on UI events
      .on('active.layer', Layer.activated.bind(this))
      .on('delete.layer', Layer.destroyed.bind(this));

    LayerManager.jDOM.append(this.jDOM);

    this.updateLayer();
  };

  // This method is called when the Layer is activated
  // This is not in the prototype, therefor it is not inherited
  // It MUST be bound to the current layer to be usable
  Layer.activated = function () {
    $(document)
      // Let the old layers no longer listen for change on control panels
      .off('controlchange')
      // Attach the change on the control panels to the active layer
      .on('controlchange', Layer.controlchange.bind(this));

    // We send the new active layer state for the
    // control panels to be able to update themselves
    this.broadcast();
  };

  // This method is called when the Layer is deleted
  // This is not in the prototype, therefor it is not inherited
  // It MUST be bound to the current layer to be usable
  Layer.destroyed = function () {

    // Remove the element from the list.
    var i = $.inArray(this, LayerManager.layers);
    LayerManager.layers.splice(i, 1);

    // Trigger the event.
    $(document).trigger('layerdelete');
  };

  // This method is called when the Layer receive the controlchange Event
  // This is not in the prototype, therefor it is not inherited
  // It MUST be bound to the current layer to be usable
  Layer.controlchange = function (data) {
    for (var property in data) {
      if(data.hasOwnProperty(property) && property in this.properties) {
        this.properties[property] = data[property];
      }
    }

    this.updateLayer();
  };

  // INHERITED METHODS

  // "Manually" activate the layer (and deactivate the others)
  Layer.prototype.activate = function activate() {
    this.jDOM.trigger('active.layer');
  };

  // "Manually" destroy the layer
  Layer.prototype.destroy = function destroy() {
    this.jDOM.trigger('delete.layer');
  };

  // "Manually" deactivate the layer
  Layer.prototype.deactivate = function deactivate() {
    this.jDOM.trigger('deactive.layer');
  };

  // This method send the current layer state
  // as a layerchange event
  Layer.prototype.broadcast = function () {
    // Send message when the layer properties change

    var property, data = $.Event("layerchange");

    for (property in this.properties) {
      if(this.properties.hasOwnProperty(property)) {
        data[property] = this.properties[property];
      }
    }

    this.jDOM.trigger(data);
  };

  // update the DOM tree representing the layer
  // According to the Layer object's properties
  Layer.prototype.updateLayer = function () {
    try {
      this.checkCoordinates();
    }
    catch (e) {

      // @TODO: Display a message to the user.
      console.log(e);
    }


    if (!this.properties.isLocked && this.properties.isDraggable) {
      this.jDOM.css({
        "top"  : this.properties.top + "px",
        "left" : this.properties.left+ "px"
      });
    }

    if (!this.properties.isLocked && this.properties.isResizable) {
      this.jDOM.find('.content').css({
        "width"  : this.properties.contentWidth + "px",
        "height" : this.properties.contentHeight+ "px"
      });
    }
  };

  /**
   * Check coordinates.
   *
   * @param param The coordinates of the right and bottom points. Base on current layer if missed.
   *
   * Return TRUE if the component is in the container, throw an exception otherwise.
   */
  Layer.prototype.checkCoordinates = function (param) {

    var options = $.extend({
      right: this.jDOM.offset().left + this.jDOM.width(),
      bottom: this.jDOM.offset().top + this.jDOM.height()
    }, param);

    // Check the top border.
    if (LayerManager.jDOM.offset().top > this.jDOM.offset().top) {
      throw new ComponentException('The widget goes out of bounds.');
    }

    // Check the right border.
    if (LayerManager.jDOM.offset().left + LayerManager.jDOM.width() < options.right) {
      throw new ComponentException('The widget goes out of bounds.');
    }

    // Check the bottom border.
    if (LayerManager.jDOM.offset().top + LayerManager.jDOM.height() < options.bottom) {
      throw new ComponentException('The widget goes out of bounds.');
    }

    // Check the left border.
    if (LayerManager.jDOM.offset().left > this.jDOM.offset().left) {
      throw new ComponentException('The widget goes out of bounds.');
    }

    return true;
  }

  /**
   * Give focus on the element.
   */
  Layer.prototype.giveFocus = function (layer) {

    // Remove focus.
    this.removeFocus(layer);

    if(!layer.hasClass('active')){
      layer.trigger('active.layer', layer);
    }
  }

  /**
   * Remove focus for all elements.
   */
  Layer.prototype.removeFocus = function (layer) {

    layer.siblings('.layer.active').each(function () {
      var oDOM = $(this);
      oDOM.find('.content').blur();
      oDOM.trigger('deactive.layer', oDOM);
    });
  }

    /**
   * Text Layer specific implementation (Concret Class)
   *
   * param is a configuration object with the following properties:
   * content    (string) required // The initial text within the layer
   * fontSize   (number) optional // The size of the text (default: 12)
   * fontFamily (string) optional // The font to use (default: Arial)
   * top        (number) optional // The initial top position of the layer (default: 0)
   * left       (number) optional // The initial left position of the layer (default: 0)
   */
  function LayerText(param) {

    this.type = 'text';
    this.properties = $.extend({
      content   : "Your text here.",
      fontSize  : 12,
      fontFamily: "Arial",
      fontColor : "#000000",
      bold: false,
      italic: false
    }, param);

    // Building DOM related to the layer
    this.jDOM = $('<div class="layer ' + (this.properties.isLocked ? 'locked' : '') + '"><span class="content" ' + (!this.properties.isLocked ? 'contenteditable' : '') + '>' + this.properties.content + '</span></div>');

    // Finish initialization (must be before he code below to make
    // the "isLocked" work properly.
    Layer.init.call(this);

    if (!this.properties.isLocked) {
      this.jDOM
        // Record change on content edited
        .on('keyup', '.content', (function () {
          this.properties.content = this.jDOM.find('.content').html();
        }).bind(this))
        // Add a listener for text change.
        .on('blur', '.content', (function() {
          this.updateLayer();
        }).bind(this));

      if (this.properties.isDraggable) {
        // Make content editable not interfering with dragging
        this.jDOM.draggable({cancel: '.content'});
      }
    }
  }

  LayerText.prototype = new Layer();

  // Specific overload for LayerText
  LayerText.prototype.updateLayer = function () {
    this.jDOM.find('.content').css({
      "font-family" : this.properties.fontFamily,
      "font-size"   : this.properties.fontSize + "px",
      "color"       : this.properties.fontColor,
      "font-weight" : this.properties.bold ? 'bold' : 'normal',
      "font-style"  : this.properties.italic ? 'italic' : 'normal'
    });

    Layer.prototype.updateLayer.call(this);
  };

  /**
   * Image Layer specific implementation (Concret Class)
   *
   * param is a configuration object with the following properties:
   * content (string) required // The URL of the image to use on the layer
   * top     (number) optional // The initial top position of the layer (default: 0)
   * left    (number) optional // The initial left position of the layer (default: 0)
   */
  function LayerImage(param) {
    this.type = 'image';
    this.properties = $.extend({
      contentWidth: 0,
      contentHeight: 0,
      isResizable: true
    }, param);

    this.jDOM = $('<div class="layer ' + (this.properties.isLocked ? 'locked' : '') + '"><img class="content" src="' + this.properties.content + '"></div>');

    if (this.properties.contentWidth > 0 || this.properties.contentHeight > 0) {

      // Define image size before added to HTML content.
      this.jDOM.find('.content').css({
        width: this.properties.contentWidth,
        height: this.properties.contentHeight
      });

      // Initialize parent object.
      Layer.init.call(this);
    }
    else {

      // Get the size of the image and apply it through CSS to allow to resizable to work correctly.
      var img = new Image();
      img.src = this.properties.content;
      img.onload = function() {

        // Define image size before added to HTML content.
        this.jDOM.find('.content').css({
          width: img.width,
          height: img.height
        });

        // Initialize the layer properties too.
        this.properties.contentWidth = img.width;
        this.properties.contentHeight = img.height;

        // Initialize parent object.
        Layer.init.call(this);
      }.bind(this);
    }

  }

  LayerImage.prototype = new Layer();


  // -------------------------------------------------- //
  // jQuery Layer Plugin                                //
  // -------------------------------------------------- //
  // This plugin control all the layer interface        //
  // -------------------------------------------------- //

  $.fn.UILayer = function (param) {
    var options = $.extend({
      deletable : false, // Option for having the layer deletable or not
      deleteUI  : true,  // If the layer is deletable, enable the default UI
      isLocked  : false  // Option to lock the layer
    }, param);

    this.each(function () {
      var jDOM = $(this);
      jDOM.addClass('layer');

      // Callbacks action
      function activateMe() {
        jDOM.addClass('active');
      }

      function deactivateMe() {
        jDOM.removeClass('active');
      }

      function deleteMe() {
        jDOM.remove();
      }

      // Layer activation
      if (!options.isLocked) {
        jDOM
          // Bind action to custom events
          .on('active.layer',   activateMe)
          .on('deactive.layer', deactivateMe)

          // Trigger custom events based on real DOM events
          .on('mousedown focus', '.content', function () {
            Layer.prototype.giveFocus(jDOM);
          });

        // Make layers deletable
        if (options.deletable) {
          jDOM.on('delete.layer', deleteMe);

          // Add a remove button on layer
          if (options.deleteUI) {
            var deleteUI = $('<span role="button" class="delete" />');
            deleteUI.on('click', function () {
              jDOM.trigger('delete.layer');
            });

            jDOM.append(deleteUI);
          }
        }
      }
      else {
        jDOM.on('mousedown focus', function () {
          LayerManager.deactivateLayers();
        });
      }

    });

    return this;
  };


  // -------------------------------------------------- //
  // Control Management                                 //
  // -------------------------------------------------- //
  // Control is an interface to bind with form inputs   //
  // in order to broadcast their changes and listen for //
  // updates that should be push to them.               //
  // -------------------------------------------------- //

  /**
   * Basic object to deal with control input
   */
  function Control(fields) {
    this.fields = {};

    $.each(fields, (function (index, field) {
      this.fields[field] = $("#" + field).on('change', this.broadcast.bind(this));
    }).bind(this));

    $(document).on('layerchange',     Control.layerchange.bind(this));
    $(document).on('layerdeactivate', Control.layerdeactivate.bind(this));
    $(document).on('layerdelete', Control.layerdelete.bind(this));
  }

  // This method is called when the Control receive the layerchange Event
  // This is not in the prototype, therefor it is not inherited
  // It MUST be bound to the current layer to be usable
  Control.layerchange = function (event) {
    for (var f in event) {
      if (event.hasOwnProperty(f) && this.fields[f]) {
        if (typeof event[f] == 'boolean') {
          this.fields[f].prop('checked', event[f]);
        }
        else {
          this.fields[f].val(event[f]);
        }
      }
    }
  };

  // This method is called when the Control receive the layerdeactivate Event
  // This is not in the prototype, therefor it is not inherited
  // It MUST be bound to the current layer to be usable
  Control.layerdeactivate = function () {
    $('form')[0].reset();
  };

  // This method is called when the Control receive the layerdelete Event
  // This is not in the prototype, therefor it is not inherited
  // It MUST be bound to the current layer to be usable
  Control.layerdelete = function () {
    $('form')[0].reset();
  };


  // INHERITED METHODS

  // Trigger the controlchange event
  Control.prototype.broadcast = function (event) {
    var data = $.Event("controlchange");

    var target = $(event.target);
    if (target.attr('type') == 'checkbox') {
      data[event.target.id] = target.prop('checked');
    }
    else {
      data[event.target.id] = target.val();
    }

    $(document).trigger(data);
  };


  // -------------------------------------------------- //
  // jQuery Control Plugin                              //
  // -------------------------------------------------- //
  // This plugin control all the Control interface      //
  // -------------------------------------------------- //

  $.fn.UIControl = function () {
    this.each(function () {
      var ids = [];

      // This assume a simple régular HTML form
      // It will require some extra work to add
      // third party custom input.
      $(this).find('input, select, textarea').each(function () {
        if(this.id) { ids.push(this.id); }
      });

      this.control = new Control(ids);
    });

    return this;
  };


  // -------------------------------------------------- //
  // Only LayerManager is exposed to the global space   //
  // -------------------------------------------------- //

  return LayerManager;
})(jQuery, window);


// -------------------------------------------------- //
// Global initialisation (assuming $ === jQuery)      //
// -------------------------------------------------- //

$(function () {
  LayerManager.init();

  $('#control fieldset').UIControl();

  // Gestion du menu
  $('#textBt').on('click', function () {
    LayerManager.create('text', {content: 'Saisissez votre texte ici'});
  });

  $('#textLockedBt').on('click', function () {
    LayerManager.create('text', {content: 'Saisissez votre texte ici', isLocked: true});
  });

  $('#imageBt').on('click', function () {
    LayerManager.create('image', {content: window.prompt("Merci de fournir l'adresse d'une image","http://fr.clever-age.com/IMG/png/3logos.png")});
  });

  $('#imageBgBt').on('click', function () {
    LayerManager.create('image', {
      content: '/css/img/nature-q-g-640-480-5.jpg',
      isLocked: true
    });
  });


  $('#emptyBt').on('click', function() {

    // Removing previous work
    var layersLength = LayerManager.layers.length;
    for (var index = 0; index < layersLength; index++) {
      LayerManager.layers[0].destroy();
    }
    clearAutoSave();

  });

  // Handeling storage:

  // Create the data store.
  var store = new Lawnchair(function() {});

  function saveMe() {
    var data = [];

    $.each(LayerManager.layers, function (index, layer) {
      var obj = {
        type : layer.type,
        param: layer.properties
      };

      data.push(obj);
    });

    store.save({
      key    : 'myCard',
      myCard : data
    });
    clearAutoSave();
  }

  function getMe() {

    // Removing previous work
    var layersLength = LayerManager.layers.length;
    for (var index = 0; index < layersLength; index++) {
      LayerManager.layers[0].destroy();
    }
    clearAutoSave();

    // Retreiving previous work
    store.get('myCard', function (data) {
      $.each(data.myCard, function (index, obj) {
        LayerManager.create(obj.type, obj.param);
      });
    });
  }

  $('#saveBt').on('click', saveMe);
  $('#loadBt').on('click', getMe);

  // Enable auto save up to 5 second after a change:

  var pendingSave = null;

  function autoSave() {
    if (!pendingSave) {
      pendingSave = window.setTimeout(function () {
        pendingSave = null;
        saveMe();
      }, 5000);
    }
  }

  function clearAutoSave() {
    if (pendingSave) {
      window.clearTimeout(pendingSave);
      pendingSave = null;
    }
  }

  $(document).on('layerchange change keyup layerdelete', autoSave);


  // Show the colors available.
  $('input[name=fixedColors]').spectrum({
      flat: true,
      preferredFormat: "hex",
      showPalette: true,
      showPaletteOnly: true,
      palette: [
          ['#ff0000', '#00ff00', '#0000ff']
      ],
      change: function(color) {
          $('input[name=customColor]').spectrum('set', color);
      }
  });

  // Show the color picker for custom color.
  $('input[name=customColor]').spectrum({
      color: parent.fontColor,
      showInput: true,
      showButtons: false,
      showPalette: false
  });
  $('input[name=customColor]').show();
  $('input[name=customColor]').blur(function() {
      jQuery(this).spectrum('set', jQuery(this).val());
  });
  $('input[name=customColor]').keyup(function(event) {

      // If this is the ENTER key which has been hit, change the value.
      if (event.keyCode == 13) {
          jQuery(this).spectrum('set', jQuery(this).val());
      }
  });

});