module.exports = function TCPHook(sails) {
    return {
        start: function () {
            var net = require('net');
            var redis = require('redis');
            var redisClient = redis.createClient();
            var resp = require('node-resp');

            redisClient.on('error', function (err) {
                sails.log.error(err);
            });

            var server = net.createServer(function (socket) { //'connection' listener
                var responseParser = new resp.ResponseParser();
                responseParser.on('response', function (response) {
                    if (response[0].toLowerCase() == 'ping') {
                        var device = response[1];
                        var epoch = new Date().getTime();
                        sails.log.verbose('PING from ' + device);
                        redisClient.sismember('devices', device, function (err, result) {
                            if (result) {
                                redisClient.hmset(device, 'last_ping', epoch);
                            } else {
                                redisClient.sadd('devices', device);
                                redisClient.hmset(device,
                                    'ip', socket.remoteAddress,
                                    'port', socket.remotePort,
                                    'active', true,
                                    'last_ping', epoch
                                );
                                sails.log('Added device ' + device);
                            }
                        });
                    }
                });
                //TODO: prozkoumat socket a data (hledá se něco jako iRTT)
                socket.on('data', function (data) {
                    if (data.toString().match(/\*[0-9]+([\r][\n])(\$[0-9]+\1[0-9a-z]+\1)+/i)) { //RESP
                        responseParser.parse(data);
                    }
                    socket.end(); //IMPORTANT!
                });
                socket.on('error', function (err) {
                    sails.log.error(err);
                });
            }).listen(sails.config.globals.TCP_PORT, function () { //'listening' listener
                sails.log('Starting TCP server (port ' + sails.config.globals.TCP_PORT + ')...');
            });

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
