var room = window.location.hash || "#default";
var socket = io.connect('http://nicesho.es:8888');

socket.emit('join', { room: room });

var userBrushes = {};
socket.on('new-brush', function (data) {
  if (userBrushes[data.user_id]){
    userBrushes[data.user_id].destroy();
  }
  var newBrush = eval("new " + data.brush + "(context)");
  userBrushes[data.user_id] = newBrush;
});
socket.on('stroke', function(data){
  var origColor = COLOR;
  var newBrush = userBrushes[data.user_id];
  COLOR = data.color || COLOR
  newBrush.strokeStart(data.coords.shift());

  var i = 0,
      queue_size = 20;

  var doWork = function() {
    COLOR = data.color || COLOR;
    for (var n = 0; i < data.coords.length && n < queue_size; i++, n++){
      newBrush.stroke(data.coords[i].x, data.coords[i].y);
    }

    if (i < data.coords.length) {
      setTimeout(doWork);
    } else {
      newBrush.strokeEnd();
    }

    COLOR = origColor;
  };

  doWork();
});

socket.on('clear', function() {
  console.log("clearing room");
  clearCanvas();
});
