var net = require('net');
var dgram = require('dgram');

var tcpServer = net.createServer(),
    udpServer = dgram.createSocket('udp4'),
    clientList = [];

tcpServer.on('connection', function(client) {
  client.name = client.remoteAddress + ':' + client.remotePort;
  // client.write('Hi ' + client.name + '!\n');

  clientList.push(client);

  client.on('data', function(data) {
    var buffer = Date.now() + data;
    broadcast(buffer, client);
  });

  client.on('end', function() {
    clientList.splice(clientList.indexOf(client), 1);
  });
});

function broadcast(message, client) {
  var cleanup = [];
  for (var i = 0;i < clientList.length; i += 1) {
    if (client !== clientList[i]) {
      if (clientList[i].writable) {
        clientList[i].write(message);
      } else {
        cleanup.push(clientList[i]);
        clientList[i].destroy();
      }
    }
    else {
      client.write(message);
    }
  }
  for (i = 0;i < cleanup.length; i += 1) {
    clientList.splice(clientList.indexOf(cleanup[i]), 1);
  }
}

tcpServer.listen(3000);


udpServer.on('message', function(message, remote) {
  var buffer = Date.now() + data;

  for (var i = 0; i < clientList.length; i++) {
    udpServer.send(buffer, 0, buffer.length, 3001, clientList[i].name.split()[0]);
  }
});

udpServer.bind(3001);


