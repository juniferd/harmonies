var express = require('express')
  , app = express.createServer()
  , io = require('socket.io').listen(app)
  ;

app.listen(process.env.PORT || 8888);
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

var _strokes = { "#default" : []};
var _bgColors = { };

io.sockets.on('connection', function (socket) {
  var _user_id = getID();
  var _room = "#default";

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

    if (_bgColors[_room]) {
      socket.emit('new-bgcolor', _bgColors[_room]);
    }

    for (var i in _strokes[_room]) {
      socket.emit('stroke', _strokes[_room][i]);
    }
  });

  socket.on('new-bgcolor', function(data){
    if (data){
      socket.broadcast.to(_room).emit('new-bgcolor', data);
      _bgColors[_room] = data;
    }
  });

  socket.on('clear', function() {
    socket.broadcast.to(_room).emit('clear');
    _strokes[_room] = [];
  });

  socket.on('rooms', function(callback) {
    var alrightRooms = [];
    for (var room in _strokes) { 
      if (_strokes[room].length > 0) {
        alrightRooms.push(room);
      }
    }

    callback(alrightRooms);
  });

  socket.on('disconnect', function() {
  });

});
