
$(window).resize(function(){
    var cw = document.documentElement.clientWidth,
        ch = document.documentElement.clientHeight;
    checkIfMobile(cw);
});
$(document).ready(function(){
    var cw = document.documentElement.clientWidth,
        ch = document.documentElement.clientHeight;
    checkIfMobile(cw);
});
function checkIfMobile(cw){
    var mobile = (cw > 960) ? false : true;
    if (!mobile){
        return;
    }
    $('<div>what</div>').appendTo('#main-menu');
    
}

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
    rooms: null,
    join: null,
    zoomin: null,
    zoomout: null,
    users: null,
    layerbg: null,

    
    init: function() {
        var $firstDiv = $('body').children('div').eq(0);
        var color_width=15,
            color_height=15,

            roomObj = {
                roomControls: {
                    type: 'span',
                    id: 'roomControls',
                    class: '',
                    parent: '#main-menu',
                    text: '',
                    inmenu: false
                },
                zoomControls: {
                    type:'span',
                    id: 'zoomControls',
                    class: '',
                    parent: '#main-menu',
                    text: '',
                    inmenu: false
                },
                brushControls: {
                    type:'span',
                    id: 'brushControls',
                    class: '',
                    parent: '#main-menu',
                    text: '',
                    inmenu: false
                },
                about: {
                    type: 'span',
                    id: 'about',
                    class: 'button',
                    parent: '#roomControls',
                    text: 'About',
                    inmenu: true
                },
                save: {
                    type: 'span',
                    id: 'save',
                    class: 'button',
                    parent: '#roomControls',
                    text: 'Save',
                    inmenu: true
                },
                clear: {
                    type:'span',
                    id: 'clear',
                    class: 'button',
                    parent: '#roomControls',
                    text: 'Clear',
                    inmenu: true
                },
                join: {
                    type:'span',
                    id: 'join',
                    class: 'button',
                    parent: '#roomControls',
                    text: 'Join',
                    inmenu: true
                },
                
                layerbg: {
                    type:'span',
                    id: 'bg-layer',
                    class: 'button',
                    parent: '#brushControls',
                    text: 'BG',
                    inmenu: true
                },
                foregroundColor: {
                    type:'canvas',
                    id: 'fgcolor',
                    class: 'color-button',
                    parent: '#brushControls',
                    text: '',
                    inmenu: true
                },
                backgroundColor: {
                    type:'canvas',
                    id:'bgcolor',
                    class:'color-button',
                    parent: '#brushControls',
                    text: '',
                    inmenu: true
                },
                selector: {
                    type: 'select',
                    id:'selector',
                    class: '',
                    parent:'#brushControls',
                    text:'',
                    inmenu: true
                },
                erase: {
                    type: 'span',
                    id: 'erase',
                    class: 'button',
                    parent: '#brushControls',
                    text: 'Erase',
                    inmenu: true
                },
                pan: {
                    type: 'span',
                    id: 'pan',
                    class: 'button',
                    parent: '#main-menu',
                    text: 'Pan',
                    inmenu: true
                },
                zoomin: {
                    type: 'span',
                    id: 'zoomin',
                    class: 'button',
                    parent: '#zoomControls',
                    text: '+',
                    inmenu: true
                },
                zoomLabel: {
                    type: 'span',
                    id: '',
                    class: '',
                    parent: '#zoomControls',
                    text: 'Zoom',
                    inmenu: false
                },
                zoomout: {
                    type: 'span',
                    id: 'zoomout',
                    class: 'button',
                    parent: '#zoomControls',
                    text: '-',
                    inmenu: true
                },
                rooms: {
                    type: 'span',
                    id: 'rooms',
                    class: 'button',
                    parent: '#main-menu',
                    text: 'Room',
                    inmenu: true
                },
                users: {
                    type: 'div',
                    id: 'user_list',
                    class: '',
                    parent: '#main-menu',
                    text: '',
                    inmenu: true
                }
            };
        
        //create desktop menu gui
        $('<div/>').addClass('gui')
            .attr('id','main-menu')
            .appendTo($firstDiv);
        this.container = document.getElementById('main-menu');
        
        //add buttons in menu
        for (var key in roomObj){
            var keyId = roomObj[key]['id'];
            $('<'+roomObj[key]['type']+'/>').addClass(roomObj[key]['class'])
                .attr('id',roomObj[key]['id'])
                .text(roomObj[key]['text'])
                .appendTo(roomObj[key]['parent']);
            if (roomObj[key]['inmenu']){
                this[key] = document.getElementById(keyId);
            }
            
        }
        
        //foreground color selector
        $('#fgcolor').width(color_width).height(color_height);
        this.setForegroundColor(COLOR);
        
        
        //background color selector
        $('#bgcolor').width(color_width).height(color_height);
        this.setBackgroundColor(BACKGROUND_COLOR);
        
        //add brushes to brush selector
        for (i=0; i<BRUSHES.length; i++){
            $('<option/>').attr('id',i)
                .text(BRUSHES[i])
                .appendTo('#selector');
        }
        //hide roomControls
        $('#roomControls').hide();
        //hide zoomControls
        $('#zoomControls').hide();
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
