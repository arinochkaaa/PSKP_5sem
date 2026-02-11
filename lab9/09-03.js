const http = require('http');

let postData = JSON.stringify({
    x: 5,
    y: 2,
    s: 'example string'
});

let options = {
    hostname: 'localhost',
    port: 5000,
    path: `/process`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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

req.write(postData);
req.end();