var express = require('express');
var router = express.Router();

/* GET */
router.get('/', function (req, res) {
	res.render('admin', {
		path: '/admin'
	});
});

router.get('/map', function (req, res) {
	res.render('map', {
		path: '/admin/map'
	});
});

module.exports = router;
