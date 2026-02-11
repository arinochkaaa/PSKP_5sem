const WebSocket = require('ws');

const wsserver = new WebSocket.Server({port: 4000});
let clientCounters = new Map(); 

wsserver.on('connection', (wss) => {
    console.log(' Новый клиент подключился');
    
    wss.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            const clientName = message.client;
            
           
            if (!clientCounters.has(clientName)) {
                clientCounters.set(clientName, 0);
            }
            
            const n = clientCounters.get(clientName) + 1;
            clientCounters.set(clientName, n);
            
            const response = {
                server: n,
                client: clientName,
                timestamp: new Date().toISOString()
            };
            
            console.log(` Получено от ${clientName}:`, message);
            console.log(` Отправлено ${clientName}:`, response);
            
            wss.send(JSON.stringify(response));
            
        } catch (err) {
            console.error(' Ошибка обработки сообщения:', err);
        }
    });
    
    wss.on('close', () => {
        console.log(' Клиент отключился');
    });
    
    wss.on('error', (err) => {
        console.error(' Ошибка WebSocket:', err);
    });
});

console.log(' Сервер запущен на ws://localhost:4000');