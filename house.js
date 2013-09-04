
// Create the house wall.
var point = new Point(500, 500);
var housePath = new Path.Rectangle(point, point + [100, 100]);
housePath.strokeColor = 'black';


// Create the house roof.
var path = new Path();
path.strokeColor = 'black';

point = point + [0, 0];
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
var branches = [];
branches['b1'] = new Path();
branches['b1'].strokeColor = 'black';

point = point + [0, -radius];
branches['b1'].moveTo(point);

point = point + [0, -branchWidth];
branches['b1'].lineTo(point);

branches['b2'] = new Path();
branches['b2'].strokeColor = 'black';

point = point + [radius, radius + branchWidth];
branches['b2'].moveTo(point);

point = point + [branchWidth, 0];
branches['b2'].lineTo(point);

branches['b3'] = new Path();
branches['b3'].strokeColor = 'black';

point = point + [-2*radius - branchWidth, 0];
branches['b3'].moveTo(point);

point = point + [-branchWidth, 0];
branches['b3'].lineTo(point);

branches['b4'] = new Path();
branches['b4'].strokeColor = 'black';

point = point + [radius + branchWidth, radius];
branches['b4'].moveTo(point);

point = point + [0, branchWidth];
branches['b4'].lineTo(point);


function onFrame(event) {

   for (var element in branches) {
       branches[element].rotate(3);
   }

}

var clickPath;

function onMouseDown(event) {
    clickPath = new Path();
    clickPath.strokeColor = 'black';
    clickPath.add(event.point);
}

function onMouseDrag(event) {
    clickPath.add(event.point);
}