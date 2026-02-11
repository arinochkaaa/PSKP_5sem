const fs = require('fs');
const url = require('url');
const WebSocket = require('ws');

const wsserver = new WebSocket.Server({port: 4000, path: '/wsserver'});
let k = 0;
wsserver.on('connection', (wss) => {
    let duplex = WebSocket.createWebSocketStream(wss, {encoding: 'utf-8'});
        let wfile = fs.createWriteStream(`./upload/file${++k}.txt`);
        duplex.pipe(wfile);
});
wsserver.on('error', (e) => {console.log('ws server error', e)});
console.log(`ws server: host:${wsserver.options.host}, port: ${wsserver.options.port}, path: ${wsserver.options.path}`);
