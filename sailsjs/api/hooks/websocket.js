module.exports = function WebsocketHook(sails) {
    return {
        start: function () {
            var redis = require('redis');
            var redisClient = redis.createClient();

            redisClient.on('error', function (err) {
                sails.log.error(err);
            });

            //TODO: sails.sockets (see: http://sailsjs.org/#/documentation/reference/websockets/sails.sockets)
            sails.io.on('connection', function (socket) {
                redisClient.smembers('devices', function (err, result) {
                    socket.emit('devices', result);
                    result.forEach(function (device) {
                        setInterval(function () {
                            var sma = 5; //Simple Moving Average
                            redisClient.lrange(device + ':data', 0, sma - 1, function (err, reply) {
                                var sum = 0;
                                reply.forEach(function (entry) {
                                    sum += Number(entry);
                                });
                                socket.emit('data', device + ':' + Math.round(sum / sma));
                            });
                            redisClient.hmget(device, 'ip', 'port', 'active', function (err, reply) {
                                socket.emit('status', device + ':' + reply);
                            });
                        }, 50);
                    });
                });
                setInterval(function () {
                    redisClient.get('msg_count', function (err, result) {
                        socket.emit('msg_count', result);
                    });
                }, 100);
            });
            sails.log('Starting WEBSOCKET server...');
        },
        initialize: function (cb) { // Runs automatically when the hook initializes
            var hook = this;
            hook.start();
            // You must trigger `cb` so sails can continue loading.
            // If you pass in an error, sails will fail to load, and display your error on the console.
            return cb();
        }
    }
};
