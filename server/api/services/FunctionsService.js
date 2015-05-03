module.exports = {

    allowed: [
        'linear',
        'exponential',
        'logarithmic',
        'wavy',
        'boolean'
    ],

    linear: function (device, after_callback) {
        RedisService.del(device + ':table');
        var range = Array.apply(null, new Array(1024)).map(function (_, i) {
            return i;
        });
        var iterator = 0;
        range.forEach(function (entry) {
            entry = entry <= 0 ? 0 : entry;
            entry = entry >= 1023 ? 1023 : entry;
            RedisService.hmset(device + ':table', iterator++, Math.round(entry));
        });
        after_callback();
    },

    exponential: function (device, after_callback) {
        RedisService.del(device + ':table');
        for (var iterator = 0; iterator <= 1023; iterator++) {
            var entry = 1.80753 * Math.pow(1.00625, iterator);
            entry = entry <= 0 ? 0 : entry;
            entry = entry >= 1023 ? 1023 : entry;
            RedisService.hmset(device + ':table', iterator, Math.round(entry));
        }
        after_callback();
    },

    logarithmic: function (device, after_callback) {
        RedisService.del(device + ':table');
        for (var iterator = 0; iterator <= 1023; iterator++) {
            var entry = -1053.96 + (289.931 * (Math.log(iterator) / Math.log(Math.exp(1))));
            entry = entry <= 0 ? 0 : entry;
            entry = entry >= 1023 ? 1023 : entry;
            RedisService.hmset(device + ':table', iterator, Math.round(entry));
        }
        after_callback();
    },

    wavy: function (device, after_callback) {
        RedisService.del(device + ':table');
        for (var iterator = 0; iterator <= 1023; iterator++) {
            var entry = (-3.23206 * Math.pow(10, -8) * Math.pow(iterator, 4))
                + (0.000068 * Math.pow(iterator, 3)) + (-0.044362 * Math.pow(iterator, 2))
                + (9.59513 * iterator) - 47.9076;
            entry = entry <= 0 ? 0 : entry;
            entry = entry >= 1023 ? 1023 : entry;
            RedisService.hmset(device + ':table', iterator, Math.round(entry));
        }
        after_callback();
    },

    boolean: function (device, after_callback) {
        RedisService.del(device + ':table');
        var range = Array.apply(null, new Array(1024)).map(function (_, i) {
            return i;
        });
        var iterator = 0;
        range.forEach(function (entry) {
            entry = entry <= 512 ? 0 : 1023;
            RedisService.hmset(device + ':table', iterator++, Math.round(entry));
        });
        after_callback();
    }

};
