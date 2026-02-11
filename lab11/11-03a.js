const WebSocket = require('ws');
const fs = require('fs');

let socket = new WebSocket('ws://localhost:4000/wsserver');

socket.on('open', () => {
    console.log('socket.onopen');
});

socket.on('message', (data) => {
    console.log('socket.onmessage', data.toString());
});

socket.on('ping', (data) => {
    console.log('on ping: ', data.toString());
});

socket.on('close', () => {
    console.log('socket.onclose', data.toString());
});

socket.on('error', (err) => {
    console.log('socket.error', err.message);
});
            