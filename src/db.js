import Database from "better-sqlite3";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const databasePath = process.env.WEATHER_DB_PATH
  ?? resolve(dirname(fileURLToPath(import.meta.url)), "../weather.db");
const database = new Database(databasePath);

const insertWeatherLog = database.prepare(`
  INSERT INTO weather_logs (
    city, country, latitude, longitude, temperature_c, humidity,
    wind_kmh, condition, weather_code
  ) VALUES (
    @city, @country, @latitude, @longitude, @temperature_c, @humidity,
    @wind_kmh, @condition, @weather_code
  )
`);

const selectRecentLogs = database.prepare(`
  SELECT city, country, temperature_c, humidity, wind_kmh, condition,
         weather_code, created_at
  FROM weather_logs
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`);

const selectCityStats = database.prepare(`
  SELECT COUNT(*) AS count,
         MIN(temperature_c) AS minimum,
         MAX(temperature_c) AS maximum,
         AVG(temperature_c) AS average
  FROM weather_logs
  WHERE city = ? COLLATE NOCASE
`);

// Ensure the CLI is connected to the database prepared by the MCP exercise.
function requireWeatherLogsTable() {
  const table = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = ? AND name = ?",
  ).get("table", "weather_logs");

  if (!table) {
    throw new Error("Table weather_logs was not found in weather.db. Complete the database setup first.");
  }
}

// Insert a city observation using a prepared statement.
export function addWeatherLog(weather) {
  requireWeatherLogsTable();
  return insertWeatherLog.run(weather);
}

// Return the newest observations, limited by the caller.
export function listWeatherLogs(limit) {
  requireWeatherLogsTable();
  return selectRecentLogs.all(limit);
}

// Aggregate temperatures and count all observations for a city.
export function getCityStats(city) {
  requireWeatherLogsTable();
  return selectCityStats.get(city);
}