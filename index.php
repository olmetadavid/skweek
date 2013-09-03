<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title></title>
    
    <script type="text/javascript" src="js/paper-full.js"></script>
    <script type="text/paperscript" canvas="cv">
      var path = new Path();
      path.strokeColor = 'black';
      
      var start = new Point(100, 100);
      
      path.move(start);
      
      path.lineTo(start + [100, -50]);
      
    </script>
  </head>
  <body>
    
    <canvas id="cv" resize></canvas>
    
  </body>
</html>
