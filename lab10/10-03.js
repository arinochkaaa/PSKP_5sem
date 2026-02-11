const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 5000, path: '/broadcast'});

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (data) => {
        console.log(`Received message => ${data}`);

        wss.clients.forEach((client) => {
            if(client.readyState == WebSocket.OPEN)
                client.send('server: ' + data);
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (err) => {
        console.log('Client error: ' + e);
    });
});
wss.on('error', (e) => {console.log('ws server error', e)});
console.log(`ws server: host:${wss.options.host}, port: ${wss.options.port}, path: ${wss.options.path}`);
