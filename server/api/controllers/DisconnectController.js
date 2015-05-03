module.exports = {

    index: function (req, res) {
        RedisService.exists('connection:' + req.param('from'), function (err, result) {
            if (result) { // connection exists
                RedisService.srem('connection:' + req.param('from'), req.param('to'), function (err, result) {
                    req.flash('success', req.param('to') + ' successfully disconnected from the ' + req.param('from'));
                    res.redirect(req.header('Referer') || '/');
                });
            } else {
                req.flash('danger', 'Sorry, this connection doesn\'t exist.');
                res.redirect(req.header('Referer') || '/');
            }
        });
    },

    all: function (req, res) {
        RedisService.del('connection:' + req.param('from'), function (err, result) {
            req.flash('success', 'All connections successfully dropped!');
            res.redirect(req.header('Referer') || '/');
        });
    },

    release: function (req, res) {
        RedisService.smembers('devices', function (err, result) {
            result.forEach(function (device) {
                RedisService.sismember('connection:' + device, req.param('from'), function (err, result) {
                    if (result) { // FROM device exists
                        sails.log('Releasing connection (from device ' + device + ' to ' + req.param('from') + ')');
                        RedisService.srem('connection:' + device, req.param('from'), function (err, result) {
                            sails.log('Connection successfully released (from device ' + device + ' to ' + req.param('from') + ')');
                        });
                    }
                });
            });
        });
        req.flash('success', 'All connections has been released successfully.');
        res.redirect(req.header('Referer') || '/');
    }

};
