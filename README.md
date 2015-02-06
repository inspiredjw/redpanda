# Red Panda

<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/5/50/RedPandaFullBody.JPG/440px-RedPandaFullBody.JPG" style="width: 300px">

Send data through UDP first and then correct them with TCP for low latency

## TODOs

###Send (From Client)

- Socket Id
- Target Room Name
- Data
- Timestamp

###Client (Should Keep)

- Own Socket Id
- Array of Joined Room Names
- Snapshot
- Temp data

###Need Features (Client)

Methods
- Connect to server
- Disconnect
- Send
  - Hash of Data
- Join Room
- Reconnect
- Data Compression

Events

- On Data
  - Comparing Hash of Data
- On Disconnect
  - call `reconnect(socketId)`
- On Error

