import { addWeatherLog, getCityStats, listWeatherLogs } from "./db.js";
import { fetchCurrentWeather } from "./weather.js";

// Print the supported commands and their arguments.
function printUsage() {
  console.log(`Usage:
  node src/cli.js add "<city>"
  node src/cli.js list [--limit N]
  node src/cli.js stats "<city>"`);
}

// Format nullable numeric values for the CLI output.
function formatNumber(value) {
  return value == null ? "N/A" : Number(value).toFixed(1);
}

// Add a live observation for a city to the database.
async function addCity(city) {
  const weather = await fetchCurrentWeather(city);

  if (!weather) {
    console.error(`No matching city found for "${city}".`);
    process.exitCode = 1;
    return;
  }

  addWeatherLog(weather);
  console.log(
    `Saved ${weather.city}, ${weather.country}: ${weather.temperature_c} C, ${weather.condition}.`,
  );
}

// Show recent observations as a formatted table.
function showLogs(args) {
  let limit = 20;

  if (args.length > 0) {
    if (args.length !== 2 || args[0] !== "--limit") {
      throw new Error("Use list [--limit N].");
    }

    limit = Number(args[1]);
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error("The list limit must be a positive whole number.");
    }
  }

  const logs = listWeatherLogs(limit);
  if (logs.length === 0) {
    console.log("No weather logs found.");
    return;
  }

  console.table(logs.map((log) => ({
    City: log.city,
    Country: log.country,
    "Temp C": formatNumber(log.temperature_c),
    "Humidity %": log.humidity ?? "N/A",
    "Wind km/h": formatNumber(log.wind_kmh),
    Condition: log.condition ?? "N/A",
    Recorded: log.created_at,
  })));
}

// Show temperature range, average, and log count for a city.
function showStats(city) {
  const stats = getCityStats(city);

  if (stats.count === 0) {
    console.log(`No weather logs found for "${city}".`);
    return;
  }

  console.log(`Weather stats for ${city}`);
  console.log(`Logs: ${stats.count}`);
  console.log(`Minimum: ${formatNumber(stats.minimum)} C`);
  console.log(`Maximum: ${formatNumber(stats.maximum)} C`);
  console.log(`Average: ${formatNumber(stats.average)} C`);
}

// Dispatch a CLI command and print friendly errors without a stack trace.
async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    if (command === "add" && args.length > 0) {
      await addCity(args.join(" "));
      return;
    }

    if (command === "list") {
      showLogs(args);
      return;
    }

    if (command === "stats" && args.length > 0) {
      showStats(args.join(" "));
      return;
    }

    printUsage();
    process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

await main();