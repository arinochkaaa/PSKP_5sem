const http = require('http');

let x = process.argv[2] || 7;
let y = process.argv[3] || 3;

let options = {
    hostname: 'localhost',
    port: 5000,
    path: `/calc?x=${x}&y=${y}`,
    method: 'GET',
};

let req = http.request(options, res => {
    console.log(`Статус ответа: ${res.statusCode}`);

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