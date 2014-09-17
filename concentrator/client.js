var io = require("socket.io-client");
var PORT = 3000;
var uid = 'switch-0000000001';

var socket = io("ws://127.0.0.1:" + PORT + "/", { query: uid });
//var socket = io("ws://sleepy-badlands-5547.herokuapp.com/", { query: uid });

socket.on('connect', function() {
    socket.on('ping', function(timestamp){
        for (var i = 10000; i >= 0; i--) {
            var tmp = timestamp * i;
        };
        console.log('PONG ' + +new Date);
        socket.emit('pong', timestamp);
    });

    socket.on('disconnect', function(){});
});
