const { Client } = require('rpc-websockets');

async function main() {
    const ws = new Client('ws://localhost:4000');
    
    ws.on('error', (e) => {
        console.error('WebSocket error:', e);
    });
    
    await new Promise(resolve => ws.on('open', resolve));
    
    try {
        // Public методы
        console.log('=== Public методы ===');
        
        const square1 = await ws.call('square', [3]);
        console.log(`square(3) = ${square1}`);
        
        const square2 = await ws.call('square', [5, 4]);
        console.log(`square(5, 4) = ${square2}`);
        
        const sum1 = await ws.call('sum', [2]);
        console.log(`sum(2) = ${sum1}`);
        
        const sum2 = await ws.call('sum', [2, 4, 6, 8, 10]);
        console.log(`sum(2, 4, 6, 8, 10) = ${sum2}`);
        
        const mul1 = await ws.call('mul', [3]);
        console.log(`mul(3) = ${mul1}`);
        
        const mul2 = await ws.call('mul', [3, 5, 7, 9, 11, 13]);
        console.log(`mul(3, 5, 7, 9, 11, 13) = ${mul2}`);
        
        // Protected методы - нужна авторизация
        console.log('\n=== Protected методы (требуют авторизации) ===');
        
        const loginResult = await ws.login({ login: 'smw', password: '777' });
        if (!loginResult) {
            throw new Error('Авторизация не удалась');
        }
        
        const fib1 = await ws.call('fib', [1]);
        console.log(`fib(1) = [${fib1}]`);
        
        const fib2 = await ws.call('fib', [2]);
        console.log(`fib(2) = [${fib2}]`);
        
        const fib7 = await ws.call('fib', [7]);
        console.log(`fib(7) = [${fib7}]`);
        
        const fact0 = await ws.call('fact', [0]);
        console.log(`fact(0) = ${fact0}`);
        
        const fact5 = await ws.call('fact', [5]);
        console.log(`fact(5) = ${fact5}`);
        
        const fact10 = await ws.call('fact', [10]);
        console.log(`fact(10) = ${fact10}`);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        ws.close();
    }
}

main();