//TODO: window.location.host
// (https://github.com/waratuman/flight-stream/blob/master/public/application.js)

var socket = io.connect('ws://127.0.0.1:3000/');
var ext = {
    data: 0
};

socket.on('news', function (string) {
    $("#news").append(string + '<br>');
});

socket.on('data', function (data) {
    ext = data;
    $('#data').html(data.data);
    $('.concentrator').html(data.uid);
});

socket.on('error', function () {
    console.error(arguments)
});