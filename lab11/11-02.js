const fs = require('fs');
const WebSocket = require('ws');

const wsserver = new WebSocket.Server({port: 4000, path: '/wsserver'});
wsserver.on('connection', (wss) => {
    let duplex = WebSocket.createWebSocketStream(wss, {encoding: 'utf-8'});
        let rfile = fs.createReadStream(`./download/MyFile.txt`);
        rfile.pipe(duplex);
});
wsserver.on('error', (e) => {console.log('ws server error', e)});
console.log(`ws server: host:${wsserver.options.host}, port: ${wsserver.options.port}, path: ${wsserver.options.path}`);
