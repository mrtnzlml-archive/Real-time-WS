var IP = '127.0.0.1';
var PORT = 50000;

var socket = io.connect('http://' + IP + ':' + PORT);
socket.on('news', function (data) {
	console.log(data);
	socket.emit('my other event', { my: 'data' });
});

socket.on('data', function (data) {
	document.getElementById('data').innerHTML = "" + data;
});