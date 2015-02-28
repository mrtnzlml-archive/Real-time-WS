var redis = require('../services/Redis');

module.exports = {

    index: function (req, res) {
        redis.smembers('devices', function (err, connectable) {
            _getConnectedDevices(connectable, function (connected) {
                res.view({
                    connectableDevices: connectable,
                    connectedDevices: connected
                });
            });
        });
    }

};

function _getConnectedDevices(devices, callback) {
    var connectedDevices = {};
    devices.forEach(function (device) {
        redis.smembers('connection:' + device, function (err, connected) {
            connectedDevices[device] = connected;
            if (Object.keys(connectedDevices).length == devices.length) {
                callback(connectedDevices);
            }
        });
    });
}
