const WebSocket = require('ws');

const wsserver = new WebSocket.Server({port: 4000, path: '/wsserver'});

let n = 0;

setInterval(() => {
    wsserver.clients.forEach((client) => {
        if(client.readyState == WebSocket.OPEN)
            client.send('11-03-server: ', ++n);
    });
}, 15000);

setInterval(() => {
    let active = 0;
    wsserver.clients.forEach((client) => {
        if(client.readyState == WebSocket.OPEN){
            active++;
            client.ping('server: ping');
        }
    });
    console.log(`Active connections: ${active}`);
}, 5000);

wsserver.on('connection', (wss) => {
    console.log('New client connected')

    wss.on('pong', (data) => {
        console.log('on pong: ', data.toString());
    });

    wss.on('error', (err) => {
        console.log('Client error: ', err.message);
    });

    wss.on('close', () => {
        console.log('Client disconnected');
    });
});
wsserver.on('error', (e) => {console.log('ws server error', e)});
console.log(`ws server: host:${wsserver.options.host}, port: ${wsserver.options.port}, path: ${wsserver.options.path}`);
