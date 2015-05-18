module.exports = function UDPHook(sails) {
    return {
        start: function () {
            var dgram = require('dgram');
            var udpSocket = dgram.createSocket('udp4');

            udpSocket.on('message', function (msg, rinfo) {
                sails.log.verbose(JSON.stringify(msg.toString()));
                RedisService.incr('msg_count');
                if (result = msg.toString().match(/\*[0-9]+([\r][\n])\$[0-9]+\1([0-9a-z_]+)\1\$[0-9]+\1([0-9a-z_]+)\1+/i)) { //RESP
                    var device = result[2].toLowerCase();
                    var data = result[3];
                    RedisService.lpush(device + ':data', data);
                    RedisService.ltrim(device + ':data', 0, 999);
                    RedisService.hmset('device:' + device,
                        'last_ping', new Date().getTime(),
                        'udp_port', rinfo.port
                    );
                    RedisService.hincrby('device:' + device, 'msg_count', 1);
                }
            }).bind(sails.config.globals.UDP_PORT, function () {
                sails.log('Starting UDP server (port ' + sails.config.globals.UDP_PORT + ')...');
            });

            var previous = {};
            setInterval(function () {
                //get all devices
                RedisService.smembers('devices', function (err, devices) {
                    devices.forEach(function (device) {
                        //for each device get all connections
                        RedisService.smembers('connection:' + device, function (err, connected) {
                            //if there is connected device
                            if (connected.length) {
                                //get last data information from device #label-1
                                RedisService.lindex(device + ':data', 0, function (err, reply) {
                                    //get all info about connected device
                                    RedisService.hgetall('device:' + connected, function (err, result) {
                                        //and if device is active, send it data from #label-1
                                        if (result.active == 'true') {
                                            RedisService.hget(device + ':table', Number(reply), function (err, newValue) {
                                                if (newValue == previous[device]) { //Lazy sending
                                                    //sails.log('I\'m lazy...');
                                                    //return;
                                                }
                                                previous[device] = newValue;
                                                var message = new Buffer(newValue);
                                                udpSocket.send(message, 0, message.length, result.udp_port, result.ip);
                                                sails.log.silly('Sending "' + message + '" from ' + device + ' to ' + connected + ' (' + result.ip + ':' + result.udp_port + ')');
                                                RedisService.hincrby('device:' + device, 'msg_count', 1);
                                                RedisService.incr('msg_count');
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            }, 10);

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
