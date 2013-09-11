var Game = (function ($) {

  var Game = {

    grid: null,
    player: null,
    vectorHorizontal: null,
    vectorVertical: null,
    properties: {
      maxGridLines: 10,
      maxGridColumns: 10,
      sizeSide: 50
    },

    init: function (options) {

      project.currentStyle = {
        strokeColor: '#000000',
        strokeWidth: 1
      }

      // Initialize options.
      this.properties = $.extend(options, this.properties);

      // Create the grid.
      this.grid = new Grid({
        maxGridLines: this.properties.maxGridLines,
        maxGridColumns: this.properties.maxGridColumns,
        sizeSide: this.properties.sizeSide
      }).create();

      // Create the player.
      this.player = new Player({
        initialPosition: this.grid.getPosition(),
        size: this.properties.sizeSide / 2,
        fillColor: '#000000'
      }).create();

      // Prepare vector for moving.
      this.vectorHorizontal = new Point(0, 0) + new Point(this.properties.sizeSide, 0);
      this.vectorVertical = new Point(0, 0) + new Point(0, this.properties.sizeSide);

      this.grid.checkBox(5, 5);

    },

    movePlayer: function(event) {

      // Calculate the max size for a cell.
      var maxCellSize = new Size(this.properties.sizeSide, this.properties.sizeSide);

      if (event.key == 'right' && this.player.getPosition().x < (maxCellSize.width * 10 - this.properties.sizeSide)) {
        this.player.move(this.vectorHorizontal);
      }
      else if (event.key == 'left' && this.player.getPosition().x > this.properties.sizeSide) {
        this.player.move(-this.vectorHorizontal);
      }
      else if (event.key == 'down' && this.player.getPosition().y < (maxCellSize.height * 10 - this.properties.sizeSide)) {
        this.player.move(this.vectorVertical);
      }
      else if (event.key == 'up' && this.player.getPosition().y > this.properties.sizeSide) {
        this.player.move(-this.vectorVertical);
      }
    }

  };

  function Grid (param) {

    var properties = $.extend({
      maxGridLines: 10,
      maxGridColumns: 10,
      sizeSide: 50
    }, param);

    var grid = [];
    var maxCellSize = new Size(properties.sizeSide, properties.sizeSide);

    function create() {

      // Create the grid game.
      for (var i = 0; i < properties.maxGridLines; i++) {

        grid[i] = [];

        for (var j = 0; j < properties.maxGridColumns; j++) {

          var currentPoint = [i * maxCellSize.width, j * maxCellSize.height];

          grid[i][j] = new Box({
            point: currentPoint,
            maxCellSize: maxCellSize
          }).create();
        }
      }

      // Return the current object to be used later.
      return this;
    }

    function getPosition() {
      return grid[0][0].getPosition();
    }

    function checkBox(x, y) {
      grid[x][y].check();
    }

    return {
      checkBox: checkBox,
      create: create,
      getPosition: getPosition
    }
  }

  function Box (param) {

    var properties = $.extend({
      checked: false,
      blocked: false,
      type: 'standard',
      point: null,
      maxCellSize: null,
      strokeColor: '#000000',
      fillColorChecked: '#FF0000'
    }, param);

    var path = null;

    function create() {

      // Create the path.
      path = new Path.Rectangle(properties.point, properties.maxCellSize);
      path.strokeColor = properties.strokeColor;

      $(document).on('player.move', (function(event, point) {

        if (point == path.position) {
          this.check();
        }
      }).bind(this));

      // Return the current object to be used later.
      return this;
    }

    function isChecked() {
      return properties.checked;
    }

    function isBlocked() {
      return properties.blocked;
    }

    function getType() {
      return properties.type;
    }

    function check() {

      // Change the property.
      properties.checked = true;

      // Color the box.
      path.fillColor = properties.fillColorChecked
    }

    function getPosition() {
      return path.position;
    }

    return {
      create: create,
      isChecked: isChecked,
      isBlocked: isBlocked,
      getType: getType,
      check: check,
      getPosition: getPosition
    };
  };


  function Player(param) {

    var properties = $.extend({
      initialPosition: [0, 0],
      size: 100,
      fillColor: '#000000'
    }, param);

    var player = null;

    function create() {

      // Create the player.
      player = new Path.Circle(properties.initialPosition, properties.size);
      player.fillColor = properties.fillColor;

      // Return the current object to be used later.
      return this;
    }

    function getPosition() {
      return player.position;
    }

    function move(vector) {

      // Move the player.
      player.position += vector;

      // Trigger the event.
      $(document).trigger('player.move', player.position);
    }

    return {
      create: create,
      getPosition: getPosition,
      move: move
    };

  }

  return Game;

})(jQuery);

Game.init();


function onKeyDown(event) {

  console.log(event.key);
  Game.movePlayer(event)

}
