var express = require('express');
var router = express.Router();

/* GET */
router.get('/', function (req, res) {
	res.render('admin', {
		path: '/admin'
	});
});

module.exports = router;
