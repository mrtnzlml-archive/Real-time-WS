module.exports = function TCPHook(sails) {
    return {
        start: function () {
            var net = require('net');
            var resp = require('node-resp');

            var server = net.createServer(function (socket) { //'connection' listener
                var responseParser = new resp.ResponseParser();
                responseParser.on('response', function (response) {
                    if (response[0].toLowerCase() == 'ping') {
                        var device = String(response[1]).toLowerCase();
                        var epoch = new Date().getTime();
                        sails.log.verbose('PING from ' + device);
                        RedisService.sismember('devices', device, function (err, result) {
                            if (result) {
                                RedisService.hmset('device:' + device, 'last_ping', epoch);
                            } else {
                                RedisService.sadd('devices', device);
                                RedisService.hmset('device:' + device,
                                    'ip', socket.remoteAddress,
                                    'port', socket.remotePort,
                                    'active', true,
                                    'last_ping', epoch
                                );
                                sails.log('Added device ' + device);
                            }
                            RedisService.hincrby('device:' + device, 'msg_count', 1);
                        });
                    }
                });
                socket.on('data', function (data) {
                    RedisService.incr('msg_count');
                    if (data.toString().match(/\*[0-9]+([\r][\n])(\$[0-9]+\1[0-9a-z]+\1)+/i)) { //RESP
                        responseParser.parse(data);
                    }
                    //socket.end();
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
