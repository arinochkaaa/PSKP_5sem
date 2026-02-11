const http = require("http");
const readline = require("readline");

let state = "norm"; 
const validStates = ["norm", "stop", "test", "idle"];


const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <html>
        <head>
          <title>Состояние приложения</title>
        </head>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h1>Текущее состояние приложения</h1>
          <h2 style="color: blue;">${state}</h2>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Страница не найдена");
  }
});


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `[${state}] > `
});

rl.prompt();

rl.on("line", (line) => {
  const cmd = line.trim();
  if (cmd === "exit") {
    console.log("Завершение работы приложения...");
    process.exit(0);
  } else if (validStates.includes(cmd)) {
    state = cmd;
  } else {
    console.log(`Некорректный ввод: ${cmd}`);
  }
  rl.setPrompt(`[${state}] > `);
  rl.prompt();
});


server.listen(5000, () => {
  console.log("Сервер запущен: http://localhost:5000");
});
