const WebSocket = require('ws');

let prfx = process.argv[2] || 'A'; 
console.log('Client prefix = ' + prfx);

const ws = new WebSocket('ws://localhost:5000/broadcast');

ws.on('open', () => {
    console.log('socket onopen');

    let k = 0;

    let interval = setInterval(() => {
        if(ws.readyState == WebSocket.OPEN)
            ws.send(`client: ${prfx}-${++k}`);
    }, 1000);

    ws.on('message', message => {
        console.log(`Received message => ${message}`);
    });

    setTimeout(() => {
        clearInterval(interval);
        ws.close();
    }, 25000);
});

ws.on('close', () => {
    console.log('socket closed');
});

ws.on('error', (err) => {
    console.error('WebSocket error: ', err.message);
});