# Weather Dashboard Verification

Verified the SQLite `weather_logs` table on 2026-10-28.

## City summary

| City | Row count | Average temperature (°C) |
|---|---:|---:|
| London | 1 | 15.8 |
| Mumbai | 1 | 35.0 |
| Pune | 1 | N/A |

## Findings

- **CLI rows:** London (ID 2, timestamp `2026-10-27 14:37:42`) and Pune (ID 1, timestamp `2026-10-27 14:32:16`) are present. Pune's sample weather fields are null, which is consistent with an incomplete CLI-added row.
- **Web UI row:** Mumbai (ID 3, timestamp `2026-10-28 08:41:56`) is present and was added through `POST /api/refresh` by the dashboard.
- **Null anomaly:** Pune has null temperature, humidity, wind, and condition values, so its average temperature is not available.
- **Duplicate timestamps:** No duplicate `(city, created_at)` pairs were found.
