var express = require('express');
var router = express.Router();
var redis = require("redis");
var redisClient = redis.createClient();

/* GET */
router.get('/', function (req, res) {
	res.render('admin', {
		path: '/admin'
	});
});

//http://blogs.telerik.com/backendservices/posts/13-11-21/form-validation-with-expressjs
router.post('/', function (req, res) {
	//FIXME: ošetření dat!
	console.log(req.body.xxx);
	res.render('admin', {
		path: '/admin'
	});
});

router.get('/map', function (req, res) {
	redisClient.smembers('devices', function (err, result) {
		res.render('map', {
			path: '/admin/map',
			devices: result
		});
	});
});

module.exports = router;
