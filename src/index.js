const WebSocket = require('ws');
const crypto = require('crypto');
const wss = new WebSocket.Server({ port: 8080 });
var express = require('express');
var app = express();
app.set('port', 1080);
app.use(express.static('html'))
app.listen(app.get('port'));
const { StringDecoder } = require('string_decoder');

setInterval(function(){
    this.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            //Date.now()
            var ab = new ArrayBuffer(9);
            var dv = new DataView(ab);
            dv.setUint8(0, 2);
            dv.setFloat64(1, Date.now());
            client.send(ab, function ack(error) {});
        }
    });
}.bind(wss), 1000)

wss.on('connection', function connection(ws) {
  ws.zss = {
    player: {
      mouse: {x: null, y: null},
      identification: {name: null,realm:null, hash:null},
      state:{},
    }
  };
  ws.zss.timers = [];
  ws.zss.timers.push(
      setInterval(function(){
        let ab = new ArrayBuffer(5);
        let dv = new DataView(ab);
        dv.setUint8(0, 1);
        dv.setUint16(1, this.zss.player.mouse.x);
        dv.setUint16(3, this.zss.player.mouse.y);
        ws.send(ab, function ack(error) {});
      }.bind(ws), 5)
  );

  ws.on('message', function incoming(message) {
    if (typeof message === 'string') {
        console.log("data IS a string!");
    } else {
        let ab = new Uint8Array(message).buffer;
        let dv = new DataView(ab);
        let op = dv.getUint8(0);
        switch(op){
            case 0: {
                //
                let hash = {a:null, b:null};
                hash.a = dv.getUint32(1);
                hash.b = dv.getUint32(1+4)
                if (hash.a + "" + hash.b == ws.zss.player.identification.hash) {
                    let ab0 = new ArrayBuffer(1);
                    let dv0 = new DataView(ab0);
                    dv0.setUint8(0, 4);//request userrname
                    this.send(ab0, function ack(error) {});
                } else {
                    let ab0 = new ArrayBuffer(1);
                    let dv0 = new DataView(ab0);
                    dv0.setUint8(0, 254);//disconnect
                    this.send(ab0, function ack(error) {});
                }
                break;
            }
            case 1:{
                this.zss.player.mouse.x = dv.getUint16(1);
                this.zss.player.mouse.y = dv.getUint16(3);
                break;
            }
            case 2: {
                let ts2 = dv.getFloat64(1);
                let lag2 = Date.now() - ts2;
                let ab2 = new ArrayBuffer(9);
                let dv2 = new DataView(ab2);
                dv2.setUint8(0, 3);
                dv2.setFloat64(1, lag2);
                this.send(ab2, function ack(error) {});
                break;
            }
            case 3:{
                let username3 = new StringDecoder().write(new Uint8Array(ab.slice(1)));
                this.zss.player.identification.username = username3;
                // requestmouse xy updates
                let ab3 = new ArrayBuffer(1);
                let dv3 = new DataView(ab3);
                dv3.setUint8(0, 5);
                this.send(ab3, function ack(error) {});
                break;
            }
        }
    }
  });
  ws.on('close', function close() {
    this.zss.timers.forEach(element => {
        clearInterval(element)
    });
  });
    let ca = crypto.randomBytes(4).readUInt32BE(0, true);
    let cb = crypto.randomBytes(4).readUInt32BE(0, true);
    let ab = new ArrayBuffer(9);
    let dv = new DataView(ab);
    dv.setUint8(0, 0);
    dv.setUint32(1,ca);
    dv.setUint32(1+4,cb);
    ws.send(ab, function ack(error) {});
    ws.zss.player.identification.hash = ca +""+ cb;
});
