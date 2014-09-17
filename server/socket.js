exports.listen = function(server) {
	var io = require('socket.io').listen(server);
	//FIXME: doesn't work on remote Heroku Cedar server
	//see http://socket.io/docs/migrating-from-0-9/
	/*io.set('authorization', function (handshakeData, callback) {
		var uid = /^[a-z]-[0-9]{10}/i;
		var localhost = /^localhost$|^127.0.0.1/i;
		if (uid.test(handshakeData.query.uid) || localhost.test(handshakeData.headers.host)) {
			callback(null, true);
		} else {
			callback(null, false); // 403 - handshake unauthorized
		}
	});*/
	io.sockets.on('connection', function (socket) {
		socket.emit('message', 'Welcome ' + socket.id);
		socket.broadcast.emit('message', 'Opening connection ' + socket.id);

		setInterval(function() {
			socket.emit('ping', new Date().getTime());
		}, 100);

		socket.on('pong', function (data) {
			var latency = new Date().getTime() - data;
			console.log('Latency: ' + latency + 'ms');
			io.emit('data', 'Latency: ' + latency + 'ms');
		});

		socket.on('disconnect', function () {
			socket.broadcast.emit('message', 'Closing connection ' + socket.id);
		});
	});
}