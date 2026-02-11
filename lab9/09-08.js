const http = require('http');
const fs = require('fs');
const path = require('path');

let filePath = path.join(__dirname, 'NewFile.txt');

let options = {
    hostname: 'localhost',
    port: 5000,
    path: `/download`,
    method: 'GET'
};

let req = http.request(options, res => {
    console.log(`Статус ответа: ${res.statusCode}`);

    let writeStream = fs.createWriteStream(filePath);

    res.pipe(writeStream);

    res.on('end', () => {
        console.log(`Файл успешно получен и сохранён как ${filePath}`);
    });
});

req.on('error', error => {
    console.error(`Ошибка запроса: ${error.message}`);
});

req.end();
