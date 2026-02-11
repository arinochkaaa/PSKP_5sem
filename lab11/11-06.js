const rpcWSS = require('rpc-websockets').Server;

let k = 0;

let server = new rpcWSS({port: 4000, host: 'localhost'});

server.event('A');
server.event('B');
server.event('C');

console.log('Введите A, В или С для генерации события: ');

process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk) => {
    let input = chunk.trim().toUpperCase();
    switch (input){
        case 'A':
            server.emit('A', {n: ++k, x: 1, y: 2});
            break;
        case 'B':
            server.emit('B', {n: ++k, s: 'Event B', d: new Date().toTimeString()});
            break;
        case 'C':
           server.emit('C', {n: ++k});
           break;
        default:
            console.log('Неверный ввод.'); 
    }
});
