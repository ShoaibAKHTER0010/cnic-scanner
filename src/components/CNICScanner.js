import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

// Regex patterns (more flexible)
const patterns = {
  cnic: /\d{5}[-\s]?\d{7}[-\s]?\d{1}/,
  name: /(name|nama|نام)\s*[:\-]?\s*([A-Z][a-z]+\s+[A-Z]?[a-z]+(?:\s+[A-Z]?[a-z]+)?)/i,
  fatherName: /(father['’]?s name|father name|father|والد)\s*[:\-]?\s*([A-Z][a-z]+\s+[A-Z]?[a-z]+(?:\s+[A-Z]?[a-z]+)?)/i,
  dob: /(date of birth|dob|birth date|تاریخ پیدائش)\s*[:\-]?\s*(\d{2}[-/]\d{2}[-/]\d{4})/i
};

const CNICScanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraType, setCameraType] = useState("environment");
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    cnicNumber: "",
    dob: "",
  });
  const webcamRef = useRef(null);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setLoading(true);
      setError("");
      extractText(imageSrc);
    } else {
      setError("Failed to capture image. Please try again.");
    }
  };

  const extractText = async (imageSrc) => {
    try {
      const result = await Tesseract.recognize(imageSrc, "eng", {
        logger: (m) => console.log(m),
      });
      parseCNICData(result.data.text);
    } catch (err) {
      setError("Text recognition failed. Make sure the image is clear.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseCNICData = (text) => {
    const cleanedText = text.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").toUpperCase();
    console.log("Parsed Text:", cleanedText);

    const cnicMatch = cleanedText.match(patterns.cnic);
    const nameMatch = cleanedText.match(patterns.name);
    const fatherNameMatch = cleanedText.match(patterns.fatherName);
    const dobMatch = cleanedText.match(patterns.dob);

    setFormData({
      name: nameMatch?.[2] || "",
      fatherName: fatherNameMatch?.[2] || "",
      cnicNumber: cnicMatch?.[0] || "",
      dob: dobMatch?.[2]?.replace(/\//g, "-") || "",
    });
  };

  const toggleCamera = () => {
    setCameraType((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>ID Card Scanner</h1>

      <div style={{ margin: "20px 0", textAlign: "center" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: "100%", borderRadius: "8px" }}
          videoConstraints={{ facingMode: cameraType }}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={captureImage}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Scanning..." : "Scan ID"}
          </button>
          <button
            onClick={toggleCamera}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Switch to {cameraType === "environment" ? "Front" : "Back"} Camera
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <form style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
        {["name", "fatherName", "cnicNumber", "dob"].map((field) => (
          <div style={{ marginBottom: "15px" }} key={field}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              {field === "cnicNumber" ? "CNIC Number" : field === "dob" ? "Date of Birth" : field === "fatherName" ? "Father's Name" : "Name"}:
            </label>
            <input
              type="text"
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default CNICScanner;
