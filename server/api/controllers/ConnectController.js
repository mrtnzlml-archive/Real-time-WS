//FIXME: redis používat jen v service, kde bude ošetřený .on('error', ...)

var redis = require('redis');
var redisClient = redis.createClient();

module.exports = {

    index: function (req, res) {
        //FIXME: kontrola validity vstupních dat! (jestli existuje v devices)
        redisClient.sadd('connection:' + req.param('from'), req.param('to'), function (err, result) {
            req.flash('success', req.param('from') + ' successfully connected to the ' + req.param('to'));
            res.redirect('/');
        });
    }

};
