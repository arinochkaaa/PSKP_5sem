const http = require('http');

let options = {
    hostname: 'localhost',
    port: 5000,
    path: '/info',
    method: 'GET',
};

let req = http.request(options, res => {
    console.log(`Статус ответа: ${res.statusCode}\n
                Сообщение к статусу: ${res.statusMessage}\n
                IP-адрес сервера: ${res.socket.remoteAddress}\n
                Порт сервера: ${res.socket.remotePort}`);

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(`Данные в теле ответа: \n${body}`);
    });
});

req.on('error', error => {
    console.error(`Ошибка запроса: ${error.message}`);
});

req.end();