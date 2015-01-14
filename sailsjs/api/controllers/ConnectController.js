module.exports = {

    index: function (req, res) {
        //FIXME: kontrola validity vstupních dat!
        sails.log(req.param('from'));
        sails.log(req.param('to'));
        req.flash('info', req.param('from') + ' successfully connected to the ' + req.param('to'));
        res.redirect('/');
    }

};
