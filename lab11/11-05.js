const rpcWSS = require('rpc-websockets').Server;

let server = new rpcWSS({ port: 4000, host: 'localhost' });


server.setAuth((credentials) => {
    return credentials.login === 'smw' && credentials.password === '777';
});


server.register('sum', (params) => {
    return params.reduce((acc, val) => {
        const num = parseFloat(val);
        return !isNaN(num) ? acc + num : acc;
    }, 0);
}).public();

server.register('square', (params) => {
    if (params.length === 1) {
        const r = parseFloat(params[0]);
        if (isNaN(r)) throw new Error('Invalid radius');
        return Math.PI * r * r;
    } 
    else if (params.length === 2) {
        const a = parseFloat(params[0]);
        const b = parseFloat(params[1]);
        if (isNaN(a) || isNaN(b)) throw new Error('Invalid parameters');
        return a * b;
    } 
    else {
        throw new Error('Incorrect number of parameters');
    }
}).public();

server.register('mul', (params) => {
    return params.reduce((acc, val) => {
        const num = parseFloat(val);
        return !isNaN(num) ? acc * num : acc;
    }, 1);
}).public();


server.register('fib', (params) => {
    if (params.length !== 1) throw new Error('Incorrect number of parameters');
    
    const n = parseInt(params[0]);
    if (isNaN(n) || n < 0) throw new Error('Invalid parameter');
    
    const result = [];
    for (let i = 0; i < n; i++) {
        if (i === 0) result.push(0);
        else if (i === 1) result.push(1);
        else result.push(result[i-1] + result[i-2]);
    }
    return result;
}).protected();

server.register('fact', (params) => {
    if (params.length !== 1) throw new Error('Incorrect number of parameters');
    
    const n = parseInt(params[0]);
    if (isNaN(n) || n < 0) throw new Error('Invalid parameter');
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}).protected();


server.on('error', (err) => {
    console.error('Server error:', err);
});

console.log(' RPC сервер запущен на ws://localhost:4000');
console.log('Логин: smw, Пароль: 777');