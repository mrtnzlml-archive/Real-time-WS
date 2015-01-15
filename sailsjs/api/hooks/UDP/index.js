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
                //FIXME: not good!
                if (result = msg.toString().match(/\*[0-9]+([\r][\n])(\$[0-9]+\1([0-9a-z]+)\1)+/i)) { //RESP
                    //sails.log(result);
                    //redisClient.lpush('TEMP_000001:data', result[3]);
                    //redisClient.ltrim('TEMP_000001:data', 0, 999);
                    //FIXME
                    redisClient.lpush('temp_000002:data', result[3]);
                    redisClient.ltrim('temp_000002:data', 0, 999);
                    redisClient.hmset('device:temp_000002', 'last_ping', new Date().getTime());
                    redisClient.hincrby('device:temp_000002', 'msg_count', 1);
                }
                var message = new Buffer('test');
                udpSocket.send(message, 0, message.length, rinfo.port, rinfo.address);
            }).bind(sails.config.globals.UDP_PORT, function () {
                sails.log('Starting UDP server (port ' + sails.config.globals.UDP_PORT + ')...');
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
