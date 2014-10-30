var dgram = require('dgram');
var message = new Buffer("Some bytes");
var client = dgram.createSocket("udp4");

setInterval(function() {
	client.send(message, 0, message.length, 49153, "192.168.0.10", function(err, bytes) {
		console.log('OK');
	});
}, 1000);