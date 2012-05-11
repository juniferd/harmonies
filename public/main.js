const REV = 6, BRUSHES = ["sketchy", "shaded", "chrome", "fur", "longfur", "web", "", "simple", "squares", "ribbon", "", "circles", "grid"], USER_AGENT = navigator.userAgent.toLowerCase();

var SCREEN_WIDTH = window.innerWidth * 2,
    SCREEN_HEIGHT = window.innerHeight * 2,
    BRUSH_SIZE = 1,
    BRUSH_PRESSURE = 1,
    COLOR = [0, 0, 0],
    BACKGROUND_COLOR = [250, 250, 250],
    ZOOM = 1,
    brush, panStart = [],
    panCoords = [],
    panOffset = [0, 0],
    strokeCoordinates = [],
    saveTimeOut, wacom, i, dX = 0,
    dY = 0,
    origX = 0,
    origY = 0,
    mouseX = 0,
    mouseY = 0,
    container, foregroundColorSelector, backgroundColorSelector, menu, about, canvas, flattenCanvas, context, isFgColorSelectorVisible = false,
    isBgColorSelectorVisible = false,
    isAboutVisible = false,
    isMenuMouseOver = false,
    shiftKeyIsDown = false,
    altKeyIsDown = false,
    panModeOn = false;

init();

function init() {
    var hash, palette, embed, localStorageImage;

    if (USER_AGENT.search("android") > -1 || USER_AGENT.search("iphone") > -1) BRUSH_SIZE = 2;

    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center center';

    container = document.createElement('div');
    document.body.appendChild(container);

    /*
     * TODO: In some browsers a naste "Plugin Missing" window appears and people is getting confused.
     * Disabling it until a better way to handle it appears.
     *
     * embed = document.createElement('embed');
     * embed.id = 'wacom-plugin';
     * embed.type = 'application/x-wacom-tablet';
     * document.body.appendChild(embed);
     *
     * wacom = document.embeds["wacom-plugin"];
     */

    canvas = document.createElement("canvas");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    canvas.setAttribute("id", "drawing");
    canvas.style.cursor = 'crosshair';
    container.appendChild(canvas);

    context = canvas.getContext("2d");

    flattenCanvas = document.createElement("canvas");
    flattenCanvas.width = SCREEN_WIDTH;
    flattenCanvas.height = SCREEN_HEIGHT;

    palette = new Palette();

    foregroundColorSelector = new ColorSelector(palette);
    foregroundColorSelector.addEventListener('change', onForegroundColorSelectorChange, false);
    container.appendChild(foregroundColorSelector.container);

    backgroundColorSelector = new ColorSelector(palette);
    backgroundColorSelector.addEventListener('change', onBackgroundColorSelectorChange, false);
    container.appendChild(backgroundColorSelector.container);

    menu = new Menu();
    menu.foregroundColor.addEventListener('click', onMenuForegroundColor, false);
    menu.foregroundColor.addEventListener('touchend', onMenuForegroundColor, false);
    menu.backgroundColor.addEventListener('click', onMenuBackgroundColor, false);
    menu.backgroundColor.addEventListener('touchend', onMenuBackgroundColor, false);
    menu.selector.addEventListener('change', onMenuSelectorChange, false);
    menu.save.addEventListener('click', onMenuSave, false);
    menu.save.addEventListener('touchend', onMenuSave, false);
    menu.clear.addEventListener('click', onMenuClear, false);
    menu.clear.addEventListener('touchend', onMenuClear, false);
    menu.pan.addEventListener('click', onMenuPan, false);
    menu.pan.addEventListener('touchend', onMenuPan, false);
    menu.about.addEventListener('click', onMenuAbout, false);
    menu.about.addEventListener('touchend', onMenuAbout, false);
    menu.container.addEventListener('mouseover', onMenuMouseOver, false);
    menu.container.addEventListener('mouseout', onMenuMouseOut, false);
    container.appendChild(menu.container);

    foregroundColorSelector.setColor(COLOR);
    backgroundColorSelector.setColor(BACKGROUND_COLOR);

    if (!brush) {
        changeBrush(0);
    }

    about = new About();
    container.appendChild(about.container);

    window.addEventListener('mousemove', onWindowMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onWindowKeyDown, false);
    window.addEventListener('keyup', onWindowKeyUp, false);
    window.addEventListener('blur', onWindowBlur, false);

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    document.addEventListener("dragenter", onDocumentDragEnter, false);
    document.addEventListener("dragover", onDocumentDragOver, false);
    document.addEventListener("drop", onDocumentDrop, false);

    canvas.addEventListener('mousedown', onCanvasMouseDown, false);
    canvas.addEventListener('touchstart', onCanvasTouchStart, false);

    onWindowResize(null);
}


function zoomBy(amount) {
    ZOOM += amount;

    if (ZOOM <= 0.5) {
        ZOOM = 0.5;
    } else if (ZOOM >= 1.5) {
        ZOOM = 1.5;
    } else {
        dX = origX * ZOOM;
        dY = origY * ZOOM;
    }

    canvas.style.zoom = ZOOM;
}


// WINDOW

function onWindowMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    menu.container.style.left = ((SCREEN_WIDTH - menu.container.offsetWidth) / 2) + 'px';

    about.container.style.left = ((SCREEN_WIDTH - about.container.offsetWidth) / 2) + 'px';
    about.container.style.top = ((SCREEN_HEIGHT - about.container.offsetHeight) / 2) + 'px';
}

function onWindowKeyDown(event) {
    if (shiftKeyIsDown) return;

    switch (event.keyCode) {
    case 16:
        // Shift
        shiftKeyIsDown = true;
        foregroundColorSelector.container.style.left = mouseX - 125 + 'px';
        foregroundColorSelector.container.style.top = mouseY - 125 + 'px';
        foregroundColorSelector.container.style.visibility = 'visible';
        break;

    case 18:
        // Alt
        altKeyIsDown = true;
        break;

    case 68:
        // d
        if (BRUSH_SIZE > 1) BRUSH_SIZE--;
        break;

    case 70:
        // f
        BRUSH_SIZE++;
        break;

    case 80:
        // p
        onMenuPan();
        break;

    case 187:
        // =
        if (!panModeOn) {
            zoomBy(0.1);
            break;
        }


    case 189:
        // -
        if (!panModeOn) {
            zoomBy(-0.1);
            break;
        }


    }
}

function onWindowKeyUp(event) {
    switch (event.keyCode) {
    case 16:
        // Shift
        shiftKeyIsDown = false;
        foregroundColorSelector.container.style.visibility = 'hidden';
        break;

    case 18:
        // Alt
        altKeyIsDown = false;
        break;

    case 82:
        // r
        changeBrush(menu.selector.selectedIndex);
        break;
    case 66:
        // b
        document.body.style.backgroundImage = null;
        break;
    }

    context.lineCap = BRUSH_SIZE == 1 ? 'butt' : 'round';
}

function onWindowBlur(event) {
    shiftKeyIsDown = false;
    altKeyIsDown = false;
}


// DOCUMENT

function onDocumentMouseDown(event) {
    if (!isMenuMouseOver) event.preventDefault();
}

function onDocumentMouseOut(event) {
    onCanvasMouseUp();
}

function onDocumentDragEnter(event) {
    event.stopPropagation();
    event.preventDefault();
}

function onDocumentDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
}

function onDocumentDrop(event) {
    event.stopPropagation();
    event.preventDefault();

    var file = event.dataTransfer.files[0];

    if (file.type.match(/image.*/)) {
        /*
         * TODO: This seems to work on Chromium. But not on Firefox.
         * Better wait for proper FileAPI?
         */

        var fileString = event.dataTransfer.getData('text').split("\n");
        document.body.style.backgroundImage = 'url(' + fileString[0] + ')';
    }
}
// BRUSH SELECTORS


function changeBrush(i) {
    if (brush) {
        brush.destroy();
    }
    brush = eval("new " + BRUSHES[i] + "(context)");
    brushName = BRUSHES[i];
    socket.emit('new-brush', {
        brush: brushName
    });
}

// COLOR SELECTORS

function onForegroundColorSelectorChange(event) {
    COLOR = foregroundColorSelector.getColor();

    menu.setForegroundColor(COLOR);

}

function onBackgroundColorSelectorChange(event) {
    BACKGROUND_COLOR = backgroundColorSelector.getColor();

    menu.setBackgroundColor(BACKGROUND_COLOR);

    document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';

}


// MENU

function onMenuForegroundColor() {
    cleanPopUps();

    foregroundColorSelector.show();
    foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
    foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

    isFgColorSelectorVisible = true;
}

function onMenuBackgroundColor() {
    cleanPopUps();

    backgroundColorSelector.show();
    backgroundColorSelector.container.style.left = ((SCREEN_WIDTH - backgroundColorSelector.container.offsetWidth) / 2) + 'px';
    backgroundColorSelector.container.style.top = ((SCREEN_HEIGHT - backgroundColorSelector.container.offsetHeight) / 2) + 'px';

    isBgColorSelectorVisible = true;
}

function onMenuSelectorChange() {
    if (BRUSHES[menu.selector.selectedIndex] == "") return;


    changeBrush(menu.selector.selectedIndex);

}

function onMenuMouseOver() {
    isMenuMouseOver = true;
}

function onMenuMouseOut() {
    isMenuMouseOver = false;
}

function onMenuSave() {
    // window.open(canvas.toDataURL('image/png'),'mywindow');
    flatten();
    window.open(flattenCanvas.toDataURL('image/png'), 'mywindow');
}

function onMenuPan() {
    if (panModeOn == true) {
        //turn pan mode off
        panModeOn = false;
        document.getElementById("pan").className = "button";
        panCoords = null;
        panStart = null;
        return;
    }
    //turn pan mode on
    panModeOn = true;
    document.getElementById("pan").className = "button selected";
}

function onMenuClear() {
    clearCanvas();
    socket.emit('clear');

}

