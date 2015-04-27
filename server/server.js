var net = require('net');
var dgram = require('dgram');

var tcpServer = net.createServer(),
    udpServer = dgram.createSocket('udp4'),
    clientList = [];

var history = {};

var globalStamp = 0;

tcpServer.on('connection', function(client) {
  client.name = client.remoteAddress + ':' + client.remotePort;

  clientList.push(client);

  client.on('data', function(data) {
    parseClientMessage(data, broadcastTCP, client);
  });

  client.on('end', function() {
    delete history[client.userId];
    clientList.splice(clientList.indexOf(client), 1);
  });
});

function broadcastTCP(message, client) {
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
  for (i = 0; i < cleanup.length; i += 1) {
    clientList.splice(clientList.indexOf(cleanup[i]), 1);
  }
}

function broadcastUDP(message) {
  var buffer = message;

  for (var i = 0; i < clientList.length; i++) {
    udpServer.send(buffer, 0, buffer.length, 3001, clientList[i].name.split()[0]);
  }
}

function _makeSureToHaveHistory(userId) {
  // if no history, create one
  if (history[userId]) {}
  else {
    history[userId] = {
      seq: 0,
      latest: 0,
      unreceived: {}
    };
  }
}

function parseClientMessage(data, func, client) {
  data = data.toString();
  var parts = data.split(':');

  // need to be form of "userId:logicalStamp:message"
  if (parts.length < 3)
    return console.log('invalid form of message!');

  var userId = parts[0];
  var stamp = parts[1];
  var message = data.substring(data.indexOf(stamp) + stamp.length + 1);

  stamp = parseInt(stamp);

  _makeSureToHaveHistory(userId);

  // if client param given (TCP Only)
  if (client)
    client.userId = userId;

  // normal case
  if (history[userId].seq == history[userId].latest && history[userId].seq + 1 == stamp) {
    history[userId].seq++;
    history[userId].latest++;
  }
  // late Message Case
  else if (history[userId].unreceived[stamp]) {
    delete history[userId].unreceived[stamp];
    if (history[userId].seq + 1 == stamp)
      history[userId].seq++;
  }
  // jumping stamp message case
  else if (history[userId].seq + 1 < stamp && history[userId].latest != stamp && (history[userId].latest < stamp || history[userId].unreceived[stamp])) {
    var oldLatest = history[userId].latest,
        newLatest = stamp;

    // record missing messages
    for (var i = parseInt(oldLatest) + 1; i < parseInt(newLatest); i++)
      history[userId].unreceived[i] = true;

    // set new latest
    if (history[userId].latest < newLatest)
      history[userId].latest = newLatest;

    if (history[userId].seq + 1 == stamp)
      history[userId].seq++;
  }
  // already sent
  else {
    console.log('already sent');
    return;
  }

  // broadcast buffer with globalStamp
  globalStamp++;
  var buffer = globalStamp + ':' + message;
  func(buffer, client);
}

tcpServer.listen(3000);

udpServer.on('message', function(message, remote) {
  parseClientMessage(message, broadcastUDP);
});

udpServer.bind(3001);

/*
i:1:1111
1:1111
i:3:2222
2:2222
i:2:2222
3:2222
i:5:sdfdsf
4:sdfdsf
i:4:dsfdsfsf
(한번 미싱 해주고.. 복구하고 두번째 미싱 했을때부터는 그냥 이미 보낸거로 되는 문제가 있음;;)
이거 해결좀...
*/


