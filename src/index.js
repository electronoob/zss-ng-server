const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
var express = require('express');
var app = express();
app.set('port', 1080);
app.use(express.static('html'))
app.listen(app.get('port'));

wss.on('connection', function connection(ws) {
  ws.zss = {
    player: {
      mouse: {x: null, y: null},
      identification: {name: null, hash: null,realm:null},
    }
  };
  ws.zss.timers = [];
  ws.zss.timers.push(
      setInterval(function(){
        let b = new ArrayBuffer(5);
        let dv = new DataView(b);
        dv.setUint8(0, 1);
        dv.setUint16(1, this.zss.player.mouse.x);
        dv.setUint16(3, this.zss.player.mouse.y);
        socket.send(b);
      }, 10).bind(this)
  );
  ws.on('message', function incoming(message) {
    if (typeof message === 'string') {
        console.log("data IS a string!");
    } else {
        let ab = new Uint8Array(message).buffer;
        let dv = new DataView(ab);
        let op = dv.getUint8(0);
        switch(op){
            case 1:
                console.log("mouse ", dv.getUint16(1), dv.getUint16(3));
                this.zss.player.mouse.x = dv.getUint16(1);
                this.zss.player.mouse.x = dv.getUint16(3);
                break;
        }
    }
  });
  ws.send('something');
});
