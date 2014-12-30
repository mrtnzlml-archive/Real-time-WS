var IP = '127.0.0.1';
var PORT = 88;

var socket = io.connect('http://' + IP + ':' + PORT);

socket.on('data', function (data) {
	var result = String(data).match(/([a-z]{4}_[0-9]{6}):(.*)/i);
	if (result) {
		var device = result[1];
		document.getElementById(device).innerHTML = 'Real-time data from device: <span style="font-size:21px">' + result[2] + '</span><br>';
	}
});

socket.on('status', function (data) { //TODO: v JADE rovnou renderovat předlohy
	var result = String(data).match(/([a-z]{4}_[0-9]{6}):(.*),(.*),(.*)/i);
	if (result) {
		var device = result[1];
		var status = result[4];
		var active = document.getElementById(device + '_status');
		if (status == 'true') {
			active.style.background = 'green';
		} else {
			active.style.background = 'red';
		}
	}
});

socket.on('devices', function (data) {
	document.getElementById('devices').innerHTML = "";
	data.forEach(function (device) {
		var div = document.getElementById('devices');

		var col = document.createElement('div');
		col.className = 'col-lg-4 col-md-4 col-sm-4';
		var thumbnail = document.createElement('div');
		thumbnail.className = 'thumbnail';
		var caption = document.createElement('div');
		caption.className = 'caption';
		var status = document.createElement('div');
		status.id = device + '_status';
		status.className = 'status';
		status.style.background = 'red';
		var header = document.createElement('h4');
		header.innerText = 'Device name: ' + device;
		var wait = document.createElement('div');
		wait.id = device;
		wait.innerText = 'Waiting for data...';

		col.appendChild(thumbnail);
		div.appendChild(col);
		thumbnail.appendChild(caption);
		caption.appendChild(status);
		caption.appendChild(header);
		caption.appendChild(wait);
	});
});
