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
    },

    // Load a map.
    loadMap: function(map) {

      // Create the grid.
      this.grid = new Grid(map).create();

      // Prepare vector for moving.
      this.vectorHorizontal = new Point(0, 0) + new Point(this.grid.getSizeSide(), 0);
      this.vectorVertical = new Point(0, 0) + new Point(0, this.grid.getSizeSide());

      return this;
    },


    start: function (options) {

      // Display an error of no map has been loaded.
      if (this.grid == null) {
        throw 'No map has been loaded.';
      }

      project.currentStyle = {
        strokeColor: '#000000',
        strokeWidth: 1
      }

      // Initialize options.
      this.properties = $.extend(options, this.properties);

      // Create the player.
      this.player = new Player({
        initialPosition: this.grid.getPosition(),
        size: this.grid.getSizeSide() / 2,
        fillColor: '#000000'
      }).create();

      return this;
    },

    movePlayer: function(event) {

      // If the player is currently moving, don't move again.
      if (this.player.isMoving()) {
        return false;
      }

      // Calculate the max size for a cell.
      var maxCellSize = new Size(this.grid.getSizeSide(), this.grid.getSizeSide());

      // Define the vector for moving.
      var vector = null;

      if (event.key == 'right' && this.player.getPosition().x < (maxCellSize.width * this.grid.getMaxGridColumns() - this.grid.getSizeSide())) {
        vector = this.vectorHorizontal;
      }
      else if (event.key == 'left' && this.player.getPosition().x > this.grid.getSizeSide()) {
        vector = -this.vectorHorizontal;
      }
      else if (event.key == 'down' && this.player.getPosition().y < (maxCellSize.height * this.grid.getMaxGridLines() - this.grid.getSizeSide())) {
        vector = this.vectorVertical;
      }
      else if (event.key == 'up' && this.player.getPosition().y > this.grid.getSizeSide()) {
        vector = -this.vectorVertical;
      }
console.log('VECTOR:');
console.log(vector);
console.log('POSITION:');
console.log(this.player.getPosition());
      // Check if the player is going on a blocked box.
      var box = this.grid.getBox(this.player.getPosition() + vector);
console.log('BOX:');
console.log(box);
      if (box.isBlocked()) {
        return false;
      }

      // Move the player.
      this.player.move(vector);

      return this;
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
      grid: [],
      blocked: [], // Blocked boxes.

      // Coordinates of the start and end boxes for the game.
      startCoordinates: [0, 0],
      endCoordinates: [0, 0]
    }, param);

    var maxCellSize = new Size(properties.sizeSide, properties.sizeSide);

    function create() {

      // Create the grid game.
      for (var i = 0; i < properties.maxGridLines; i++) {

        for (var j = 0; j < properties.maxGridColumns; j++) {

          // Check if the box is the start or end box.
          var type = 'standard';
          if (i == properties.startCoordinates[0] && j == properties.startCoordinates[1]) {
            properties.grid[i][j].type = 'start';
          }
          else if (i == properties.endCoordinates[0] && j == properties.endCoordinates[1]) {
            properties.grid[i][j].type = 'end';
          }

          properties.grid[i][j] = new Box(properties.grid[i][j]).create();
        }
      }

      // Block boxes if defined.
      for (i = 0; i < properties.blocked.length; i++) {
        blockBox(properties.blocked[i][0], properties.blocked[i][1]);
      }


      // Return the current object to be used later.
      return this;
    }

    function getPosition() {
      return properties.grid[0][0].getPosition();
    }

    function getSizeSide() {
      return properties.sizeSide;
    }

    function getMaxGridLines() {
      return properties.maxGridLines;
    }

    function getMaxGridColumns() {
      return properties.maxGridColumns;
    }

    function checkBox(x, y) {
      properties.grid[y][x].check();
    }

    function blockBox(x, y) {
      properties.grid[y][x].block();
    }

    function getBox(position) {
      for (var i = 0; i < properties.maxGridLines; i++) {
        for (var j = 0; j < properties.maxGridColumns; j++) {
          if (properties.grid[i][j].getPosition() == position) {
            return properties.grid[i][j];
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
      getPosition: getPosition,
      getSizeSide: getSizeSide,
      getMaxGridLines: getMaxGridLines,
      getMaxGridColumns: getMaxGridColumns
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
      fillColor: '#000000',
      speed: 4
    }, param);

    var player = null,
        moving = false,
        destination = null;

    function create() {

      // Create the player.
      player = new Path.Circle(properties.initialPosition, properties.size);
      player.fillColor = properties.fillColor;

      $(document).on('game.tick', (function(event) {

        // If the element is moving.
        if (moving) {

          // Move the player.
          var vector = destination - player.position;
          player.position += vector / properties.speed;

          // Stop moving under a treshold.
          if (vector.length < 1) {
            moving = false;
            player.position = destination;
          }
        }

      }).bind(this));

      // Return the current object to be used later.
      return this;
    }

    function getPosition() {
      return player.position;
    }

    function isMoving() {
      return moving;
    }

    function move(vector) {

      // Specify that the player is moving.
      moving = true;

      // Store the destination point.
      destination = player.position + vector;

      // Trigger the event.
      $(document).trigger('player.move', player.position);
    }

    return {
      create: create,
      getPosition: getPosition,
      isMoving: isMoving,
      move: move
    };

  }

  return Game;

})(jQuery);

function onFrame(event) {
  $(document).trigger('game.tick');

}


function onKeyDown(event) {

  console.log(event.key);
  Game.movePlayer(event);

}

var map = {
  grid: [],
  maxGridLines: 5,
  maxGridColumns: 5,
  sizeSide: 50,
  startCoordinates: [0, 0],
  endCoordinates: [4, 4],
  blocked: [
    [2, 1],
    [3, 1],
  ]
};

for (var i = 0; i < map.maxGridLines; i++) {

  map.grid[i] = [];

  for (var j = 0; j < map.maxGridColumns; j++) {

    var currentPoint = [j * map.sizeSide, i * map.sizeSide];

    // Check if the box is the start or end box.
    var type = 'standard';

    map.grid[i][j] = {
      point: currentPoint,
      maxCellSize: map.sizeSide,
      type: 'standard'
    };
  }
}
console.log('MAP:');
console.log(map);


Game.loadMap(map).start();