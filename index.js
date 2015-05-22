'use strict'

var config = require('./config');
var net    = require('net');
var _      = require('lodash');

var server = net.createServer(function(socket){
  var address = socket.address().address;
  if (_.includes(config.addresses, address)) {
    // log
    console.log('Connection accepted:', address);
    // config the socket
    socket.setTimeout(0);
    socket.setKeepAlive(true);

    // create client socket
    var client = net.connect({
      port: config.proxyPort
    });

    // pause socket
    socket.pause();

    client.on('connect', function(){
      // config the client
      client.setTimeout(0);
      client.setKeepAlive(true);
      // resume socket
      socket.resume();
    });

    client.on('data', function(data){
      socket.write(data);
    });

    client.on('end', function() {
      socket.end();
    });

    client.on('error', function(e) {
      socket.end();
    });

    socket.on('data', function(data){
      client.write(data);
    });

    socket.on('end', function(){
      client.end();
    });

    socket.on('error', function(){
      client.end();
    });
  } else {
    // drop socket
    console.log('Connection Dropped:', address);
    socket.end();
  }
});

server.listen(config.port);
