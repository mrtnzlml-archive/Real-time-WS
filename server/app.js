var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var redis = require('redis').createClient(); //https://github.com/mranney/node_redis
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/test', routes.test);
app.get('*', routes.e404);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

///// SOCKET.IO /////

var io = require('socket.io').listen(server);
io.set('log level', 2); // reduce logging
io.set('close timeout', 30);

io.sockets.on('connection', function (socket) {

    socket.on('register', function (uid) {
        var device = {};
        device[uid] = socket.id;
        redis.zadd('devices', Date.now(), JSON.stringify(device)); //FIXME: unique UID
        redis.zrevrangebyscore('devices', '+inf', '-inf', function (err, reply) {
            io.sockets.emit('devices', reply);
        });
        socket.uid = uid;
        socket.emit('message', 'Registration OK, welcome ' + uid + ' (' + socket.id + ')');
    });

    socket.on('data', function (data) {
        //var to = devices['SERVER'];
        //io.sockets.socket(to).emit('data', data);
        io.sockets.emit('data', data);
    });

    socket.on('ping', function (data) {
        console.log('PONG');
    });

    socket.on('disconnect', function () {
        var device = {};
        device[socket.uid] = socket.id;
        redis.zrem('devices', JSON.stringify(device));
    });

});

setInterval(function () {
    redis.zrevrangebyscore('devices', '+inf', '-inf', function (err, reply) {
        io.sockets.emit('devices', reply);
    });
}, 100);

redis.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});