import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

// Camera configuration
const cameraConfig = {
  backCamera: { facingMode: { exact: "environment" } },
  frontCamera: { facingMode: "user" }
};

// Regex patterns for data extraction
const patterns = {
  cnic: /\b\d{5}-\d{7}-\d{1}\b/g,
  name: /(name|nama|نام|nm)\s*[:]?\s*([a-z]+(?:\s+[a-z]+)+)/i,
  fatherName: /(father['']?s? name|father|والد)\s*[:]?\s*([a-z]+(?:\s+[a-z]+)+)/i,
  dob: /(dob|date of birth|birth date|تاریخ پیدائش)\s*[:]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
};

const CNICScanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraType, setCameraType] = useState("back");
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    cnicNumber: "",
    dob: "",
  });
  const webcamRef = useRef(null);

  const captureImage = () => {
    setLoading(true);
    setError("");
    const imageSrc = webcamRef.current.getScreenshot();
    extractText(imageSrc);
  };

  const extractText = async (imageSrc) => {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageSrc,
        "eng",
        { logger: (m) => console.log(m) }
      );
      parseCNICData(text);
    } catch (err) {
      setError("Scan failed. Ensure the ID is clear and well-lit.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseCNICData = (text) => {
    const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ");
    
    const cnicNumber = cleanText.match(patterns.cnic)?.[0] || "";
    const nameMatch = cleanText.match(patterns.name);
    const fatherNameMatch = cleanText.match(patterns.fatherName);
    const dobMatch = cleanText.match(patterns.dob);

    let dob = dobMatch ? dobMatch[2].trim() : "";
    if (dob.includes("/")) dob = dob.replace(/\//g, "-");

    setFormData({
      name: nameMatch ? nameMatch[2].trim() : "",
      fatherName: fatherNameMatch ? fatherNameMatch[2].trim() : "",
      cnicNumber,
      dob
    });
  };

  const toggleCamera = () => {
    setCameraType(prev => prev === "back" ? "front" : "back");
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
          videoConstraints={cameraType === "back" ? cameraConfig.backCamera : cameraConfig.frontCamera}
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
            Switch to {cameraType === "back" ? "Front" : "Back"} Camera
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <form style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Father's Name:</label>
          <input
            type="text"
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>CNIC Number:</label>
          <input
            type="text"
            value={formData.cnicNumber}
            onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Date of Birth:</label>
          <input
            type="text"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>
      </form>
    </div>
  );
};

export default CNICScanner;