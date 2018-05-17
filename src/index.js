const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
var express = require('express');
var app = express();
app.set('port', 1080);
app.use(express.static('html'))
app.listen(app.get('port'));

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});
