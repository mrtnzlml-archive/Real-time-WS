module.exports = {

    index: function (req, res) {
        var device = req.param('device');
        RedisService.sismember('devices', device, function (err, result) {
            if (result) {
                RedisService.hgetall('device:' + device, function (err, result) {


                    RedisService.smembers('devices', function (err, connectable) {
                        DevicesService.getConnectedDevices(connectable, function (connected) {
                            res.view({
                                //FIXME: resolve device name and usage (Thermal, ADC, ...)
                                device_name: device,
                                device_data: result,
                                connectableDevices: connectable,
                                connectedDevices: connected
                            });
                        });
                    });


                    //res.view({
                    //    'device_name': device,
                    //    'device_data': result
                    //});
                });
            } else {
                res.redirect('/');
            }
        });
    }

};
