const { Client } = require('rpc-websockets');

async function main() {
    const ws = new Client('ws://localhost:4000');
    
    ws.on('error', (e) => {
        console.error('WebSocket error:', e);
    });
    
    await new Promise(resolve => ws.on('open', resolve));
    
    try {
      
        console.log('Логинимся...');
        const loginResult = await ws.login({ login: 'smw', password: '777' });
        if (!loginResult) {
            throw new Error('Авторизация не удалась');
        }
        
        console.log('=== Вычисление сложного выражения ===');
        console.log('sum(square(3), square(5,4), mul(3,5,7,9,11,13)) + fib(7) * mul(2,4,6)');
        
        
        const [
            square3,      // square(3)
            square54,     // square(5,4)
            mul35791113,  // mul(3,5,7,9,11,13)
            fib7,         // fib(7)
            mul246        // mul(2,4,6)
        ] = await Promise.all([
            ws.call('square', [3]),
            ws.call('square', [5, 4]),
            ws.call('mul', [3, 5, 7, 9, 11, 13]),
            ws.call('fib', [7]),
            ws.call('mul', [2, 4, 6])
        ]);
        
        console.log('\n--- Промежуточные результаты ---');
        console.log(`square(3) = ${square3}`);
        console.log(`square(5,4) = ${square54}`);
        console.log(`mul(3,5,7,9,11,13) = ${mul35791113}`);
        console.log(`fib(7) = [${fib7}]`);
        console.log(`mul(2,4,6) = ${mul246}`);
        
        const lastFib7 = fib7[6]; 
        
        //  sum(square(3), square(5,4), mul(3,5,7,9,11,13))
        const sumResult = await ws.call('sum', [square3, square54, mul35791113]);
        console.log(`\nsum(square(3), square(5,4), mul(3,5,7,9,11,13)) = ` +
                   `sum(${square3}, ${square54}, ${mul35791113}) = ${sumResult}`);
        
        //fib(7) * mul(2,4,6)
        const fibMulResult = lastFib7 * mul246;
        console.log(`fib(7) * mul(2,4,6) = ${lastFib7} * ${mul246} = ${fibMulResult}`);
        
       
        const finalResult = sumResult + fibMulResult;
        console.log(`\n=== ФИНАЛЬНЫЙ РЕЗУЛЬТАТ ===`);
        console.log(`${sumResult} + ${fibMulResult} = ${finalResult}`);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        ws.close();
    }
}

main();