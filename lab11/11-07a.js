const rpcWSC = WebSocket = require('rpc-websockets').Client;

let ws = new rpcWSC('ws://localhost:4000');

let k = 0;
ws.on('open', () => {
    console.log('Введите A, В или С для отправки уведомления: ');
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
    let input = chunk.trim().toUpperCase();
    switch (input){
        case 'A':
            ws.notify('A', {n: ++k, s: 'notify A'});
            break;
        case 'B':
            ws.notify('B', {n: ++k, s: 'notify B'});
            break;
        case 'C':
            ws.notify('C', {n: ++k, s: 'notify C'});
           break;
        default:
            console.log('Неверный ввод.'); 
    }
});
})