var express = require('express');
var router = express.Router();

/* GET */
router.get('/', function(req, res) {
  res.render('api', {
  	path: '/api'
  });
});

module.exports = router;
