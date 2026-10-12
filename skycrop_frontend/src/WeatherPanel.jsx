
import React, { useEffect, useState } from "react";

function WeatherPanel() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWeather() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
      "https://skycrop-ai-2.onrender.com/api/weather"
      );

      if (!response.ok) {
        throw new Error("Unable to load weather information.");
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather();
  }, []);

  return (
    <section className="weather-panel">
      <div className="weather-heading">
        <h2>Weather & Farming Conditions</h2>
        <button type="button" onClick={loadWeather}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading weather information...</p>}

      {error && (
        <p className="weather-error">
          {error}
        </p>
      )}

      {!loading && !error && weather && (
        <div className="weather-content">
          {typeof weather === "object" &&
          !Array.isArray(weather) ? (
            Object.entries(weather).map(([key, value]) => (
              <div className="weather-item" key={key}>
                <span className="weather-label">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/_/g, " ")
                    .replace(/^./, (letter) =>
                      letter.toUpperCase()
                    )}
                </span>

                <strong>
                  {value !== null &&
                  typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value ?? "Not available")}
                </strong>
              </div>
            ))
          ) : (
            <pre>{JSON.stringify(weather, null, 2)}</pre>
          )}
        </div>
      )}

      <p className="weather-note">
        Weather data depends on the information supplied by
        your backend.
      </p>
    </section>
  );
}

export default WeatherPanel;
