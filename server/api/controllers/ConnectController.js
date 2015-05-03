module.exports = {

    index: function (req, res) {
        RedisService.sismember('devices', req.param('from'), function (err, result) {
            if (result) { // FROM device exists
                RedisService.sismember('devices', req.param('to'), function (err, result) {
                    if (result) { // TO device exists
                        RedisService.sadd('connection:' + req.param('from'), req.param('to'), function (err, result) {
                            sails.log(req.param('from') + ' successfully connected to the ' + req.param('to'));
                            req.flash('success', req.param('from') + ' successfully connected to the ' + req.param('to'));
                            res.redirect(req.header('Referer') || '/');
                        });
                    } else {
                        sails.log.error('Sorry, device ' + req.param('to') + ' doesn\'t exist.');
                        req.flash('danger', 'Sorry, device ' + req.param('to') + ' doesn\'t exist.');
                        res.redirect(req.header('Referer') || '/');
                    }
                });
            } else {
                sails.log.error('Sorry, device ' + req.param('from') + ' doesn\'t exist.');
                req.flash('danger', 'Sorry, device ' + req.param('from') + ' doesn\'t exist.');
                res.redirect(req.header('Referer') || '/');
            }
        });
    }

};
