var redis = require('redis');
var redisClient = redis.createClient();

module.exports = {

    index: function (req, res) {
        var device = req.param('device');
        redisClient.sismember('devices', device, function (err, result) {
            if (result) {
                redisClient.hgetall('device:' + device, function (err, result) {
                    res.view({
                        'device_name': device,
                        'device_data': result
                    });
                });
            } else {
                res.redirect('/');
            }
        });
    }

};
