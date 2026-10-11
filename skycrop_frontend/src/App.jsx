
import React from "react";
import CropAnalyzer from "./CropAnalyzer";
import CropHistory from "./CropHistory";
import WeatherPanel from "./WeatherPanel";
import FarmDashboard from "./FarmDashboard";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>SkyCrop AI</h1>
        <p>
          Smart Agriculture Monitoring and Crop Analysis
        </p>
      </header>

      <main className="app-main">
        <section className="crop-analysis-section">
          <CropAnalyzer />
        </section>

        <section className="crop-history-section">
          <CropHistory />
        </section>

        <section className="weather-section">
          <WeatherPanel />
        </section>

        <FarmDashboard />
      </main>

      <footer className="app-footer">
        <p>SkyCrop AI | Smart Farming Technology</p>
        <small>
          AI predictions, live sensor readings, and drone
          operations require the appropriate real integrations.
        </small>
      </footer>
    </div>
  );
}

export default App;
