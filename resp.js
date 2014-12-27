var net = require('net');

var client = net.connect({port: 6379}, function() {
	console.log('Connected to the Redis server.');

	client.write('*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nxxxxx\r\n');
	client.write('*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n');
	client.write('GET key\r\n');

/*
	client.write('*1\r\n$4\r\nPING\r\n');
	
	client.write('*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nxxxxx\r\n');
	client.write('*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n');

	client.write('*5\r\n$5\r\nPFADD\r\n$11\r\nHyperLogLog\r\n$3\r\nxxx\r\n$3\r\nyyy\r\n$3\r\nzzz\r\n');
	client.write('*2\r\n$7\r\nPFCOUNT\r\n$11\r\nHyperLogLog\r\n');

	//client.write('*1\r\n$4\r\nPING\r\n*3\r\n$3\r\nSET\r\n$3\r\nkey\r\n$5\r\nxxxxx\r\n*2\r\n$3\r\nGET\r\n$3\r\nkey\r\n*5\r\n$5\r\nPFADD\r\n$11\r\nHyperLogLog\r\n$3\r\nxxx\r\n$3\r\nyyy\r\n$3\r\nzzz\r\n*2\r\n$7\r\nPFCOUNT\r\n$11\r\nHyperLogLog\r\n');

	client.write('*1\r\n$7\r\nFLUSHDB\r\n');
*/
});

client.on('data', function(data) {
	console.log(data.toString());
	console.log(JSON.stringify(data.toString()));
	client.end();
});

client.on('end', function() {
	console.log('Disconnected from the Redis server.');
});
