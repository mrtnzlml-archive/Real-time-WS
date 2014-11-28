var IP = '127.0.0.1';
var PORT = 88;

var socket = io.connect('http://' + IP + ':' + PORT);

var value;

socket.on('data', function (data) {
	var result = String(data).match(/\+([a-z]{4}_[0-9]{6}):(.*)/i);
	if (result) {
		//document.getElementById(result[1]).innerHTML = result[1] + " : " + result[2];
		value = result[2];
		document.getElementById(result[1]).innerHTML = result[2];
	}
});

socket.on('devices', function (data) {
	document.getElementById('devices').innerHTML = "";
	data.forEach(function (device) {
		var pre = document.createElement('pre');
		pre.id = device;
		document.getElementById('devices').appendChild(pre);
	});
});

$(function () {
	var n = 40,
		random = d3.random.normal(0, .2),
		data = d3.range(n).map(random);

	var margin = {top: 20, right: 20, bottom: 20, left: 50},
		width = $("#graph").parent().width() - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;

	var x = d3.scale.linear()
		.domain([1, n - 2])
		.range([0, width]);

	var y = d3.scale.linear()
		.domain([0, 4096])
		.range([height, 0]);

	var line = d3.svg.line()
		.interpolate("basis")
		.x(function (d, i) {
			return x(i);
		})
		.y(function (d, i) {
			return y(d);
		});

	var svg = d3.select('#graph').append("svg")
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
		.datum(data)
		.attr("class", "line")
		.attr("d", line);

	tick();

	function tick() {
		// push a new data point onto the back
		//data.push(random());
		if(value) {
			data.push(value);
		}

		// redraw the line, and slide it to the left
		path
			.attr("d", line)
			.attr("transform", null)
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("transform", "translate(" + x(0) + ",0)")
			.each("end", tick);

		// pop the old data point off the front
		data.shift();
	}
});