function PanCanvas(dX, dY) {

    var el = document.getElementById("drawing");
    el.style.transform = "translate(" + dX + "px," + dY + "px)";
    el.style.msTransform = "translate(" + dX + "px," + dY + "px)";
    el.style.webkitTransform = "translate(" + dX + "px," + dY + "px)";
    el.style.mozTransform = "translate(" + dX + "px," + dY + "px)";
    el.style.oTransform = "translate(" + dX + "px," + dY + "px)";

    origX = dX;
    origY = dY;
}

function clearCanvas() {

    context.clearRect(0, 0, canvas.width, canvas.height);

    saveToLocalStorage();

    changeBrush(menu.selector.selectedIndex);

}

function onMenuAbout() {
    cleanPopUps();

    isAboutVisible = true;
    about.show();
}


// CANVAS

function onCanvasMouseDown(event) {
    var data, position;

    clearTimeout(saveTimeOut);
    cleanPopUps();

    if (altKeyIsDown) {
        flatten();

        data = flattenCanvas.getContext("2d").getImageData(0, 0, flattenCanvas.width, flattenCanvas.height).data;
        position = (event.clientX + (event.clientY * canvas.width)) * 5;

        foregroundColorSelector.setColor([data[position], data[position + 1], data[position + 2]]);

        return;
    } else if (panModeOn) {
        panStart = [event.clientX - dX, event.clientY - dY];

        window.addEventListener('mousemove', onCanvasMouseMove, false);
        window.addEventListener('mouseup', onCanvasMouseUp, false);

        return;
    }

    BRUSH_PRESSURE = wacom && wacom.isWacom ? wacom.pressure : 1;

    var xScaled = parseInt((-dX + event.clientX) / ZOOM, 10);
    var yScaled = parseInt((-dY + event.clientY) / ZOOM, 10);

    brush.strokeStart(xScaled, yScaled);

    strokeCoordinates = [xScaled, yScaled];

    window.addEventListener('mousemove', onCanvasMouseMove, false);
    window.addEventListener('mouseup', onCanvasMouseUp, false);
}

function onCanvasMouseMove(event) {
    if (panModeOn) {
        panCoords = [event.clientX, event.clientY];
        dX = panCoords[0] - panStart[0];
        dY = panCoords[1] - panStart[1];
        PanCanvas(dX / ZOOM, dY / ZOOM);

        return;
    }
    BRUSH_PRESSURE = wacom && wacom.isWacom ? wacom.pressure : 1;

    var xScaled = parseInt((-dX + event.clientX) / ZOOM, 10);
    var yScaled = parseInt((-dY + event.clientY) / ZOOM, 10);

    brush.stroke(xScaled, yScaled);
    strokeCoordinates.push([xScaled, yScaled]);
}

function onCanvasMouseUp() {
    window.removeEventListener('mousemove', onCanvasMouseMove, false);
    window.removeEventListener('mouseup', onCanvasMouseUp, false);
    if (panModeOn) {

        panOffset = [dX, dY];
        return;
    }
    brush.strokeEnd();
    if (strokeCoordinates && strokeCoordinates.length >= 1) {
        socket.emit('stroke', {
            brush: brushName,
            coords: strokeCoordinates,
            color: COLOR
        });
    }

    strokeCoordinates = null;


}


//

function onCanvasTouchStart(event) {
    cleanPopUps();

    if (event.touches.length == 1) {
        event.preventDefault();

        var xScaled = parseInt(event.touches[0].pageX / ZOOM, 10);
        var yScaled = parseInt(event.touches[0].pageY / ZOOM, 10);
        brush.strokeStart(xScaled, yScaled);
        strokeCoordinates = [
            [xScaled, yScaled]
        ];
        window.addEventListener('touchmove', onCanvasTouchMove, false);
        window.addEventListener('touchend', onCanvasTouchEnd, false);
    }
}

function onCanvasTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        var xScaled = parseInt(event.touches[0].pageX / ZOOM, 10);
        var yScaled = parseInt(event.touches[0].pageY / ZOOM, 10);
        brush.stroke(xScaled, yScaled);
        strokeCoordinates.push([xScaled, yScaled]);
    }
}

function onCanvasTouchEnd(event) {
    if (event.touches.length == 0) {
        event.preventDefault();

        brush.strokeEnd();
        if (strokeCoordinates && strokeCoordinates.length >= 1) {
            socket.emit('stroke', {
                brush: brushName,
                coords: strokeCoordinates,
                color: COLOR
            });
        }
        window.removeEventListener('touchmove', onCanvasTouchMove, false);
        window.removeEventListener('touchend', onCanvasTouchEnd, false);
    }
}

//

function saveToLocalStorage() {
    localStorage.canvas = canvas.toDataURL('image/png');
}

function flatten() {
    var context = flattenCanvas.getContext("2d");

    context.fillStyle = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(canvas, 0, 0);
}

function cleanPopUps() {
    if (isFgColorSelectorVisible) {
        foregroundColorSelector.hide();
        isFgColorSelectorVisible = false;
    }

    if (isBgColorSelectorVisible) {
        backgroundColorSelector.hide();
        isBgColorSelectorVisible = false;
        socket.emit('new-bgcolor', [BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2]]);
    }

    if (isAboutVisible) {
        about.hide();
        isAboutVisible = false;
    }
}
