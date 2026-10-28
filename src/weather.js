const geocodingEndpoint = "https://geocoding-api.open-meteo.com/v1/search";
const forecastEndpoint = "https://api.open-meteo.com/v1/forecast";

const weatherConditions = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with light hail",
  99: "Thunderstorm with heavy hail",
};

// Fetch JSON and convert network or HTTP failures into readable errors.
async function requestJson(url, serviceName) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(`Could not connect to ${serviceName}. Check your network connection.`);
  }

  if (!response.ok) {
    throw new Error(`${serviceName} returned HTTP ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`${serviceName} returned invalid JSON.`);
  }
}

// Convert a WMO weather code into a short readable condition.
export function conditionFromCode(weatherCode) {
  return weatherConditions[weatherCode] ?? "Unknown";
}

// Resolve a city and return its current Open-Meteo observation.
export async function fetchCurrentWeather(city) {
  const geocodingUrl = new URL(geocodingEndpoint);
  geocodingUrl.search = new URLSearchParams({ name: city, count: "1" });
  const geocodingData = await requestJson(geocodingUrl, "Open-Meteo geocoding");
  const location = geocodingData.results?.[0];

  if (!location) {
    return null;
  }

  const forecastUrl = new URL(forecastEndpoint);
  forecastUrl.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
  });
  const forecastData = await requestJson(forecastUrl, "Open-Meteo current weather");
  const current = forecastData.current;

  if (!current) {
    throw new Error("Open-Meteo did not return current weather for that city.");
  }

  return {
    city: location.name,
    country: location.country ?? null,
    latitude: location.latitude,
    longitude: location.longitude,
    temperature_c: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    wind_kmh: current.wind_speed_10m,
    condition: conditionFromCode(current.weather_code),
    weather_code: current.weather_code,
  };
}