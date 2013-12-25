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
// MIDDLEWARES HERE
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

var devices = {};

io.sockets.on('connection', function (socket) {

    socket.on('register', function (uid) {
        redis.zadd('devices', Date.now(), socket.id);
        redis.zrevrangebyscore('devices', '+inf', '-inf', function(err, reply) {
            io.sockets.emit('devices', reply);
        });

        socket.uid = uid; //FIXME: via redis - takto to nefunguje dobře (proč?)
        devices[uid] = socket.id;
        socket.emit('message', 'Registration OK, welcome ' + uid + ' (' + socket.id + ')');
        var to = devices['SERVER'];
        //io.sockets.socket(to).emit('devices', devices);
    });

    socket.on('data', function (data) {
        var to = devices['SERVER'];
        io.sockets.socket(to).emit('data', data);
    });

    socket.on('ping', function (data) {
        console.log('PONG');
    });

    socket.on('disconnect', function () {
        redis.zrem('devices', socket.id);
        delete devices[socket.uid];
    });

    //redis.del('devices');

});

setInterval(function () {
    redis.zrevrangebyscore('devices', '+inf', '-inf', function(err, reply) {
        io.sockets.emit('devices', reply);
    });
    var to = devices['SERVER'];
    //io.sockets.socket(to).emit('devices', devices);
}, 100);

redis.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});