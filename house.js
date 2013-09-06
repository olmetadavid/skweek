
project.currentStyle = {
    strokeColor: '#000000',
    strokeWidth: 1
}

var grid = [];

var maxGridLines = 10,
    maxGridColumns = 10,
    maxCellSize = new Size(50, 50),
    startPoint = new Point(maxCellSize, maxCellSize);

var currentPoint = startPoint;

for (var i = 0; i < maxGridLines; i++) {

    grid[i] = [];

    for (var j = 0; j < maxGridColumns; j++) {

        currentPoint = [i * maxCellSize.width, j * maxCellSize.height];

        grid[i][j] = new Path.Rectangle(currentPoint, maxCellSize);
        grid[i][j].strokeColor = 'black';

    }
}

grid[8][5].fillColor = '#FF0000';