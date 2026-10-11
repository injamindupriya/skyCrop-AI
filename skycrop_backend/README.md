# SkyCrop AI Backend — Advanced Prototype

Spring Boot REST API for the SkyCrop AI agricultural decision-support prototype.

## Requirements
- JDK 17 or newer (Java 25 is okay for this Java 17-targeted project)
- Apache Maven 3.9+

## Run on Windows PowerShell
From this folder:
```powershell
mvn spring-boot:run
```
If `mvn` is not recognized, install Maven from https://maven.apache.org/download.cgi, extract the Binary ZIP, add its `bin` folder to Windows PATH, and reopen PowerShell.

API base: `http://localhost:8080/api`

## Endpoints
- `GET /health` — service status
- `GET /dashboard` — dashboard overview
- `POST /crop/analyze` — multipart image upload (`image`, optional `crop`); validates file and creates an upload record
- `GET /crop/history` — current server-session upload history
- `GET /crop/health` — sample field-health scores
- `GET /weather?city=Hyderabad` — sample forecast
- `GET /sensors` — simulated sensor readings
- `GET /alerts` and `POST /alerts/{id}/resolve`
- `POST /recommendations` — general crop-care checklist
- `POST /drone/missions` and `GET /drone/missions` — survey planning simulation
- `POST /economics/estimate` — revenue/cost/gross-margin estimate
- `POST /assistant` — rule-based crop-care helper

## Prototype limitations
This is an advanced functional prototype, not a production farm system. Data is held in memory and resets when the backend restarts. Crop uploads are validated but **not diagnosed**: a trained plant-disease model/Python inference service must be integrated. Weather and sensor readings are illustrative demo values. The drone module only simulates mission planning and never controls hardware. The assistant is rule-based, not a general LLM. Add authentication, database persistence, provider credentials, rate limiting, audit logs and field testing before production use.
