/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', {
        //test: 'xxx',
        title: 'Express'
    });
};