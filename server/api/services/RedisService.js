var redis = require('redis');
var redisClient = redis.createClient();

redisClient.on('error', function (err) {
    sails.log.error(err);
});

module.exports = {

    del: function () {
        redisClient.del.apply(redisClient, arguments);
    },
    exists: function () {
        redisClient.exists.apply(redisClient, arguments);
    },
    get: function () {
        redisClient.get.apply(redisClient, arguments);
    },
    incr: function () {
        redisClient.incr.apply(redisClient, arguments);
    },

    ///// HASHES /////
    hincrby: function () {
        redisClient.hincrby.apply(redisClient, arguments);
    },
    hmget: function () {
        redisClient.hmget.apply(redisClient, arguments);
    },
    hget: function () {
        redisClient.hget.apply(redisClient, arguments);
    },
    hgetall: function () {
        redisClient.hgetall.apply(redisClient, arguments);
    },
    hmset: function () {
        redisClient.hmset.apply(redisClient, arguments);
    },

    ///// LISTS /////
    lindex: function () {
        redisClient.lindex.apply(redisClient, arguments);
    },
    lpush: function () {
        redisClient.lpush.apply(redisClient, arguments);
    },
    rpush: function () {
        redisClient.rpush.apply(redisClient, arguments);
    },
    lrange: function () {
        redisClient.lrange.apply(redisClient, arguments);
    },
    ltrim: function () {
        redisClient.ltrim.apply(redisClient, arguments);
    },

    ///// SETS /////
    sadd: function () {
        redisClient.sadd.apply(redisClient, arguments);
    },
    sismember: function () {
        redisClient.sismember.apply(redisClient, arguments);
    },
    smembers: function () {
        redisClient.smembers.apply(redisClient, arguments);
    },
    srem: function () {
        redisClient.srem.apply(redisClient, arguments);
    }

};
