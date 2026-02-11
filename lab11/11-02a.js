const WebSocket = require('ws');
const fs = require('fs');

let socket = new WebSocket('ws://localhost:4000/wsserver');
let k = 0;
socket.onopen = () => {
    let duplex = WebSocket.createWebSocketStream(socket, {encoding: 'utf-8'});
    let wfile = fs.createWriteStream(`./upload/MyFile${++k}.txt`);
    duplex.pipe(wfile);
};

            
socket.onclose = (e) => {console.log('socket.onclose', e);};
socket.onmessage = (e) => {console.log('socket.onmessage', e.data);};
socket.onerror = function(error) {alert("Ошибка " + error.message);};