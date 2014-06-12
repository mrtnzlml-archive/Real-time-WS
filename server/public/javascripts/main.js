//var host = location.origin.replace(/^http/, 'ws');
var socket = io.connect('/');

socket.on('message', function (string) {
	$("#message").append(string + '<br>');
});

var count = 0;

socket.on('data', function (data) {
	count++;
	//$('#message').append('Data input (' + data.uid + '): ' + data.data + '<br>');
	$('#message').append(data + '<br>');
	$('#message').scrollTop($("#message")[0].scrollHeight);
});

setInterval(function() {
	//$('#message').append('Zpracováno ' + count + ' požadavků za sekundu<br>');
	count = 0;
}, 1000);