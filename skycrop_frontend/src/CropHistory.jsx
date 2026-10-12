
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
        "https://skycrop-ai-2.onrender.com/api/crop/history"
      );

      if (!response.ok) {
        throw new Error("Unable to load crop history.");
      }

      const data = await response.json();

      setHistory(
        Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.history)
              ? data.history
              : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Please try again."
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
        <p>No crop analysis history available yet.</p>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item, index) => (
            <article
              className="history-item"
              key={item.id ?? item.createdAt ?? index}
            >
              {item.crop && (
                <p>
                  <strong>Crop:</strong> {item.crop}
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


