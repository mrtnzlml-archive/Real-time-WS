$(function () {
    var function_select = $('#function');
    function_select.change(function () {
        $.ajax({
            type: 'POST',
            url: $('#function-form').attr('action'),
            data: function_select.serialize(),
            success: function (data) {
                var saved = $("#saved");
                saved.show(1, function () {
                    setTimeout(function () {
                        saved.hide();
                    }, 2000);
                });
                console.log('New ' + data.new_function + ' function successfully saved.');
            }
        });
    });

    var n = 300, gdata = d3.range(n);
    var margin = {top: 20, right: 20, bottom: 20, left: 50},
        width = 750 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;
    var x = d3.scale.linear()
        .domain([0, n - 1])
        .range([0, width]);
    var y = d3.scale.linear()
        .domain([0, 1023])
        .range([height, 0]);
    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(d); });
    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"));
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"));
    var path = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(gdata)
        .attr("class", "line")
        .attr("d", line);

    io.socket.on('data', function (data) {
        var result = String(data).match(/([a-z]{4}_[0-9]{6}):(.*)/i);
        if (result) {
            var device = result[1];
            var data_element = document.getElementById(device);
            if (data_element) {
                data_element.innerHTML = result[2];

                gdata.push(result[2]); // push a new data point onto the back
                path.attr("d", line) // redraw the line, and slide it to the left
                    .attr("transform", null)
                    .transition()
                    .duration(500)
                    .ease("linear")
                    .attr("transform", "translate(" + x(-1) + ",0)");
                gdata.shift(); // pop the old data point off the front
            }
        }
    });

});

setTimeout(function sunrise() {
    document.getElementsByClassName('header')[0].style.backgroundColor = '#2980b9';
}, 0);

//io.socket.on('data', function (data) {
//    var result = String(data).match(/([a-z]{4}_[0-9]{6}):(.*)/i);
//    if (result) {
//        var device = result[1];
//        var data_element = document.getElementById(device);
//        if (data_element) {
//            data_element.innerHTML = result[2];
//        }
//    }
//});

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
