var io = require("socket.io-client");
var PORT = 5000;
var uid = 'switch-0000000001';

//client = io.connect("ws://127.0.0.1:" + PORT + "/", { query: uid });
client = io.connect("ws://sleepy-badlands-5547.herokuapp.com/", { query: uid });

var x = 0;
setInterval(function () {
	console.log('Emit: ' + x);
    client.emit('data', {
        uid: uid,
		data: x
        //data: Math.random()*2-1
        //data: Math.sin(x)
        //data: Math.cos(x)
        //data: Math.tan(x)
    });
    x += 0.1;
}, 20); //20

client.on('response', function(input) {
	x += input;
});

client.on('error', function () {
    console.error(arguments)
});