
import React, { useEffect, useState } from "react";

function CropHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        https://skycrop-ai-2.onrender.com/api/crop/history
      );

      if (!response.ok) {
        throw new Error("Unable to load crop history.");
      }

      const data = await response.json();

      setHistory(Array.isArray(data) ? data : data.history || []);
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <section className="crop-history">
      <div className="history-heading">
        <h2>Crop Analysis History</h2>

        <button type="button" onClick={loadHistory}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading crop history...</p>}

      {error && <p className="history-error">{error}</p>}

      {!loading && !error && history.length === 0 && (
        <p>No crop analyses recorded yet. Upload a leaf image first.</p>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item, index) => (
            <article
              className="history-card"
              key={item.id ?? index}
            >
              <h3>{item.crop || "Unknown crop"}</h3>

              <p>
                <strong>Status:</strong>{" "}
                {item.result || item.status || "Submitted"}
              </p>

              {item.modelStatus && (
                <p>
                  <strong>AI model:</strong> {item.modelStatus}
                </p>
              )}

              {item.message && <p>{item.message}</p>}

              {item.createdAt && (
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CropHistory;
