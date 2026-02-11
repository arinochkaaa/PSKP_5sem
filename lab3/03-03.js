const http = require("http");
const url = require("url");


function factorial(n) {
  if (n < 0) return null;
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);


  if (parsedUrl.pathname === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Факториалы через fetch</title>
      </head>
      <body style="font-family: monospace; white-space: pre;">
        <h2>Вычисление факториалов (1..20)</h2>
        <div id="output"></div>
        <script>
          async function run() {
            const output = document.getElementById("output");
            const start = performance.now();
            for (let k = 1; k <= 20; k++) {
              const t = Math.round(performance.now() - start);
              try {
                const resp = await fetch('/fact?k=' + k);
                const data = await resp.json();
                output.innerText += t + '-' + data.k + '/' + data.fact + "\\n";
              } catch (e) {
                output.innerText += t + '-' + k + '/ERROR\\n';
              }
            }
            const total = Math.round(performance.now() - start);
            output.innerText += "\\nОбщее время: " + total + " мс";
          }
          run();
        </script>
      </body>
      </html>
    `);
  }

  else if (parsedUrl.pathname === "/fact" && req.method === "GET") {
    const k = parseInt(parsedUrl.query.k);

    if (isNaN(k)) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Некорректное значение параметра k" }));
      return;
    }

    const fact = factorial(k);
    if (fact === null) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Факториал отрицательных чисел не определён" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ k: k, fact: fact }));
  }

  else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Страница не найдена");
  }
});

server.listen(5000, () => {
  console.log("Сервер запущен: http://localhost:5000");
});
