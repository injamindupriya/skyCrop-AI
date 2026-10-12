
import React, { useEffect, useState } from "react";

const API = "https://skycrop-ai-2.onrender.com/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Invalid server response" };
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    );
  }

  return data;
}

function Panel({ title, children }) {
  return (
    <section className="farm-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ErrorMessage({ message }) {
  return message ? (
    <p className="farm-error" role="alert">
      {message}
    </p>
  ) : null;
}

function JsonData({ data }) {
  if (data == null) return <p>No data available.</p>;

  return (
    <pre
      style={{
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontSize: "13px",
        background: "#f5f7f5",
        padding: "12px",
        borderRadius: "8px",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function FarmDashboard() {
  const [sensors, setSensors] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [economics, setEconomics] = useState(null);
  const [missions, setMissions] = useState([]);
  const [assistantAnswer, setAssistantAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [crop, setCrop] = useState("Tomato");

  // Economics inputs
  const [area, setArea] = useState("1");
  const [expectedYield, setExpectedYield] = useState("1000");
  const [marketPrice, setMarketPrice] = useState("20");
  const [inputCost, setInputCost] = useState("5000");

  const [recommendationQuestion, setRecommendationQuestion] = useState(
    "How can I improve my crop yield?"
  );
  const [assistantMessage, setAssistantMessage] = useState(
    "How should I manage my crop?"
  );
  const [missionName, setMissionName] = useState("Crop Survey");

  function setError(feature, message) {
    setErrors((previous) => ({
      ...previous,
      [feature]: message,
    }));
  }

  function clearError(feature) {
    setError(feature, "");
  }

  async function loadSensors() {
    try {
      const data = await apiRequest("/sensors");
      setSensors(data);
      clearError("sensors");
    } catch (error) {
      setError("sensors", error.message);
    }
  }

  async function loadAlerts() {
    try {
      const data = await apiRequest("/alerts");
      setAlerts(Array.isArray(data.items) ? data.items : []);
      clearError("alerts");
    } catch (error) {
      setError("alerts", error.message);
    }
  }

  async function loadMissions() {
    try {
      const data = await apiRequest("/drone/missions");
      setMissions(Array.isArray(data.items) ? data.items : []);
      clearError("missions");
    } catch (error) {
      setError("missions", error.message);
    }
  }

  useEffect(() => {
    loadSensors();
    loadAlerts();
    loadMissions();
  }, []);

  async function resolveAlert(id) {
    try {
      await apiRequest(`/alerts/${id}/resolve`, {
        method: "POST",
      });

      await loadAlerts();
    } catch (error) {
      setError("alerts", error.message);
    }
  }

  async function getRecommendations(event) {
    event.preventDefault();
    setLoading(true);
    setError("recommendations", "");

    try {
      const data = await apiRequest("/recommendations", {
        method: "POST",
        body: JSON.stringify({
          crop,
          question: recommendationQuestion,
        }),
      });

      setRecommendations(data);
    } catch (error) {
      setError("recommendations", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function estimateEconomics(event) {
    event.preventDefault();
    setLoading(true);
    setError("economics", "");
    setEconomics(null);

    const numericValues = {
      areaAcres: Number(area),
      expectedYieldPerAcre: Number(expectedYield),
      pricePerUnit: Number(marketPrice),
      inputCostPerAcre: Number(inputCost),
    };

    if (
      !Object.values(numericValues).every(Number.isFinite) ||
      numericValues.areaAcres <= 0 ||
      numericValues.expectedYieldPerAcre < 0 ||
      numericValues.pricePerUnit < 0 ||
      numericValues.inputCostPerAcre < 0
    ) {
      setError(
        "economics",
        "Enter a positive area and non-negative yield, price, and input cost."
      );
      setLoading(false);
      return;
    }

    try {
      // These names must match DashboardController.java
      const data = await apiRequest("/economics/estimate", {
        method: "POST",
        body: JSON.stringify({
          crop,
          areaAcres: numericValues.areaAcres,
          expectedYieldPerAcre: numericValues.expectedYieldPerAcre,
          pricePerUnit: numericValues.pricePerUnit,
          inputCostPerAcre: numericValues.inputCostPerAcre,
        }),
      });

      setEconomics(data);
    } catch (error) {
      setError("economics", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createMission(event) {
    event.preventDefault();
    setLoading(true);
    setError("missions", "");

    try {
      await apiRequest("/drone/missions", {
        method: "POST",
        body: JSON.stringify({
          name: missionName,
          areaHectares: Number(area),
          overlapPct: 75,
        }),
      });

      await loadMissions();
    } catch (error) {
      setError("missions", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function askAssistant(event) {
    event.preventDefault();
    setLoading(true);
    setError("assistant", "");
    setAssistantAnswer("");

    try {
      const data = await apiRequest("/assistant", {
        method: "POST",
        body: JSON.stringify({
          message: assistantMessage,
          crop,
        }),
      });

      setAssistantAnswer(
        data.answer || "The server returned no answer."
      );
    } catch (error) {
      setError("assistant", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="farm-dashboard">
      <div className="farm-dashboard-heading">
        <h1>Farm Management Dashboard</h1>
        <p>Monitor your farm and explore crop-planning tools.</p>
      </div>

      <div className="farm-panel">
        <label htmlFor="farm-crop">
          <strong>Select crop</strong>
        </label>
        <select
          id="farm-crop"
          value={crop}
          onChange={(event) => setCrop(event.target.value)}
        >
          <option value="Tomato">Tomato</option>
          <option value="Rice">Rice</option>
          <option value="Wheat">Wheat</option>
          <option value="Cotton">Cotton</option>
          <option value="Maize">Maize</option>
          <option value="Chilli">Chilli</option>
        </select>
      </div>

      <div className="farm-data-grid">
        <Panel title="Sensor Monitoring">
          <ErrorMessage message={errors.sensors} />

          {sensors ? (
            <>
              {Array.isArray(sensors.readings) &&
              sensors.readings.length > 0 ? (
                sensors.readings.map((reading, index) => (
                  <div className="farm-record" key={reading.name || index}>
                    <strong>{reading.name}</strong>
                    <p>
                      {reading.value} {reading.unit}
                    </p>
                    <small>{reading.status}</small>
                  </div>
                ))
              ) : (
                <JsonData data={sensors} />
              )}

              <p className="farm-note">{sensors.notice}</p>
            </>
          ) : (
            <p>Loading sensor data...</p>
          )}

          <button type="button" onClick={loadSensors}>
            Refresh Sensors
          </button>
        </Panel>

        <Panel title="Farm Alerts">
          <ErrorMessage message={errors.alerts} />

          {alerts.length === 0 && !errors.alerts ? (
            <p>No alerts available.</p>
          ) : (
            alerts.map((alert) => (
              <div className="farm-record" key={alert.id}>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
                <p>
                  Severity: {alert.severity} | Status: {alert.status}
                </p>

                {alert.status === "Open" && (
                  <button
                    type="button"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve Alert
                  </button>
                )}
              </div>
            ))
          )}

          <button type="button" onClick={loadAlerts}>
            Refresh Alerts
          </button>
        </Panel>

        <Panel title="Crop Recommendations">
          <form onSubmit={getRecommendations}>
            <label htmlFor="recommendation-question">
              What would you like help with?
            </label>
            <textarea
              id="recommendation-question"
              value={recommendationQuestion}
              onChange={(event) =>
                setRecommendationQuestion(event.target.value)
              }
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Get Recommendations"}
            </button>
          </form>

          <ErrorMessage message={errors.recommendations} />

          {recommendations && <JsonData data={recommendations} />}
        </Panel>

        <Panel title="Economics Estimator">
          <form onSubmit={estimateEconomics}>
            <div className="farm-form-grid">
              <label>
                Area (acres)
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  required
                />
              </label>

              <label>
                Expected yield (units per acre)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={expectedYield}
                  onChange={(event) =>
                    setExpectedYield(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Market price (₹ per unit)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={marketPrice}
                  onChange={(event) =>
                    setMarketPrice(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Input cost (₹ per acre)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputCost}
                  onChange={(event) => setInputCost(event.target.value)}
                  required
                />
              </label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Calculating..." : "Calculate Estimate"}
            </button>
          </form>

          <ErrorMessage message={errors.economics} />

          {economics && (
            <div className="farm-record">
              <h3>Estimate Results</h3>
              <p>Crop: {economics.crop}</p>
              <p>
                Area: {economics.areaAcres} acres
              </p>
              <p>
                Estimated revenue:{" "}
                {Number(economics.estimatedRevenue).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </p>
              <p>
                Estimated input cost:{" "}
                {Number(economics.estimatedInputCost).toLocaleString(
                  "en-IN",
                  { style: "currency", currency: "INR" }
                )}
              </p>
              <p>
                Estimated gross margin:{" "}
                {Number(economics.estimatedGrossMargin).toLocaleString(
                  "en-IN",
                  { style: "currency", currency: "INR" }
                )}
              </p>
              <small>{economics.notice}</small>
            </div>
          )}
        </Panel>

        <Panel title="Drone Mission Planner">
          <form onSubmit={createMission}>
            <label htmlFor="mission-name">Mission name</label>
            <input
              id="mission-name"
              value={missionName}
              onChange={(event) => setMissionName(event.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Planned Mission"}
            </button>
          </form>

          <ErrorMessage message={errors.missions} />

          <h3>Mission History</h3>

          {missions.length === 0 ? (
            <p>No missions created yet.</p>
          ) : (
            missions.map((mission) => (
              <div className="farm-record" key={mission.id}>
                <strong>{mission.name}</strong>
                <p>Status: {mission.status}</p>
                <p>Area: {mission.areaHectares} hectares</p>
                <small>{mission.note}</small>
              </div>
            ))
          )}

          <button type="button" onClick={loadMissions}>
            Refresh Missions
          </button>
        </Panel>

        <Panel title="Farming Assistant">
          <form onSubmit={askAssistant}>
            <label htmlFor="assistant-message">
              Ask a farming question
            </label>
            <textarea
              id="assistant-message"
              value={assistantMessage}
              onChange={(event) => setAssistantMessage(event.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Ask Assistant"}
            </button>
          </form>

          <ErrorMessage message={errors.assistant} />

          {assistantAnswer && (
            <div className="farm-record">
              <strong>Assistant Response</strong>
              <p>{assistantAnswer}</p>
            </div>
          )}
        </Panel>
      </div>

      <p className="farm-note">
        SkyCrop AI is currently a prototype. Sensor readings, weather,
        drone missions, recommendations and assistant responses use demo
        functionality unless connected to real services. Economics outputs
        are estimates, not guaranteed farm profits.
      </p>
    </div>
  );
}
