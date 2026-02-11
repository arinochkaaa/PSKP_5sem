const { Client } = require('rpc-websockets');

async function main() {
    const ws = new Client('ws://localhost:4000');
    
    ws.on('error', (e) => {
        console.error('WebSocket error:', e);
    });
    
    await new Promise(resolve => ws.on('open', resolve));
    
    try {
        // Сначала логинимся один раз для всех protected методов
        console.log('Логинимся...');
        const loginResult = await ws.login({ login: 'smw', password: '777' });
        if (!loginResult) {
            throw new Error('Авторизация не удалась');
        }
        
        console.log('=== Параллельные вызовы ===');
        
        // Выполняем ВСЕ вызовы параллельно
        const [
            square3, square54,
            sum2, sum246810,
            mul3, mul35791113,
            fib1, fib2, fib7,
            fact0, fact5, fact10
        ] = await Promise.all([
            // Public методы
            ws.call('square', [3]),
            ws.call('square', [5, 4]),
            ws.call('sum', [2]),
            ws.call('sum', [2, 4, 6, 8, 10]),
            ws.call('mul', [3]),
            ws.call('mul', [3, 5, 7, 9, 11, 13]),
            
            // Protected методы (уже залогинены)
            ws.call('fib', [1]),
            ws.call('fib', [2]),
            ws.call('fib', [7]),
            ws.call('fact', [0]),
            ws.call('fact', [5]),
            ws.call('fact', [10])
        ]);
        
        console.log('\n--- Результаты ---');
        console.log(`square(3) = ${square3}`);
        console.log(`square(5, 4) = ${square54}`);
        console.log(`sum(2) = ${sum2}`);
        console.log(`sum(2, 4, 6, 8, 10) = ${sum246810}`);
        console.log(`mul(3) = ${mul3}`);
        console.log(`mul(3, 5, 7, 9, 11, 13) = ${mul35791113}`);
        console.log(`fib(1) = [${fib1}]`);
        console.log(`fib(2) = [${fib2}]`);
        console.log(`fib(7) = [${fib7}]`);
        console.log(`fact(0) = ${fact0}`);
        console.log(`fact(5) = ${fact5}`);
        console.log(`fact(10) = ${fact10}`);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        ws.close();
    }
}

main();