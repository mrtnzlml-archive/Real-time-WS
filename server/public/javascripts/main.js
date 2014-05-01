var socket = io.connect('ws://127.0.0.1:3000/');

socket.on('message', function (string) {
	$("#message").append(string + '<br>');
});

var count = 0;

socket.on('data', function (data) {
	count++;
	$('#message').append('Data input: ' + data.data + '<br>');
	$('#message').scrollTop($("#message")[0].scrollHeight);
});

setInterval(function() {
	$('#message').append('Zpracováno ' + count + ' požadavků za sekundu<br>');
	count = 0;
}, 1000);