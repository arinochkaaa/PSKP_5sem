const WebSocket = require('ws');

function createWebSocketClient(clientId = 1) {
    let messageCount = 0;
    let intervalId = null;
    
    console.log(`\n=== Клиент 10-02 #${clientId} запущен ===`);
    
    const socket = new WebSocket('ws://localhost:4000');
    
    socket.on('open', () => {
        console.log(`[10-02 #${clientId}]  Соединение установлено`);
        
     
        intervalId = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                const message = `10-01-client: ${++messageCount}`;
                socket.send(message);
                console.log(`[10-02 #${clientId}]  Отправлено: ${message}`);
            }
        }, 3000);
        
    
        setTimeout(() => {
            console.log(`[10-02 #${clientId}]  Автоматическая остановка через 25 секунд`);
            socket.close(1000, 'Завершено по таймеру');
        }, 25000);
    });
    
    socket.on('message', (data) => {
        console.log(`[10-02 #${clientId}]  Получено: ${data}`);
    });
    
    socket.on('close', (code, reason) => {
        console.log(`[10-02 #${clientId}]  Закрыто (код: ${code})`);
        if (intervalId) clearInterval(intervalId);
    });
    
    socket.on('error', (error) => {
        console.error(`[10-02 #${clientId}]  Ошибка: ${error.message}`);
        if (intervalId) clearInterval(intervalId);
    });
    
    return socket;
}


if (require.main === module) {
    const clientCount = process.argv[2] ? parseInt(process.argv[2]) : 1;
    
 
    for (let i = 1; i <= clientCount; i++) {
        setTimeout(() => createWebSocketClient(i), 1000 * (i - 1));
    }
}

module.exports = { createWebSocketClient };