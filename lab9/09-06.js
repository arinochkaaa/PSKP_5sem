const http = require('http');
const fs = require('fs');
const path = require('path');

let filePath = path.join(__dirname, 'MyFile.txt');
let fileStream = fs.createReadStream(filePath);

let options = {
    hostname: 'localhost',
    port: 5000,
    path: `/upload`,
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain'
    }
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

fileStream.pipe(req);
