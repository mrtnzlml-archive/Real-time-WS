var dgram = require("dgram");
var server = dgram.createSocket("udp4");

server.on("error", function (err) {
	console.log("server error:\n" + err.stack);
	server.close();
});

server.on("message", function (msg, rinfo) {
	console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
	var message = new Buffer("Some bytes");
	server.send(message, 0, message.length, rinfo.port, rinfo.address, function() {
		console.log("Response sent");
	});
});

server.on("listening", function () {
	var address = server.address();
	console.log("server listening " + address.address + ":" + address.port);
});

server.bind(50000);


/*var net = require('net');

var server = net.createServer(function(socket) {
	socket.write("hello\n");

	socket.on('connection', function() {
		console.log('Connected');
	})

	socket.on('data', function(data) {
		console.log(data + "");
		socket.write(data + "\n");
	});

	socket.on('error', function(error) {
		if (e.code == 'EADDRINUSE') {
    		console.log('Address in use, retrying...');
    		setTimeout(function () {
      			server.close();
      			server.listen(PORT, HOST);
    		}, 1000);
  		} else {
  			console.log(error);
  		}
	})
});

server.listen(50000, function() {
	address = server.address();
	console.log("Listening on %j", address);
});*/