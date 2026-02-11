const http = require('http');
const readline = require('readline');
const path = require('path');
const StaticFileHandler = require('./m07-01');

const PORT = process.env.PORT || '5000';
const STATIC_DIR = process.env.STATIC_DIR || 'static';

let currentState = 'norm';
let shutdownTimer = null;
let server = null;

const staticFileHandler = new StaticFileHandler();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showPrompt() {
    rl.setPrompt(`${currentState}-> `);
    rl.prompt();
}

function handleUserInput(input) {
    const command = input.trim().toLowerCase();
    const parts = command.split(' ');
    const cmd = parts[0];
    const param = parts[1];
    
    const validStates = ['norm', 'stop', 'exit'];
    
    if (cmd === 'sd' && currentState !== 'stop') {
        handleShutdownCommand(param);
    } else if (validStates.includes(cmd)) {
        handleStateChange(cmd);
    } else if (cmd) {
        console.log(`Неизвестная команда: ${cmd}`);
    }
    
    if (currentState !== 'stop') {
        showPrompt();
    }
}

function handleShutdownCommand(param) {
    if (shutdownTimer) {
        clearTimeout(shutdownTimer);
        shutdownTimer = null;
        console.log('Предыдущая команда остановки отменена');
        return;
    }
    
    if (!param) {
        console.log('Остановка сервера отменена');
        return;
    }
    
    const seconds = parseInt(param);
    if (isNaN(seconds) || seconds <= 0) {
        console.log('Неверный параметр для sd. Используйте: sd <секунды>');
        return;
    }
    
    console.log(`Сервер будет остановлен через ${seconds} секунд`);
    shutdownTimer = setTimeout(shutdownServer, seconds * 1000);
    
    if (shutdownTimer.unref) {
        shutdownTimer.unref();
    }
}

function handleStateChange(state) {
    switch (state) {
        case 'exit':
            console.log('Завершение приложения...');
            shutdownServer();
            break;
        case 'stop':
            console.log('Остановка сервера...');
            currentState = state;
            if (server) {
                server.close(() => {
                    console.log('Сервер остановлен. Для выхода введите "exit"');
                    showPrompt();
                });
            }
            break;
        default:
            console.log(`reg = ${currentState}--> ${state}`);
            currentState = state;
    }
}

function shutdownServer() {
    console.log('Завершение работы сервера...');
    
    if (shutdownTimer) {
        clearTimeout(shutdownTimer);
        shutdownTimer = null;
    }
    
    staticFileHandler.destroy();
    rl.close();
    
    if (server) {
        server.close(() => {
            console.log('Сервер успешно остановлен');
            process.exit(0);
        });
        
        setTimeout(() => {
            console.log('Принудительное завершение...');
            process.exit(1);
        }, 5000);
    } else {
        process.exit(0);
    }
}

process.on('uncaughtException', (error) => {
    console.error('Необработанное исключение:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанный промис:', reason);
});

async function handleRequest(request, response) {
    if (currentState === 'stop') {
        response.writeHead(503, {
            'Content-Type': 'text/plain; charset=utf-8'
        });
        response.end('Service Unavailable - Server is in stop state');
        return;
    }

    console.log(`${new Date().toLocaleTimeString()} - ${request.method} ${request.url}`);

    if (request.method !== 'GET') {
        response.writeHead(405, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Allow': 'GET'
        });
        response.end('Method Not Allowed');
        return;
    }

    try {
        const handled = await staticFileHandler.handleStaticRequest(request, response, STATIC_DIR);
        
        if (!handled) {
            response.writeHead(404, {
                'Content-Type': 'text/plain; charset=utf-8'
            });
            response.end('404 - Not Found');
        }
    } catch (error) {
        console.error('Ошибка обработки запроса:', error);
        response.writeHead(500, {
            'Content-Type': 'text/plain; charset=utf-8'
        });
        response.end('Internal Server Error');
    }
}

function startServer() {
    server = http.createServer(handleRequest);
    
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Порт ${PORT} уже занят. Попробуйте другой порт.`);
            process.exit(1);
        } else {
            console.error('Ошибка сервера:', error);
        }
    });
    
    server.listen(PORT, function() {
        console.log('=== Server 07-01 ===');
        console.log('URL: http://localhost:' + PORT + '/');
        console.log('Static files:', STATIC_DIR);
        console.log('PID:', process.pid);
        console.log('\nКоманды управления:');
        console.log('  sd <секунды> - остановить сервер через указанное время');
        console.log('  norm/stop/exit - смена состояния сервера');
        console.log('\nТекущее состояние:', currentState);
        console.log('Введите команду:');
        
        showPrompt();
    });
    
    rl.on('line', handleUserInput);
    rl.on('close', shutdownServer);
}

startServer();