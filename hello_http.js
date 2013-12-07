var http = require('http');
var fs = require('fs');
var redis = require('node-redis').createClient('80', '127.0.0.1');

var index = fs.readFileSync(__dirname + '/index.html');
var app = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(index);
}).listen(1234);

var devices = {};

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

setInterval(function() {
	var to = devices['SERVER'];
	io.sockets.socket(to).emit('devices', devices);
}, 100);

io.sockets.on('connection', function(socket) {

	socket.on('register', function(uid) {
		socket.uid = uid;
		devices[uid] = socket.id;
		socket.emit('message', 'Registration OK, welcome ' + uid + ' (' + socket.id + ')');
		var to = devices['SERVER'];
		io.sockets.socket(to).emit('devices', devices);
	});

	socket.on('disconnect', function(){
		delete devices[socket.uid];
	});

});