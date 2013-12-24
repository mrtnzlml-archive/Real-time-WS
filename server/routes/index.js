var error = 'error';

exports.index = function (req, res) {
    res.render('index', {
        title: 'Express'
    });
};

exports.test = function (req, res) {
    res.render('test', {
        title: 'Test'
    });
};

exports.e404 = function (req, res) {
    res.render(error + '/404', {
        title: 'ERR404'
    });
};