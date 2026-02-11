const rpcWSC = WebSocket = require('rpc-websockets').Client;

let ws = new rpcWSC('ws://localhost:4000');

ws.on('open', () => {
    ws.subscribe('FileChanged');

    ws.on('FileChanged', (p) => console.log(`Уведомление от сервера: `, p));
});