var net = require('net');
var client = net.connect({port: 6379}, function() { //'connect' listener
	console.log('client connected');
	setInterval(function() {
		client.write('SET test ' + Math.random() + '\r\n');
	}, 1000);
});
client.on('data', function(data) {
	console.log("" + data);
});
client.on('end', function() {
	console.log('client disconnected');
});