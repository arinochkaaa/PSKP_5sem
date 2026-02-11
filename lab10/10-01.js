const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');


const httpServer = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, '10-01.html'), 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Ошибка загрузки страницы');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
    }
});

httpServer.listen(3000, () => {
    console.log('HTTP Server running at http://localhost:3000/');
});


const wss = new WebSocket.Server({ port: 4000 });
let clientCounter = 0;

wss.on('connection', (ws) => {
    const clientId = ++clientCounter;
    console.log(`✅ Клиент ${clientId} подключился`);
    
    let lastN = 0;
    let serverK = 0;
    

    ws.on('message', (message) => {
        const msg = message.toString();
        console.log(`📥 Получено от клиента ${clientId}: ${msg}`);
        
     
        const match = msg.match(/10-01-client:\s*(\d+)/);
        if (match) {
            const n = parseInt(match[1]);
            if (!isNaN(n)) {
                lastN = n;
            }
        }
    });


    const serverInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const message = `10-01-server: ${lastN}->${++serverK}`;
            ws.send(message);
            console.log(`📤 Отправлено клиенту ${clientId}: ${message}`);
        }
    }, 5000);

   
    ws.on('close', () => {
        console.log(`❌ Клиент ${clientId} отключился`);
        clearInterval(serverInterval);
    });

    ws.on('error', (error) => {
        console.error(`⚠️ Ошибка у клиента ${clientId}:`, error);
        clearInterval(serverInterval);
    });
});

console.log('WebSocket Server running at ws://localhost:4000/');