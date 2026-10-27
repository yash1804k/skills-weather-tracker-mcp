# Open-Meteo API Notes

## Geocoding

Endpoint: `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1`

The Fetch MCP response for `Pune` contained the following fields used by the tracker:

- `results[0].name`: city name
- `results[0].country`: country name
- `results[0].latitude`: latitude for the weather request
- `results[0].longitude`: longitude for the weather request

Trimmed response captured from the API:

```json
{
  "results": [
    {
      "name": "Pune",
      "latitude": 18.51957,
      "longitude": 73.85535,
      "country": "India"
    }
  ]
}
```

## Current Weather

Endpoint: `https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`

Fields requested and intended for the database:

- `current.temperature_2m` -> `temperature_c`
- `current.relative_humidity_2m` -> `humidity`
- `current.wind_speed_10m` -> `wind_kmh`
- `current.weather_code` -> `weather_code` and the input to the readable `condition`

The Fetch MCP tool refused this endpoint because its robots policy disallows fetching `api.open-meteo.com`. No current-weather JSON response was captured, so this note does not invent an example payload. The Pune database row contains the real geocoding fields; weather fields are `NULL` until a weather response can be retrieved.