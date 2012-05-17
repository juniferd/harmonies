var room = window.location.hash || "#default";

var socket = io.connect('/');

socket.emit('join', {
    room: room.toLowerCase()
});

var userBrushes = {};
var pendingStrokes = [];
var midStroke = false;

function nextStroke() {
    if (!midStroke && pendingStrokes.length > 0) {
        var data = pendingStrokes.shift();
        traceStroke(data.brush, data.coords, data.color, data.erase, data.bg);
    }
}


function traceStroke(newBrush, coords, color, erase, bg) {
    midStroke = true;

    var startCoords = coords.shift();
        i = 0,
        queue_size = 20,
        curX = startCoords[0],
        curY = startCoords[1];

    newBrush.strokeStart(startCoords);

    var lastColor = COLOR;
    var lastContext = context;
    var lastCompositeOperation = context.globalCompositeOperation;

    var doWork = function() {

            if (erase) {
                context.globalCompositeOperation = "destination-out";
            } else {
                context.globalCompositeOperation = "source-over";
            }

            COLOR = color || COLOR;
            if (bg) {
              context = bgcanvas.getContext("2d");
            } else {
              context = fgcanvas.getContext("2d");
            }

            newBrush.context = context;

            for (var n = 0; i < coords.length && n < queue_size; i++, n++) {
                curX += coords[i][0];
                curY += coords[i][1];
                newBrush.stroke(curX, curY);
            }

            context.globalCompositeOperation = lastCompositeOperation;
            context = lastContext;

            COLOR = lastColor;

            if (i < coords.length) {
                setTimeout(doWork, 20);
            } else {
                newBrush.strokeEnd();
                midStroke = false;
                nextStroke();
            }

            COLOR = lastColor;

        };

    doWork();
}

function ChangeBrush(user_id, brushName, forceNew) {

    var userBrushObj = userBrushes[user_id];
    if (userBrushObj && userBrushObj.brushName == brushName && !forceNew) {
        return userBrushObj;
    } else if (userBrushObj) {
        userBrushObj.destroy();
    }

    var lastCompositeOperation = context.globalCompositeOperation;
    var newBrushObj = eval("new " + brushName + "(context)");
    context.globalCompositeOperation = lastCompositeOperation;
    userBrushes[user_id] = newBrushObj;
    newBrushObj.brushName = brushName;
    return newBrushObj;

}

socket.on('stroke', function(data) {
    var newBrush = ChangeBrush(data.user_id, data.brush, data.lift);

    data.brush = newBrush;
    pendingStrokes.push(data);
    nextStroke();
});

socket.on('new-bgcolor', function(data) {
    document.body.style.backgroundColor = 'rgb(' + data[0] + ', ' + data[1] + ', ' + data[2] + ')';
    backgroundColorSelector.setColor(data);
});

socket.on('new-fgcolor', function(data) {

  var width = 100.0 / Object.keys(data).length;
  var userContainer = document.createElement("span");

  for (var user in data) {
    var color = data[user];
    var userSwatch = document.createElement('span');
    userSwatch.style.display = "inline-block";
    userSwatch.style.width = width + "%";
    userSwatch.className = 'user-swatch';

    userSwatch.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    userContainer.appendChild(userSwatch);
  }

  menu.users.innerHTML = '';
  menu.users.appendChild(userContainer);
});

socket.on('clear', function() {
    clearCanvas();
});

window.onload = function() {
  // Constantly query the location hash for changes
  var hashTimer = setInterval(function() {
      if (window.location.hash && window.location.hash != room) {
          window.location.reload();
          clearTimeout(hashTimer);
      }
  }, 50);
}
