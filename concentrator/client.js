var io = require("socket.io-client");
client = io.connect("ws://127.0.0.1:3000/");

client.on('connect', function(){
	client.emit('register', 'UID-0003');
});

client.on('message', function(data) {
	console.log(data);
});

client.on('error', function() {
	console.error(arguments)
});