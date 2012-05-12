function Menu() {
    this.init();
}

Menu.prototype = {
    container: null,

    foregroundColor: null,
    backgroundColor: null,

    selector: null,
    save: null,
    clear: null,
    about: null,
    pan: null,
    erase: null,
    more: null,
    zoomin: null,
    zoomout: null,

    init: function() {
        var option, space, separator, color_width = 15,
            color_height = 15;

        this.container = document.createElement("div");
        this.container.className = 'gui';
        this.container.setAttribute("id", "main-menu");

        var moreControls = document.createElement("div");
        moreControls.setAttribute("id", "moreControls");
        moreControls.style.display = "none";

        this.container.appendChild(moreControls);

        this.about = document.createElement("About");
        this.about.className = 'button';
        this.about.innerHTML = 'About';
        moreControls.appendChild(this.about);

        this.save = document.createElement("span"); //getElementById('save');
        this.save.className = 'button';
        this.save.innerHTML = 'Save';
        moreControls.appendChild(this.save);

        this.clear = document.createElement("Clear");
        this.clear.className = 'button';
        this.clear.innerHTML = 'Clear';
        moreControls.appendChild(this.clear);

        var zoomControls = document.createElement("span");
        zoomControls.setAttribute("id", "zoomControls");

        var brushControls = document.createElement("span");
        brushControls.setAttribute("id", "brushControls");

        this.container.appendChild(zoomControls);
        this.container.appendChild(brushControls);

        this.foregroundColor = document.createElement("canvas");
        this.foregroundColor.className = 'color-button';
        this.foregroundColor.width = color_width;
        this.foregroundColor.height = color_height;
        brushControls.appendChild(this.foregroundColor);

        this.setForegroundColor(COLOR);

        this.backgroundColor = document.createElement("canvas");
        this.backgroundColor.className = 'color-button';
        this.backgroundColor.width = color_width;
        this.backgroundColor.height = color_height;
        brushControls.appendChild(this.backgroundColor);

        this.setBackgroundColor(BACKGROUND_COLOR);

        this.selector = document.createElement("select");
        for (i = 0; i < BRUSHES.length; i++) {
            option = document.createElement("option");
            option.id = i;
            option.innerHTML = BRUSHES[i].toUpperCase();
            this.selector.appendChild(option);
        }
        brushControls.appendChild(this.selector);

        this.pan = document.createElement("span");
        this.pan.className = 'button';
        this.pan.setAttribute("id", "pan");
        this.pan.innerHTML = 'Pan';
        this.container.appendChild(this.pan);

        this.zoomout = document.createElement("span");
        this.zoomout.className = 'button';
        this.zoomout.setAttribute("id", "zoomout");
        this.zoomout.innerHTML = ' - ';

        zoomControls.appendChild(this.zoomout);
        zoomLabel = document.createElement("span");
        zoomLabel.innerHTML = " Zoom ";
        zoomControls.appendChild(zoomLabel);


        this.zoomin = document.createElement("span");
        this.zoomin.className = 'button';
        this.zoomin.setAttribute("id", "zoomin");
        this.zoomin.innerHTML = ' + ';
        zoomControls.appendChild(this.zoomin);


        zoomControls.style.display = 'none';

        this.erase = document.createElement("span");
        this.erase.className = 'button';
        this.erase.setAttribute("id", "erase");
        this.erase.innerHTML = 'Erase';
        this.container.appendChild(this.erase);

        this.more = document.createElement("span");
        this.more.className = 'button';
        this.more.setAttribute("id", "more");
        this.more.innerHTML = 'More';
        this.container.appendChild(this.more);

    },

    setForegroundColor: function(color) {
        var context = this.foregroundColor.getContext("2d");
        context.fillStyle = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
        context.fillRect(0, 0, this.foregroundColor.width, this.foregroundColor.height);
        context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        context.fillRect(0, 0, this.foregroundColor.width, 1);
    },

    setBackgroundColor: function(color) {
        var context = this.backgroundColor.getContext("2d");
        context.fillStyle = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
        context.fillRect(0, 0, this.backgroundColor.width, this.backgroundColor.height);
        context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        context.fillRect(0, 0, this.backgroundColor.width, 1);

    }
}
