var net = require('net');
var dgram = require('dgram');
var udpServer = dgram.createSocket('udp4');

var port = 3000;

var onMessage = function(data) {
  var buffer = Date.now() + data;
  socket.write(buffer);
  broadcast(buffer, socket);
};

// TCP server
net.createServer(function(socket) {
  // A client connected to the server
  socket.name = refineIP(socket.remoteAddress) + ':' + socket.remotePort;
  clients.push(socket);

  socket.write('welcome ' + socket.name + '\n');
  broadcast(socket.name + ' joined the chat\n', socket);

  // When the server receives a message from a client
  socket.on('data', function(data) {
    var buffer = Date.now() + data;
    socket.write(buffer);
    broadcast(buffer, socket);
  });

  // When a client disconnect
  socket.on('end', function() {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + ' Left the chat\n');
  });
}).listen(port);


// List of clients
var clients = [];

// Strip ::: from IP String
var refineIP = function(rawIP) {
  var lastColonIndex = rawIP.lastIndexOf(':');
  return rawIP.substring(lastColonIndex + 1);
};

// Broadcast
var broadcast = function(message, sender) {
  clients.forEach(function(client) {
    client.write(message);
  });
  process.stdout.write(message + '\n');
};


// UDP server
udpServer.on('message', function(data) {
  var buffer = Date.now() + data;


  clients.forEach(function(client) {
    udpServer.send(buffer, 0, buffer.length, client.remotePort, client.remoteAddress, function(err, bytes) {
      if (err) console.error(err.message);
    });
  });
});

udpServer.bind(port);

