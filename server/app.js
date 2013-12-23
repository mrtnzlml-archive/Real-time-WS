var express = require('express');
var routes = require('./routes');
var test = require('./routes/test');
var http = require('http');
var path = require('path');

//var redis = require('redis').createClient(); //https://github.com/mranney/node_redis

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/test', test.list);

var tmp = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

///// SOCKET.IO /////

var io = require('socket.io').listen(tmp);
io.set('log level', 2); // reduce logging

setInterval(function () {
    var to = devices['SERVER'];
    io.sockets.socket(to).emit('devices', devices);
}, 100);

var devices = {};
io.sockets.on('connection', function (socket) {

    socket.on('register', function (uid) {
        socket.uid = uid;
        devices[uid] = socket.id;
        socket.emit('message', 'Registration OK, welcome ' + uid + ' (' + socket.id + ')');
        var to = devices['SERVER'];
        io.sockets.socket(to).emit('devices', devices);

        /*redis.set('key', 'value', function(err, result) {
         console.log(result);
         });*/
        //redis.bgsave(); //redis server needs admin permission
        /*redis.get('key', function(err, result) {
         console.log(result);
         });*/
    });

    socket.on('data', function(data) {
        var to = devices['SERVER'];
        io.sockets.socket(to).emit('data', data);
    });

    socket.on('disconnect', function () {
        delete devices[socket.uid];
    });

});

//redis.on('error', function(err) { console.log(err); });