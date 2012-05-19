$(function(){
    var testObj = {
      about: "test",
      save: "test2"
    };
    var tester2 = {
      about: {id:'2', foo:'bar'},
      save: 'test4'
    };
    $("<p>wee</p>").appendTo("body");
    $("<div style='margin-top:10px;left:10px;'>"+testObj['about']+"</div>").appendTo("body");
    $("<div style='margin-top:10px;left:10px;'>"+tester2['about']['foo']+"</div>").appendTo("body");
});
$(window).resize(function(){
  var cw = document.documentElement.clientWidth;
  checkIfMobile(cw);
});
$(document).ready(function(){
  
  var cw = document.documentElement.clientWidth;
  checkIfMobile(cw);
});
function checkIfMobile(cw){
  var mobile = (cw > 960) ? false : true;
  if (!mobile){
    return;
  }
  $('<div>what</div>').appendTo('body');
    
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
            menuObj = {
                roomControls: {
                    type: 'span',
                    id: 'roomControls',
                    class: null,
                    parent: '#main-menu',
                    text: null,
                    inmenu: false
                },
                zoomControls: {
                    type:'span',
                    id: 'zoomControls',
                    class: null,
                    parent: '#main-menu',
                    text: null,
                    inmenu: false
                },
                brushControls: {
                    type:'span',
                    id: 'brushControls',
                    class: null,
                    parent: '#main-menu',
                    text: null,
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
                    text: null,
                    inmenu: true
                },
                backgroundColor: {
                    type:'canvas',
                    id:'bgcolor',
                    class:'color-button',
                    parent: '#brushControls',
                    text: null,
                    inmenu: true
                },
                selector: {
                    type: 'select',
                    id:'selector',
                    class: null,
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
                    id: null,
                    class: null,
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
                    class: null,
                    parent: '#main-menu',
                    text: null,
                    inmenu: true
                }
            };
        
        //create desktop menu gui
        $('<div/>').addClass('gui')
            .attr('id','main-menu')
            .appendTo($firstDiv);
        this.container = document.getElementById('main-menu');
        
        //add buttons in menu
        for (var key in menuObj){
            var menuEntry = menuObj[key],
                keyId = menuEntry['id'];
            $('<'+menuEntry['type']+'/>').addClass(menuEntry['class'])
                .attr('id',menuEntry['id'])
                .text(menuEntry['text'])
                .appendTo(menuEntry['parent']);
            if (menuEntry['inmenu']){
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
                .text(BRUSHES[i].toUpperCase())
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
