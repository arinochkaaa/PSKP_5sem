const http = require("http");
const url = require("url");


function factorial(n) {
  if (n < 0) return null;      
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/fact" && req.method === "GET") {
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
  } else {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Маршрут не найден" }));
  }
});

server.listen(5000, () => {
  console.log("Сервер запущен: http://localhost:5000");
});
