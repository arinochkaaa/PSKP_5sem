const WebSocket = require('ws');
const fs = require('fs');

let socket = new WebSocket('ws://localhost:4000/wsserver');
socket.onopen = () => {
    let duplex = WebSocket.createWebSocketStream(socket, {encoding: 'utf-8'});
    let rfile = fs.createReadStream(`./MyFile.txt`);
    rfile.pipe(duplex);
};

            
socket.onclose = (e) => {console.log('socket.onclose', e);};
socket.onmessage = (e) => {console.log('socket.onmessage', e.data);};
socket.onerror = function(error) {alert("Ошибка " + error.message);};