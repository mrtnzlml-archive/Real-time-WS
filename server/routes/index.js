var express = require('express');
var router = express.Router();

/* GET */
router.get('/', function (req, res) {
	res.render('index', {
		path: req.path,
		title: 'Express'
	});
});

module.exports = router;
