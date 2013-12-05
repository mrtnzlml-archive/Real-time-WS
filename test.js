var io = require("socket.io-client");
client = io.connect("http://127.0.0.1:1234/");

client.on('time', function(data) {
    console.log(data.time);
});