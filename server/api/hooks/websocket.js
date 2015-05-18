module.exports = function WebsocketHook(sails) {
    return {
        start: function () {
            sails.io.on('connection', function (socket) {
                RedisService.smembers('devices', function (err, result) {
                    socket.emit('devices', result);
                    result.forEach(function (device) {
                        setInterval(function () {
                            var sma = 5; //Simple Moving Average
                            RedisService.lrange(device + ':data', 0, sma - 1, function (err, reply) {
                                var sum = 0;
                                reply.forEach(function (entry) {
                                    sum += Number(entry);
                                });
                                socket.emit('data', device + ':' + Math.round(sum / sma));
                            });
                            RedisService.hgetall('device:' + device, function (err, reply) {
                                //FIXME: nehrnout ven celou databázi (pro 1 device pohled)
                                socket.emit('status', device + ':' + JSON.stringify(reply));
                            });
                        }, 50);
                    });
                });
                setInterval(function () {
                    RedisService.get('msg_count', function (err, result) {
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
