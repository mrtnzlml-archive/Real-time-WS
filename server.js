//http://www.slideshare.net/cjoudrey/going-realtime-with-socketio

var http = require('http');
var fs = require('fs');
var redis = require('redis').createClient(); //https://github.com/mranney/node_redis

var index = fs.readFileSync(__dirname + '/index.html');
var app = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(index);
}).listen(1234);

var devices = {};

// Socket.io server listens to our app
var io = require('socket.io').listen(app);
//io.set('log level', 2); // reduce logging

/*setInterval(function() {
	var to = devices['SERVER'];
	io.sockets.socket(to).emit('devices', devices);
}, 100);*/

io.sockets.on('connection', function(socket) {

	socket.on('register', function(uid) {
		socket.uid = uid;
		devices[uid] = socket.id;
		socket.emit('message', 'Registration OK, welcome ' + uid + ' (' + socket.id + ')');
		var to = devices['SERVER'];
		io.sockets.socket(to).emit('devices', devices);

		/*redis.set('key', 'value', function(err, result) {
			console.log(result);
		});*/
		//redis.bgsave(); //redis server needs admin permission
		redis.get('key', function(err, result) {
			console.log(result);
		});
	});

	socket.on('disconnect', function(){
		delete devices[socket.uid];
	});

});

redis.on('error', function(err) { console.log(err); });