function Rooms() {
    this.init();
}

Rooms.prototype = {
    container: null,

    init: function() {
        var text, containerText;

        this.container = document.createElement("div");
        this.container.className = 'gui';
        this.container.style.position = 'absolute';
        this.container.style.top = '0px';
        this.container.style.visibility = 'hidden';

    },

    update: function(data) {
      var updating = document.createElement("div");
      updating.innerHTML = "Now Updating...";

      this.container.appendChild(updating);

      var container = this.container;
      container.style.visibility = 'hidden';

      socket.emit('list-rooms', function(room_list) {
        if (room_list.length == 0) {
          container.innerHTML = "oh. there are no active rooms, currently. create one!"
          return;
        }

        container.innerHTML = 'Click on a room below to join. <br />';

        room_list.forEach(function(room) {
          var href = document.createElement("a");
          href.setAttribute("href", room);
          href.innerHTML = room + "<br />";
          container.appendChild(href);
          container.style.visibility = 'visible';
        });
      });
    },

    show: function() {
        this.container.style.visibility = 'visible';
    },

    hide: function() {
        this.container.style.visibility = 'hidden';
    }
}
