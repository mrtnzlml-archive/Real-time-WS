var IP = '127.0.0.1';
var PORT = 80;

var socket = io.connect('http://' + IP + ':' + PORT);

socket.on('data', function (data) {
	var result = String(data).match(/\+([a-z]{4}_[0-9]{6}):(.*)/i);
	if (result) {
		document.getElementById(result[1]).innerHTML = result[1] + " : " + result[2];
	}
});

socket.on('devices', function (data) {
	document.getElementById('devices').innerHTML = "";
	data.forEach(function (device) {
		var pre = document.createElement('pre');
		pre.id = device;
		document.getElementById('devices').appendChild(pre);
	});
});