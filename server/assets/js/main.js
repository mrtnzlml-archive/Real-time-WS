$(function () {
    var data = new RealTimeData(2);

    //.interpolate('monotone');
    var chart = $('#area').epoch({
        type: 'time.area',
        data: data.history(),
        axes: ['left', 'bottom', 'right']
    });

    setInterval(function () {
        chart.push(data.next());
    }, 1000);
    chart.push(data.next());
});

setTimeout(function sunrise() {
    document.getElementsByClassName('header')[0].style.backgroundColor = '#2980b9';
}, 0);

io.socket.on('data', function (data) {
    var result = String(data).match(/([a-z]{4}_[0-9]{6}):(.*)/i);
    if (result) {
        var device = result[1];
        var data_element = document.getElementById(device);
        if (data_element) {
            data_element.innerHTML = result[2];
        }
    }
});

io.socket.on('status', function (data) {
    var result = String(data).match(/([a-z]{4}_[0-9]{6}):(.*)/i);
    if (result) {
        var device = result[1];
        var device_data = JSON.parse(result[2]);
        var active = document.getElementById(device + '_status');
        if (active) {
            if (device_data.active == 'true') {
                active.style.background = 'green';
                active.title = 'Active'
            } else {
                active.style.background = 'red';
                active.title = 'Inactive'
            }
        }
        var tcp_ip = document.getElementById(device + '_tcp_ip');
        if (tcp_ip) {
            tcp_ip.innerHTML = device_data.ip + ':' + device_data.port;
        }
        var udp_ip = document.getElementById(device + '_udp_ip');
        if (udp_ip) {
            udp_ip.innerHTML = device_data.ip + ':' + device_data.udp_port;
        }
        var msg_count = document.getElementById(device + '_msg_count');
        if (msg_count) {
            msg_count.innerHTML = device_data.msg_count.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
        var last_ping = document.getElementById(device + '_last_ping');
        if (last_ping) {
            last_ping.innerHTML = new Date(Number(device_data.last_ping));
        }
    }
});

io.socket.on('msg_count', function (data) {
    var msg_count = document.getElementById('msg_count');
    if (msg_count) {
        msg_count.innerHTML = data.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
});
