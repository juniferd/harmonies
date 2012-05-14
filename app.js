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

// This is an implementation of the Fisher-Yates algorithm, taken from
// http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function array_shuffle (aArray) {
    for (var mTemp, j, i = aArray.length; i; ) {  // mTemp, j initialized here for shorter code
        j = parseInt (Math.random () * i);  // introduces modulo bias (see below)
        mTemp = aArray[--i];
        aArray[i] = aArray[j];
        aArray[j] = mTemp;
    }
};

var _strokes = { "#default" : []};
var _fgColors = { };
var _bgColors = { };
var _users = {};

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

    _users[_user_id] = _room;

    if (!_fgColors[_room]) {
      _fgColors[_room] = {};
    }

    _fgColors[_room][_user_id] = [0,0,0];


    socket.join(_room);
    socket.emit('clear');

    if (_bgColors[_room]) {
      socket.emit('new-bgcolor', _bgColors[_room]);
    }

    if (_fgColors[_room]) {
      socket.emit('new-fgcolor', _fgColors[_room]);
      socket.broadcast.to(_room).emit('new-fgcolor', _fgColors[_room]);
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

  socket.on('new-fgcolor', function(data) {
    _fgColors[_room][_user_id] = data;

    socket.emit('new-fgcolor', _fgColors[_room]);
    socket.broadcast.to(_room).emit('new-fgcolor', _fgColors[_room]);
  });

  socket.on('clear', function() {
    socket.broadcast.to(_room).emit('clear');
    _strokes[_room] = [];
  });

  socket.on('list-rooms', function(callback) {
    var populatedRooms = {};
    for (var user in _users) {
      populatedRooms[_users[user]] = true;
    }

    var rooms = Object.keys(populatedRooms);

    array_shuffle(rooms);
    callback(rooms.slice(0, 3));
  });

  socket.on('disconnect', function() {
    if (_fgColors[_room] && _fgColors[_room][_user_id]) {
      delete _fgColors[_room][_user_id];
    }

    if (_users[_user_id]) {
      delete _users[_user_id];
    }

    socket.broadcast.emit('new-fgcolor', _fgColors[_room]);
  });

});
