module.exports = {

    index: function (req, res) {
        RedisService.smembers('devices', function (err, connectable) {
            DevicesService.getConnectedDevices(connectable, function (connected) {
                res.view({
                    //FIXME: resolve device name and usage (Thermal, ADC, ...)
                    connectableDevices: connectable,
                    connectedDevices: connected
                });
            });
        });
    }

};
