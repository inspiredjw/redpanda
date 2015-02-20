var net = require('net');


// TCP server
net.createServer(function(socket) {
  // A client connected to the server
  socket.name = refineIP(socket.remoteAddress) + ':' + socket.remotePort;
  clients.push(socket);

  socket.write('welcome ' + socket.name + '\n');
  broadcast(socket.name + ' joined the chat\n', socket);

  // When the server receives a message from a client
  socket.on('data', function (data) {
    socket.write("Received: " + data + " at " + Date.now().toString());
    broadcast(Date.now() + data, socket);
  });

  // When a client disconnect
  socket.on('end', function() {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + ' Left the chat\n');
  });
}).listen(3000);


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
    if (client !== sender) {
      client.write(message);
    }
  });
  process.stdout.write(message);
};
