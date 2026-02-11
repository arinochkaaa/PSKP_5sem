const http = require('http');
const xml2js = require('xml2js');

let postData = `<request id="28">
                    <x value="1"/>
                    <x value="2"/>
                    <m value="a"/>
                    <m value="b"/>
                    <m value="c"/>
                </request>`;

let options = {
    hostname: 'localhost',
    port: 5000,
    path: `/xml`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(postData)
    }
};

let req = http.request(options, res => {
    console.log(`Статус ответа: ${res.statusCode}`);

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error('Ошибка при разборе XML-ответа:', err.message);
            } 
            else {
                let response = result.response;
                console.log('Ответ от сервера:');
                console.log(`Сумма чисел x: ${response.sum.$.result}\n
                            Конкатенация m: ${response.concat.$.result}`);
            }
        });
    });
});

req.on('error', error => {
    console.error(`Ошибка запроса: ${error.message}`);
});

req.write(postData);
req.end();