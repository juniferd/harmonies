var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

function handler (req, res) {
  res.writeHead(200);
  res.end("You've made it.");
}

app.listen(8888);

var _id = 0;
function getID() {
  _id += 1;
  return _id;
};

var _brushes = {};

io.sockets.on('connection', function (socket) {
  var _user_id = getID();
  var _room = "";

  for (var i in _brushes) {
    socket.emit('new-brush', _brushes[i]);
  };

  socket.on('stroke', function (data) {
    if (data && data.coords && data.coords.length >= 1) {
      data.user_id = _user_id;
      socket.broadcast.to(_room).emit('stroke', data);
    }
  });

  socket.on('join', function(data) {
    _room = data.room || "#default";
    socket.join(_room);
  });

  socket.on('clear', function() {
    socket.broadcast.to(_room).emit('clear');
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
