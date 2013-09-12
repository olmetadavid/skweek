var Game = (function ($) {

  // -------------------------------------------------- //
  // Game class                                         //
  // -------------------------------------------------- //
  // Manage the game elements : grid, boxes and player. //
  // -------------------------------------------------- //

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
//
//      // Create the grid.
//      this.grid = new Grid({
//        maxGridLines: this.properties.maxGridLines,
//        maxGridColumns: this.properties.maxGridColumns,
//        sizeSide: this.properties.sizeSide
//      }).create();
//
      // Create the player.
      this.player = new Player({
        initialPosition: this.grid.getPosition(),
        size: this.properties.sizeSide / 2,
        fillColor: '#000000'
      }).create();
//
//      // Prepare vector for moving.
//      this.vectorHorizontal = new Point(0, 0) + new Point(this.properties.sizeSide, 0);
//      this.vectorVertical = new Point(0, 0) + new Point(0, this.properties.sizeSide);
//
//      // FOR TEST.
//      this.grid.blockBox(5, 5);
//      this.grid.blockBox(6, 5);
//      this.grid.blockBox(7, 5);
//      this.grid.blockBox(8, 5);

    },

    movePlayer: function(event) {

      // Calculate the max size for a cell.
      var maxCellSize = new Size(this.properties.sizeSide, this.properties.sizeSide);

      // Define the vector for moving.
      var vector = null;

      if (event.key == 'right' && this.player.getPosition().x < (maxCellSize.width * 10 - this.properties.sizeSide)) {
        vector = this.vectorHorizontal;
      }
      else if (event.key == 'left' && this.player.getPosition().x > this.properties.sizeSide) {
        vector = -this.vectorHorizontal;
      }
      else if (event.key == 'down' && this.player.getPosition().y < (maxCellSize.height * 10 - this.properties.sizeSide)) {
        vector = this.vectorVertical;
      }
      else if (event.key == 'up' && this.player.getPosition().y > this.properties.sizeSide) {
        vector = -this.vectorVertical;
      }

      // Check if the player is going on a blocked box.
      var box = this.grid.getBox(this.player.getPosition() + vector);

      if (box.isBlocked()) {
        return false;
      }

      // Move the player.
      this.player.move(vector);
    },

    // Load a map.
    loadMap: function(map) {

      // Initialize some game properties.
      this.properties.maxGridColumns = map.maxGridColumns;
      this.properties.maxGridLines = map.maxGridLines;
      this.properties.sizeSide = map.sizeSide;

      // Create the grid.
      this.grid = new Grid({
        maxGridLines: this.properties.maxGridLines,
        maxGridColumns: this.properties.maxGridColumns,
        sizeSide: this.properties.sizeSide
      }).create();

      // Prepare vector for moving.
      this.vectorHorizontal = new Point(0, 0) + new Point(this.properties.sizeSide, 0);
      this.vectorVertical = new Point(0, 0) + new Point(0, this.properties.sizeSide);

      // FOR TEST.
      this.grid.blockBox(5, 5);
      this.grid.blockBox(6, 5);
      this.grid.blockBox(7, 5);
      this.grid.blockBox(8, 5);
    }

  };


  // -------------------------------------------------- //
  // Grid class                                         //
  // -------------------------------------------------- //
  // Represent the grid of the game                     //
  // -------------------------------------------------- //

  function Grid (param) {

    var properties = $.extend({
      maxGridLines: 10,
      maxGridColumns: 10,
      sizeSide: 50,

      // Coordinates of the start and end boxes for the game.
      startCoordinates: [0, 0],
      endCoordinates: [9, 9]
    }, param);

    var grid = [];
    var maxCellSize = new Size(properties.sizeSide, properties.sizeSide);

    function create() {

      // Create the grid game.
      for (var i = 0; i < properties.maxGridLines; i++) {

        grid[i] = [];

        for (var j = 0; j < properties.maxGridColumns; j++) {

          var currentPoint = [i * maxCellSize.width, j * maxCellSize.height];

          // Check if the box is the start or end box.
          var type = 'standard';
          if (i == properties.startCoordinates[0] && j == properties.startCoordinates[1]) {
            type = 'start';
          }
          else if (i == properties.endCoordinates[0] && j == properties.endCoordinates[1]) {
            type = 'end';
          }

          grid[i][j] = new Box({
            point: currentPoint,
            maxCellSize: maxCellSize,
            type: type
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

    function blockBox(x, y) {
      grid[x][y].block();
    }

    function getBox(position) {
      for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
          if (grid[i][j].getPosition() == position) {
            return grid[i][j];
          }
        }
      }

      return null;
    }

    return {
      checkBox: checkBox,
      blockBox: blockBox,
      create: create,
      getBox: getBox,
      getPosition: getPosition
    }
  }

  // -------------------------------------------------- //
  // Box class                                          //
  // -------------------------------------------------- //
  // Represent a box in the grid                        //
  // -------------------------------------------------- //

  function Box (param) {

    var properties = $.extend({
      checked: false,
      blocked: false,
      type: 'standard',
      point: null,
      maxCellSize: null,
      strokeColor: '#000000',
      fillColorStart: '#00FF00',
      fillColorEnd: '#0000FF',
      fillColorChecked: '#FF0000',
      fillColorBlocked: '#CCCCCC'
    }, param);

    var path = null;

    function create() {

      // Create the path.
      path = new Path.Rectangle(properties.point, properties.maxCellSize);
      path.strokeColor = properties.strokeColor;

      // Fill with color according to the type.
      if (properties.type == 'start') {
        path.fillColor = properties.fillColorStart;
      }
      else if (properties.type == 'end') {
        path.fillColor = properties.fillColorEnd;
      }

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
      if (properties.type == 'standard') {
        path.fillColor = properties.fillColorChecked
      }
    }

    function block() {

      // Change the property.
      properties.blocked = true;

      // Color the box.
      path.fillColor = properties.fillColorBlocked
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
      block: block,
      getPosition: getPosition
    };
  };


  // -------------------------------------------------- //
  // Player class                                       //
  // -------------------------------------------------- //
  // Represent the player                               //
  // -------------------------------------------------- //
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

var map = {
  grid: [],
  maxGridLines: 10,
  maxGridColumns: 10,
  sizeSide: 50,
  startCoordinates: [0, 0],
  endCoordinates: [0, 0]
};

for (var i = 0; i < map.maxGridLines; i++) {

  map.grid[i] = [];

  for (var j = 0; j < map.maxGridColumns; j++) {

    var currentPoint = [i * map.sizeSide, j * map.sizeSide];

    // Check if the box is the start or end box.
    var type = 'standard';

    map.grid[i][j] = {
      point: currentPoint,
      maxCellSize: map.sizeSide,
      type: 'standard'
    };
  }
}

console.log(map);