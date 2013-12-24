var socket = io.connect('ws://127.0.0.1/');
var ext;

socket.on('connect', function () {
    socket.emit('register', 'SERVER');
});

socket.on('devices', function (data) {
    //console.log(data);
    $('li.dev').remove();
    $.each(data, function (key, value) {
        $('#devices').append('<li class=dev>' + key + ' (' + value + ')</li>');
    });
});

socket.on('data', function (data) {
    ext = data;
    $('#data').html(data.data);
    $('.concentrator').html(data.uid);
});

socket.on('message', function (data) {
    $('#message').html(data);
});

socket.on('error', function () {
    console.error(arguments)
});