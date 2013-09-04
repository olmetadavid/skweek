
// Create the house wall.
var path = new Path();
path.strokeColor = 'black';

var point = new Point(500, 500);

path.moveTo(point);

point = point + [0, -100];
path.lineTo(point);

point = point + [100, 0];
path.lineTo(point);

point = point + [0, 100];
path.lineTo(point);

point = point + [-100, 0];
path.lineTo(point);


// Create the house roof.
path = new Path();
path.strokeColor = 'black';

point = point + [0, -100];
path.moveTo(point);

point = point + [50, -50];
path.lineTo(point);

point = point + [50, 50];
path.lineTo(point);


// Create the sun center.
var radius = 30;
var branchWidth = 20;
point = point + [100, -100];
path = new Path.Circle({
    center: point,
    radius: radius,
    strokeColor: 'black'
});

// Create the sun branches.
path = new Path();
path.strokeColor = 'black';

point = point + [0, -radius];
path.moveTo(point);

point = point + [0, -branchWidth];
path.lineTo(point);

path = new Path();
path.strokeColor = 'black';

point = point + [radius, radius + branchWidth];
path.moveTo(point);

point = point + [branchWidth, 0];
path.lineTo(point);

path = new Path();
path.strokeColor = 'black';

point = point + [-2*radius - branchWidth, 0];
path.moveTo(point);

point = point + [-branchWidth, 0];
path.lineTo(point);

path = new Path();
path.strokeColor = 'black';

point = point + [radius + branchWidth, radius];
path.moveTo(point);

point = point + [0, branchWidth];
path.lineTo(point);