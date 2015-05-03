module.exports = {

    devices: {
        adc: 'AD converter',
        temp: 'Thermal sensor'
    },

    getConnectedDevices: function (connectable_devices, after_callback) {
        var connectedDevices = {};
        connectable_devices.forEach(function (device) {
            RedisService.smembers('connection:' + device, function (err, connected) {
                connectedDevices[device] = connected;
                if (Object.keys(connectedDevices).length == connectable_devices.length) {
                    after_callback(connectedDevices);
                }
            });
        });
    }

};
