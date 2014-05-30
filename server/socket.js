exports.listen = function(server) {
	var io = require('socket.io').listen(server);
	io.set('authorization', function (handshakeData, callback) {
		var uid = /^[a-z]-[0-9]{10}/i;
		var localhost = /^localhost$|^127.0.0.1/i;
		if (uid.test(handshakeData.query.uid) || localhost.test(handshakeData.headers.host)) {
			callback(null, true);
		} else {
			callback(null, false); // 403 - handshake unauthorized
		}
	});
	io.sockets.on('connection', function (socket) {
		socket.emit('message', 'Welcome ' + socket.id);
		socket.broadcast.emit('message', 'Opening connection ' + socket.id);

		socket.on('data', function (data) {
			io.sockets.emit('data', data);
			socket.emit('response', 1);
		});

		socket.on('disconnect', function () {
			socket.broadcast.emit('message', 'Closing connection ' + socket.id);
		});
	});
}