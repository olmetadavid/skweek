project.currentStyle = {
    strokeColor: '#000000',
    strokeWidth: 1
}

var grid = [];

var maxGridLines = 10,
    maxGridColumns = 10,
    sizeSide = 50,
    maxCellSize = new Size(sizeSide, sizeSide),
    startPoint = new Point(maxCellSize, maxCellSize);

// Prepare vector for moving.
var vectorHorizontal = new Point(0, 0) + new Point(sizeSide, 0);
var vectorVertical = new Point(0, 0) + new Point(0, sizeSide);

// Create the grid game.
var currentPoint = startPoint;
for (var i = 0; i < maxGridLines; i++) {

    grid[i] = [];

    for (var j = 0; j < maxGridColumns; j++) {

        currentPoint = [i * maxCellSize.width, j * maxCellSize.height];

        grid[i][j] = new Path.Rectangle(currentPoint, maxCellSize);
        grid[i][j].strokeColor = 'black';
    }
}

// Create the player.
var player = new Path.Circle(grid[0][0].position, sizeSide / 2);
player.fillColor = '#FF0000';


function onKeyDown(event) {

    console.log(event.key);
    movePlayer(event)

}

function movePlayer(event) {

    if (event.key == 'right' && player.position.x < (maxCellSize.width * 10 - sizeSide)) {
        player.position += vectorHorizontal;
    }
    else if (event.key == 'left' && player.position.x > sizeSide) {
        player.position -= vectorHorizontal;
    }
    else if (event.key == 'down' && player.position.y < (maxCellSize.height * 10 - sizeSide)) {
        player.position += vectorVertical;
    }
    else if (event.key == 'up' && player.position.y > sizeSide) {
        player.position -= vectorVertical;
    }


}