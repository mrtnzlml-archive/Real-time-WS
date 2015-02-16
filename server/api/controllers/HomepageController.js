var redis = require('../services/Redis');

module.exports = {

    index: function (req, res) {
        redis.smembers('devices', function (err, result) {
            res.view({
                devices: result
            });
        });
    }

};
