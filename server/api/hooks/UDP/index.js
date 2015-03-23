module.exports = function UDPHook(sails) {
    return {
        start: function () {
            var dgram = require('dgram');
            var udpSocket = dgram.createSocket('udp4');
            var redis = require('redis');
            var redisClient = redis.createClient();

            redisClient.on('error', function (err) {
                sails.log.error(err);
            });

            udpSocket.on('message', function (msg, rinfo) {
                sails.log.verbose(JSON.stringify(msg.toString()));
                redisClient.incr('msg_count');
                if (result = msg.toString().match(/\*[0-9]+([\r][\n])\$[0-9]+\1([0-9a-z_]+)\1\$[0-9]+\1([0-9a-z_]+)\1+/i)) { //RESP
                    var device = result[2].toLowerCase();
                    var data = result[3];
                    redisClient.lpush(device + ':data', data);
                    redisClient.ltrim(device + ':data', 0, 999);
                    redisClient.hmset('device:' + device,
                        'last_ping', new Date().getTime(),
                        'udp_port', rinfo.port
                    );
                    redisClient.hincrby('device:' + device, 'msg_count', 1);
                }
            }).bind(sails.config.globals.UDP_PORT, function () {
                sails.log('Starting UDP server (port ' + sails.config.globals.UDP_PORT + ')...');
            });

            setInterval(function () {
                redisClient.smembers('devices', function (err, devices) {
                    devices.forEach(function (device) {
                        redisClient.smembers('connection:' + device, function (err, connected) {
                            if (connected.length) {
                                redisClient.lindex(device + ':data', 0, function (err, reply) {
                                    redisClient.hgetall('device:' + device, function (err, result) {
                                        //FIXME: vytvořit zde prodlevu - odesílají se moc rychle
                                        if (result.active == 'true') {
                                            var message = new Buffer(reply);
                                            udpSocket.send(message, 0, message.length, result.udp_port, result.ip);
                                            sails.log('Sending data from ' + device + ' (' + reply + ') to ' + connected + ' (' + result.ip + ':' + result.udp_port + ')');
                                            redisClient.hincrby('device:' + device, 'msg_count', 1);
                                            redisClient.incr('msg_count');
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }, 100);

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
