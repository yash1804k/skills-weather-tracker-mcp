import http from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { addWeatherLog, getWeatherSummary, listWeatherLogs } from "./db.js";
import { fetchCurrentWeather } from "./weather.js";

const port = 3000;
const publicDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../public");

// Send a JSON response with consistent headers.
function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

// Serve the dashboard or return a JSON-friendly not-found response.
async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  try {
    if (request.method === "GET" && url.pathname === "/api/logs") {
      sendJson(response, 200, listWeatherLogs(50));
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/summary") {
      sendJson(response, 200, getWeatherSummary());
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/refresh") {
      const city = url.searchParams.get("city")?.trim();
      if (!city) {
        sendJson(response, 400, { error: "A city name is required." });
        return;
      }

      const weather = await fetchCurrentWeather(city);
      if (!weather) {
        sendJson(response, 404, { error: `No matching city found for "${city}".` });
        return;
      }

      addWeatherLog(weather);
      sendJson(response, 201, weather);
      return;
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      const html = await readFile(resolve(publicDirectory, "index.html"));
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(html);
      return;
    }

    sendJson(response, 404, { error: "Not found." });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "The server encountered an error." });
  }
}

const server = http.createServer((request, response) => {
  handleRequest(request, response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Weather dashboard running at http://localhost:${port}`);
});
