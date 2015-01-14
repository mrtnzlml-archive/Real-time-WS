var redis = require('redis');
var redisClient = redis.createClient();

module.exports = {

    smembers: function (setName, callback) {
        redisClient.smembers(setName, callback);
    }

};
