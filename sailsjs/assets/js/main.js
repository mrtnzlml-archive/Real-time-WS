$(function () {
    var data = new RealTimeData(2);

    //.interpolate('monotone');
    var chart = $('#area').epoch({
        type: 'time.area',
        data: data.history(),
        axes: ['left', 'bottom', 'right']
    });

    setInterval(function() { chart.push(data.next()); }, 1000);
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
    var result = String(data).match(/([a-z]{4}_[0-9]{6}):(.*),(.*),(.*)/i);
    if (result) {
        var device = result[1];
        var status = result[4];
        var active = document.getElementById(device + '_status');
        if (active) {
            if (status == 'true') {
                active.style.background = 'green';
                active.title = 'Active'
            } else {
                active.style.background = 'red';
                active.title = 'Inactive'
            }
        }
    }
});

io.socket.on('msg_count', function (data) {
    var msg_count = document.getElementById('msg_count');
    if (msg_count) {
        msg_count.innerHTML = data.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
});
