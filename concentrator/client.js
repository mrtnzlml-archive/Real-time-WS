var io = require("socket.io-client");
var PORT = 3000;
var uid = 'uid=UID-0001';

client = io.connect("ws://127.0.0.1:" + PORT + "/", { query: uid });

var x = 0;
setInterval(function () {
    client.emit('data', {
        uid: uid,
        //data: Math.random()*2-1
        data: Math.sin(x)
        //data: Math.cos(x)
        //data: Math.tan(x)
    });
    x += 0.1;
}, 100);

client.on('error', function () {
    console.error(arguments)
});