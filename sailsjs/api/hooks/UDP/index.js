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
                    redisClient.hmset('device:' + device, 'last_ping', new Date().getTime());
                    redisClient.hincrby('device:' + device, 'msg_count', 1);
                }

                var message = new Buffer('test');
                udpSocket.send(message, 0, message.length, rinfo.port, rinfo.address);

            }).bind(sails.config.globals.UDP_PORT, function () {
                sails.log('Starting UDP server (port ' + sails.config.globals.UDP_PORT + ')...');
            });

        },
        send: function () {
            //TODO: data z "connection" tabulky
        },
        initialize: function (cb) { // Runs automatically when the hook initializes
            var hook = this;
            hook.start();
            hook.send();
            // You must trigger `cb` so sails can continue loading.
            // If you pass in an error, sails will fail to load, and display your error on the console.
            return cb();
        }
    }
};
