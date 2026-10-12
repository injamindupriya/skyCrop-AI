
import React, { useState } from "react";

function CropAnalyzer() {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState("Tomato");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setResult(null);
    setError("");
    setPreview("");

    if (!file) {
      setImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImage(null);
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImage(null);
      setError("Image must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function analyzeCrop(event) {
    event.preventDefault();

    if (!image) {
      setError("Please select a crop image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("crop", crop);

      const response = await fetch(
        "https://skycrop-ai-2.onrender.com/api/crop/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Check whether it is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={styles.container}>
      <h2>🌱 Crop Image Analysis</h2>
      <p>
        Upload a clear crop or leaf image to validate and record it.
      </p>

      <form onSubmit={analyzeCrop}>
        <label htmlFor="crop">Select crop:</label>
        <select
          id="crop"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          style={styles.input}
        >
          <option>Tomato</option>
          <option>Rice</option>
          <option>Cotton</option>
          <option>Maize</option>
          <option>Chilli</option>
          <option>Other</option>
        </select>

        <label htmlFor="cropImage">Choose crop image:</label>
        <input
          id="cropImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={styles.input}
        />

        {preview && (
          <div>
            <img
              src={preview}
              alt="Selected crop"
              style={styles.preview}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !image}
          style={styles.button}
        >
          {loading ? "Uploading..." : "Upload and Analyze"}
        </button>
      </form>

      {error && (
        <p role="alert" style={styles.error}>
          {error}
        </p>
      )}

      {result && (
        <div style={styles.result}>
          <h3>Upload Successful</h3>
          <p><strong>Crop:</strong> {result.crop}</p>
          <p><strong>File:</strong> {result.filename}</p>
          <p><strong>Status:</strong> {result.modelStatus}</p>
          <p><strong>Result:</strong> {result.result}</p>
          <p>{result.notice}</p>

          {result.recommendations?.length > 0 && (
            <>
              <h4>Recommendations</h4>
              <ul>
                {result.recommendations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}

const styles = {
  container: {
    maxWidth: "650px",
    margin: "24px auto",
    padding: "24px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    color: "#222",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    margin: "8px 0 20px",
    padding: "10px",
  },
  preview: {
    display: "block",
    maxWidth: "100%",
    maxHeight: "300px",
    objectFit: "contain",
    margin: "12px 0",
    borderRadius: "8px",
  },
  button: {
    padding: "12px 18px",
    background: "#237a3b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
    padding: "16px",
    background: "#f0f8f0",
    borderRadius: "8px",
    overflowWrap: "anywhere",
  },
  error: {
    color: "#b42318",
    marginTop: "16px",
  },
};

export default CropAnalyzer;
