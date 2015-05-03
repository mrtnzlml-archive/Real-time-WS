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
                });
            } else {
                res.redirect('/');
            }
        });
    },

    function_change: function (req, res) {
        var device = req.param('device');
        RedisService.sismember('devices', device, function (err, result) {
            if (result) {

                var new_function = req.param('function');
                if (FunctionsService.allowed.indexOf(new_function) > -1) {
                    FunctionsService[new_function](device, function () {
                        RedisService.hmset('device:' + device, 'function', new_function);
                        res.send(200, {
                            new_function: new_function
                        })
                    });
                } else {
                    sails.log.error('Function ' + new_function + ' is not allowed');
                    res.send(500, {
                        error: 'Function ' + new_function + ' is not allowed'
                    });
                }

            } else {
                sails.log.error('Sorry, device ' + device + ' doesn\'t exist.');
                req.flash('danger', 'Sorry, device ' + device + ' doesn\'t exist.');
                res.redirect(req.header('/'));
            }
        });
    }

};
