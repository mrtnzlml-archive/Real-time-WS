var should = require('should');
var io = require('socket.io-client');
var socketURL = 'ws://127.0.0.1:3000';
var options = {
    transports: ['websocket'],
    'force new connection': true
};
//https://github.com/liamks/Testing-Socket.IO

describe('Websocket server', function () {

    it('should broadcast message on register event', function (done) {
        var client = io.connect(socketURL, options);
        client.should.be.type('object');

        client.on('connect', function () {
            client.emit('register', 'UID-TEST');
        });

        client.on('message', function (data) {
            data.should.be.type('string');
            data.should.match(/Registration OK, welcome UID-TEST \([0-9a-z\-\_]{20}\)/i);
            // If this client doesn't disconnect it will interfere with the next test
            client.disconnect();
            done();
        });
    });

    it('should return data on data event', function (done) {
        var client = io.connect(socketURL, options);
        client.emit('data', 'ěščřžýáíé');
        client.on('data', function (data) {
            data.should.be.type('string');
            data.should.be.equal('ěščřžýáíé');
            client.disconnect();
            done();
        });
    })

});