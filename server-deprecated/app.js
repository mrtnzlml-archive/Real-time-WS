var express = require('express');
var http = require('http');
var path = require('path');
var redis = require('redis').createClient(); //https://github.com/mranney/node_redis
var fs = require('fs');
var app = express();

//TODO: http://howtonode.org/socket-io-auth

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride()); //support _method (PUT in forms etc)
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) { //TODO: case sensitive URL (webalize?)
    if (req.url.substr(-1) == '/' && req.url.length > 1) {
        res.redirect(301, req.url.slice(0, -1));
    } else if (req.url.substr(-6) == '/index') {
        res.redirect(301, req.url.slice(0, -6)); //kanonizace
    } else {
        next();
    }
});

fs.readdirSync(path.join(__dirname, 'controllers')).forEach(function (name) {
    var obj = require(path.join(__dirname, 'controllers', name));
    var method = 'get';
    var url;
    for (var key in obj) {
        url = '/' + name + '/' + key;
        url = url.replace(/\/index$/i, '');
        url = url.replace(/homepage/i, '');
        app[method](url, obj[key]); //routing
    }
});

app.use(function (err, req, res, next) { //error middleware
    console.error(err.stack);
    res.status(500).render('error/5xx');
});
app.use(function (req, res, next) {
    res.status(404).render('error/404', { url: req.originalUrl });
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

///// SOCKET.IO /////

var io = require('socket.io').listen(server);
io.set('log level', 2); // reduce logging
io.set('close timeout', 30);
io.set('authorization', function (handshakeData, callback) {
    var uid = /^UID-[0-9]{4}/i;
    var localhost = /^localhost$|^127.0.0.1/i;
    //TODO: kontrola přes query se mi nelíbí, vymyslet lepší autorizaci koncentrátorů
    if (uid.test(handshakeData.query.uid) || localhost.test(handshakeData.headers.host)) {
        callback(null, true);
    } else {
        callback(null, false); // 403 - handshake unauthorized
    }
});

io.sockets.on('connection', function (socket) {
    //TODO: rooms ( socket.join('room')/io.sockets.in('room').emit('message', {foo:bar}); )
    socket.emit('news', 'Welcome ' + socket.id);
    socket.broadcast.emit('news', 'Opening connection ' + socket.id);

    socket.on('data', function (data) {
        io.sockets.emit('data', data);
    });

    socket.on('disconnect', function () {
        socket.broadcast.emit('news', 'Closing connection ' + socket.id);
    });

});

setInterval(function () {
    //NOP
}, 100);

redis.on("error", function (err) {
    console.error("error event - " + client.host + ":" + client.port + " - " + err);
});