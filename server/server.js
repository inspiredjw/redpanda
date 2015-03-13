var net = require('net');

var tcpServer = net.createServer(),
    clientList = [];

tcpServer.on('connection', function(client) {
  client.name = client.remoteAddress + ':' + client.remotePort
  client.write('Hi ' + client.name + '!\n');

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
        clientList[i].write(client.name + " says " + message);
      } else {
        cleanup.push(clientList[i]);
        clientList[i].destroy();
      }
    }
  }
  for (i = 0;i < cleanup.length; i += 1) {
    clientList.splice(clientList.indexOf(cleanup[i]), 1);
  }
}

tcpServer.listen(3000);