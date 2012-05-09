var room = window.location.hash || "#default";
var socket = io.connect('/');

socket.emit('join', { room: room });

var userBrushes = {};

function ChangeBrush(user_id, brushName){
    
    var userBrushObj = userBrushes[user_id];
    if (userBrushObj && userBrushObj.brushName == brushName){
        return userBrushObj;    
    } else if (userBrushObj){
        userBrushObj.destroy();
    }
    var newBrushObj = eval("new " + brushName + "(context)");
    userBrushes[user_id] = newBrushObj;
    newBrushObj.brushName = brushName;
    return newBrushObj;
    
}
socket.on('new-brush', function (data) {
    ChangeBrush(data.user_id, data.brush);
});
socket.on('stroke', function(data){
  var origColor = COLOR;
  var newBrush = ChangeBrush(data.user_id, data.brush);
  
  COLOR = data.color || COLOR;
  
  newBrush.strokeStart(data.coords.shift());

  var i = 0,
      queue_size = 20;

  var doWork = function() {
    COLOR = data.color || COLOR;
    for (var n = 0; i < data.coords.length && n < queue_size; i++, n++){
      newBrush.stroke(data.coords[i][0], data.coords[i][1]);
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
socket.on('new-bgcolor', function(data){
  document.body.style.backgroundColor = 'rgb(' + data[0] + ', ' + data[1] + ', ' + data[2] + ')';
});

socket.on('clear', function() {
  console.log("clearing room");
  clearCanvas();
});

