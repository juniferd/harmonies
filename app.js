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
  var user_id = getID();
  socket.on('stroke', function (data) {
    if (data && data.coords && data.coords.length >= 1) {
      data.user_id = user_id;
      socket.broadcast.emit('stroke', data);
    }
  });

  socket.on('new-brush', function (data) {
    if (data) {
      data.user_id = user_id;
      _brushes[user_id] = data;
      socket.broadcast.emit('new-brush', data);
    }
  });

  for (var i in _brushes) {
    socket.emit('new-brush', _brushes[i]);
  };

  socket.broadcast.emit('new-brush', { user_id: user_id, brush: 'sketchy' });
});
