var io = require("socket.io-client");
var PORT = 3000;
var uid = 'UID-0001';

client = io.connect("ws://127.0.0.1:" + PORT + "/");

client.on('connect', function () {
    client.emit('register', uid);
});

client.on('message', function (data) {
    console.log(data);
});

setInterval(function () {
    client.emit('data', {
        uid: uid,
        data: Math.random()
    });
}, 100);

client.on('error', function () {
    console.error(arguments)
});