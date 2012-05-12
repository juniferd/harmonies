var room = window.location.hash || "#default";

var socket = io.connect('/');

socket.emit('join', {
    room: room
});

var userBrushes = {};
var pendingStrokes = [];
var midStroke = false;

function nextStroke() {
    if (!midStroke && pendingStrokes.length > 0) {
        var data = pendingStrokes.shift();
        traceStroke(data.brush, data.coords, data.color, data.erase);
    }
}

function traceStroke(newBrush, coords, color, erase) {
    midStroke = true;
    newBrush.strokeStart(coords.shift());

    var i = 0,
        queue_size = 20;

    var origColor = COLOR;
    var doWork = function() {
            var lastCompositeOperation = context.globalCompositeOperation;
            if (erase) {
                context.globalCompositeOperation = "destination-out";
            } else {
                context.globalCompositeOperation = "source-over";
            }

            COLOR = color || COLOR;
            for (var n = 0; i < coords.length && n < queue_size; i++, n++) {
                newBrush.stroke(coords[i][0], coords[i][1]);
            }

            context.globalCompositeOperation = lastCompositeOperation;

            COLOR = origColor;

            if (i < coords.length) {
                setTimeout(doWork, 20);
            } else {
                newBrush.strokeEnd();
                midStroke = false;
                nextStroke();
            }
        };

    doWork();
}

function ChangeBrush(user_id, brushName) {

    var userBrushObj = userBrushes[user_id];
    if (userBrushObj && userBrushObj.brushName == brushName) {
        return userBrushObj;
    } else if (userBrushObj) {
        userBrushObj.destroy();
    }
    var newBrushObj = eval("new " + brushName + "(context)");
    userBrushes[user_id] = newBrushObj;
    newBrushObj.brushName = brushName;
    return newBrushObj;

}

socket.on('stroke', function(data) {
    var origColor = COLOR;
    var newBrush = ChangeBrush(data.user_id, data.brush);

    var color = data.color || COLOR;

    pendingStrokes.push({
        brush: newBrush,
        coords: data.coords,
        color: color,
        erase: data.erase
    });
    nextStroke();
});
socket.on('new-bgcolor', function(data) {
    document.body.style.backgroundColor = 'rgb(' + data[0] + ', ' + data[1] + ', ' + data[2] + ')';
});

socket.on('clear', function() {
    clearCanvas();
});

// Constantly query the location hash for changes
setInterval(function() {
    if (window.location.hash && window.location.hash != room) {
        window.location.reload();
    }
}, 50);
