var Game = (function ($) {

  // -------------------------------------------------- //
  // Game class                                         //
  // -------------------------------------------------- //
  // Manage the game elements : grid, boxes and player. //
  // -------------------------------------------------- //

  var Game = {

    grid: null,
    player: null,
    enemies: null,
    vectorHorizontal: null,
    vectorVertical: null,
    gameOver: false,
    isWinner: false,
    properties: {
    },

    // Load a map.
    loadMap: function(map) {

      // Create the grid.
      this.grid = new Grid(map.grid).create();
      this.enemies = map.enemies;

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

      // Create enemies.
      for (var i = 0; i < this.enemies.length; i++) {

        // Define size.
        this.enemies[i].size = this.grid.getSizeSide() / 3;

        // Create and reference the enemy.
        this.enemies[i] = new Enemy(this.enemies[i]).create();
      }

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

      // Check if the player is going on a blocked box.
      var box = this.grid.getBoxByPosition(this.player.getPosition() + vector);

      if (box.isBlocked()) {
        return false;
      }

      // Move the player.
      this.player.move(vector);

      return this;
    },

    // Define is the game is finished.
    isFinished: function() {
      return this.grid.isCompleted();
    },

    // Define the game as over.
    over: function() {
      this.gameOver = true;
      console.log('GAME OVER !');
    },

    isGameOver: function() {
      return this.gameOver;
    },

    loose: function() {
      this.isWinner = false;
      console.log('YOU LOOSE !');
      this.over();
    },

    win: function() {
      this.isWinner = true;
      console.log('YOU WIN !');
      this.over();
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

    function getBox(x, y) {
      return properties.grid[y][x];
    }

    function getBoxByPosition(position) {
      for (var i = 0; i < properties.maxGridLines; i++) {
        for (var j = 0; j < properties.maxGridColumns; j++) {
          if (properties.grid[i][j].getPosition() == position) {
            return properties.grid[i][j];
          }
        }
      }

      return null;
    }

    function isCompleted() {
      for (var i = 0; i < properties.maxGridLines; i++) {
        for (var j = 0; j < properties.maxGridColumns; j++) {
          if (properties.grid[i][j].getType() == 'standard' &&
              !properties.grid[i][j].isBlocked() &&
              !properties.grid[i][j].isChecked()) {
            return false;
          }
        }
      }

      return true;
    }

    return {
      checkBox: checkBox,
      blockBox: blockBox,
      create: create,
      getBox: getBox,
      getBoxByPosition: getBoxByPosition,
      getPosition: getPosition,
      getSizeSide: getSizeSide,
      getMaxGridLines: getMaxGridLines,
      getMaxGridColumns: getMaxGridColumns,
      isCompleted: isCompleted
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

      // Manage player moves.
      $(document).on('player.moved', (function(event, point) {

        if (point == path.position) {
          this.check();

          // If the box is the end of the game.
          if (properties.type == 'end') {

            // Check if all the standard boxes is checked.
            if (Game.isFinished() && !Game.isGameOver()) {
              Game.win();
            }

          }
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

    function isSpecial() {
      return isBlocked() || properties.type != 'standard';
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
      isSpecial: isSpecial,
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
      speed: 2
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

          // Trigger the event.
          $(document).trigger('player.moving', player.position);

          // Stop moving under a treshold.
          if (vector.length < 1) {
            moving = false;
            player.position = destination;

            // Trigger the event.
            $(document).trigger('player.moved', player.position);
          }
        }

      }).bind(this));

      // Return the current object to be used later.
      return this;
    }

    function getPosition() {
      return player.position;
    }

    function getPlayer() {
      return player;
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
      getPlayer: getPlayer,
      isMoving: isMoving,
      move: move
    };

  }

  // -------------------------------------------------- //
  // Enemy class                                       //
  // -------------------------------------------------- //
  // Represent an enemy                                //
  // -------------------------------------------------- //

  function Enemy(param) {

    var properties = $.extend({
      paths: [],
      size: 100,
      fillColor: '#FF0000',
      speed: 50,
      moveType: 'random'
    }, param);

    var enemy = null,
        direction = null,
        distance = null,
        index = 0,
        next = 1,
        sign = 1;

    function create() {

      // If there is not enough paths.
      if (properties.paths.length < 2) {
        return false;
      }

      if (properties.moveType == 'fixed') {

        // Create all paths.
        for (var i = 0; i < properties.paths.length; i++) {

          // Get the position of the origin and destination.
          var point = Game.grid.getBox(properties.paths[i][0], properties.paths[i][1]);

          // Calculate some data for enemy.
          properties.paths[i] = point.getPosition();
        }
      }
      else {

        // Generate random paths.
        random();

      }


      // Create the enemy.
      enemy = new Path.Circle(properties.paths[0], properties.size);
      enemy.fillColor = properties.fillColor;

      // Define the direction and the distance.
      direction = properties.paths[1] - properties.paths[0];
      distance = direction.length;

      $(document).on('game.tick', (function(event) {

        // If the enemy has touched the player, the game is over.
        if (enemy.getIntersections(Game.player.getPlayer()).length > 0) {
          Game.loose();
        }

        // Calculate the distance left.
        distance = distance - (direction.length / properties.speed);

        // Move the enemy in the good direction.
        enemy.position += direction / properties.speed;

        // Stop moving under a treshold.
        if (distance <= 0) {

          // Increase or decrease current counter according to the sign (+1 or -1).
          index = index + sign;

          // Place the enemy if arrives on point.
          enemy.position = properties.paths[index];

          // Change the sign to change the direction.
          if (index == properties.paths.length - 1) {
            sign = -1;
          }
          else if (index == 0) {
            sign = 1;
          }

          // Calculate the index of the next position.
          next = next + sign;
          direction = properties.paths[index + sign] - properties.paths[index];

          // Calculate the distance.
          distance = direction.length;
        }

        // Trigger the event.
        $(document).trigger('enemy.moved', enemy.position);

      }).bind(this));

      // Manage player moves.
      $(document).on('player.moving', (function(event, point) {


      }).bind(this));

      // Automatically move the enemy.
      move();

      // Return the current object to be used later.
      return this;
    }

    function move() {
      moving = true;
    }

    function random() {

      var pathsLength = 10;

      // Initialize the paths array.
      properties.paths = [];
      var x = -1,
          y = -1;

      // Create all paths.
      for (var i = 0; i < pathsLength; i++) {

        var position = null,
            originX = x,
            originY = y;

        do {

          // Define axis move.
          var isVertical = (Math.round(Math.random()) == 0) ? false : true;

          // Create a random point as start point.
          if (properties.paths.length == 0) {
            originX = x = Math.floor(Math.random() * (Game.grid.getMaxGridColumns() - 1));
            originY = y = Math.floor(Math.random() * (Game.grid.getMaxGridLines() - 1));
          }
          else {

            // Create random coordinates around the starting point.
            if (isVertical) {
              y = originY + Math.floor(Math.random() * 3 - 1);
              x = originX;
            }
            else {
              x = originX + Math.floor(Math.random() * 3 - 1);
              y = originY;
            }
          }

          // Get a valid position.
          position = getBox(x, y);

        } while (position == false);

        // Add the position to the path.
        properties.paths[i] = position;
      }

    }

    function getBox(x, y) {

      // Check if the position is out of the game.
      if (x < 0 || y < 0 ||
          x >= Game.grid.getMaxGridColumns() ||y >= Game.grid.getMaxGridLines()) {
        return false;
      }

      // Get the point.
      var point =  Game.grid.getBox(x, y);

      // Check if the point isn't special.
      if (point.isSpecial()) {
        return false;
      }

      // Check if the point has been added.
      for (j = 0; j < properties.paths.length; j++) {
        if (properties.paths[j].x == point.getPosition().x &&
          properties.paths[j].y == point.getPosition().y) {
          return false;
        }
      }

      return point.getPosition();

    }


    return {
      create: create
    }

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
  grid: {
    grid: [],
    maxGridLines: 5,
    maxGridColumns: 5,
    sizeSide: 50,
    startCoordinates: [0, 0],
    endCoordinates: [4, 4],
    blocked: [
      [2, 1],
      [3, 1]
    ]
  },
  enemies: [
    {
      paths: [
        [2, 0],
        [4, 0],
        [4, 1]
      ]
    },
    {
      paths: [
        [0, 4],
        [1, 4],
        [2, 4]
      ]
    }
  ]
};

for (var i = 0; i < map.grid.maxGridLines; i++) {

  map.grid.grid[i] = [];

  for (var j = 0; j < map.grid.maxGridColumns; j++) {

    var currentPoint = [j * map.grid.sizeSide, i * map.grid.sizeSide];

    // Check if the box is the start or end box.
    var type = 'standard';

    map.grid.grid[i][j] = {
      point: currentPoint,
      maxCellSize: map.grid.sizeSide,
      type: 'standard'
    };
  }
}


Game.loadMap(map).start();