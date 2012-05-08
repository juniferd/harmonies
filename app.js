var express = require('express')
  , app = express.createServer()
  , io = require('socket.io').listen(app)
  ;


// assuming io is the Socket.IO server object
if (typeof(NODE_ENV) != "undefined" && NODE_ENV == "production") {
  io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  });
}

app.listen(process.env.PORT || 9999);
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
  res.writeHead(200);
  res.end("You've made it.");
});
//app.listen(8888);

var _id = 0;
function getID() {
  _id += 1;
  return _id;
};

var _brushes = {};
var _strokes = { "#default" : []};

io.sockets.on('connection', function (socket) {
  var _user_id = getID();
  var _room = "#default";

  for (var i in _brushes) {
    socket.emit('new-brush', _brushes[i]);
  };

  socket.on('stroke', function (data) {
    if (data && data.coords && data.coords.length >= 1) {
      data.user_id = _user_id;
      socket.broadcast.to(_room).emit('stroke', data);
      _strokes[_room].push(data);
    }
  });

  socket.on('join', function(data) {
    _room = data.room || "#default";
    if (!_strokes[_room]) {
      _strokes[_room] = [];
    }
    socket.join(_room);
    socket.emit('clear');

    for (var i in _strokes[_room]) {
      socket.emit('stroke', _strokes[_room][i]);
    }
  });

  socket.on('clear', function() {
    socket.broadcast.to(_room).emit('clear');
    _strokes[_room] = [];
  });

  socket.on('new-brush', function (data) {
    if (data) {
      data.user_id = _user_id;
      _brushes[_user_id] = data;
      socket.broadcast.emit('new-brush', data);
    }
  });

  socket.on('disconnect', function() {
    if (_brushes[_user_id]) {
      delete _brushes[_user_id];
    }
  });

  socket.broadcast.to(_room).emit('new-brush', { user_id: _user_id, brush: 'sketchy' });
});
