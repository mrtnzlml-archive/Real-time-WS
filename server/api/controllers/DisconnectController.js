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
        //TODO: vymazat všechny vazby, který ukazují na req.param('from')
        res.redirect(req.header('Referer') || '/');
    }

};
