# SkyCrop AI Frontend — Advanced Prototype

React + Vite dashboard for crop monitoring and agricultural decision support.

## Requirements
- Node.js 18+
- npm
- SkyCrop AI backend running on port 8080 (optional; UI can still open offline)

## Run on Windows
Open PowerShell in this folder:
```powershell
npm install
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

Set `VITE_API_URL` in `.env` if your backend uses a different API URL. `.env.example` shows the default.

## Included modules
Dashboard, crop image upload, upload history, sample field-health scorecards, weather planning panel, alerts with resolve action, simulated sensor telemetry, drone survey planning simulation, farm economics calculator, rule-based crop-care assistant and connection settings.

## Important limitations
The UI clearly labels simulated values. The backend records uploads but does not perform plant disease classification; no trained ML model is included. Weather is sample data, sensors are simulated, drone missions do not control a real drone, and the assistant is rule-based. Backend records reset on restart. These integrations require real provider/model/hardware configuration and validation.
