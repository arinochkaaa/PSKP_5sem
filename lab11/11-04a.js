const WebSocket = require('ws');


const clientName = process.argv[2] || 'Anonymous';
console.log(` Клиент "${clientName}" запущен`);


const socket = new WebSocket('ws://localhost:4000');

socket.on('open', () => {
    console.log(` Подключение к серверу установлено`);
    
   
    let messageCount = 0;
    const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
            const message = {
                client: clientName,
                timestamp: new Date().toISOString(),
                messageId: ++messageCount
            };
            
            socket.send(JSON.stringify(message));
            console.log(` Отправлено сообщение ${messageCount}:`, message);
        }
    }, 3000);
    
  
    setTimeout(() => {
        clearInterval(interval);
        socket.close();
        console.log(' Клиент завершает работу');
    }, 30000);
    

    socket.on('message', (data) => {
        try {
            const response = JSON.parse(data);
            console.log(` Получен ответ от сервера:`, response);
        } catch (err) {
            console.error(' Ошибка парсинга ответа:', err);
        }
    });
});

socket.on('close', () => {
    console.log(' Соединение закрыто');
});

socket.on('error', (error) => {
    console.error(' Ошибка WebSocket:', error.message);
});