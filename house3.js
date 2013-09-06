
project.currentStyle = {
    strokeColor: '#000000',
    strokeWidth: 3
}

// Create the house wall.
var point = new Point(500, 500);
var housePath = new Path.Rectangle(point, point + [100, 100]);

// Create the house roof.
var path = new Path();

point = point + [0, 0];
path.moveTo(point);

point = point + [50, -50];
path.lineTo(point);

point = point + [50, 50];
path.lineTo(point);


var radius = 30;
var branchWidth = 20;
point = point + [100, -100];

path = new Path();
var vector = new Point({
    angle: 45,
    length: 50
});



path.segments = [
    [[200, 200], 0, vector],
    [[300, 200], vector.rotate(90), vector.rotate(-90)],
    [[400, 200], vector.rotate(180), 0]
];
path.fullySelected = true;


var sunBranches = new Path();
sunBranches.segments = [
    [[800, 400]],
    [[900, 400]],
    [[850, 400]],
    [[850, 350]],
    [[850, 450]]
];

var rotation = 0;

// Create the sun center.
var sun = 30;
sun = new Path.Circle({
    center: [850, 400],
    radius: radius,
    strokeColor: 'black',
    fillColor: 'yellow'
});

function onKeyDown(event) {
    if (event.key == 'right') {
        rotation += 1;
    }
    else if (event.key == 'left') {
        rotation -= 1;
    }
}

function onFrame(event) {
    sunBranches.rotate(rotation);
}