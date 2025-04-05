import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

const CNICScanner = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    cnicNumber: "",
    dob: "",
  });
  const webcamRef = useRef(null);

  // Capture image from webcam
  const captureImage = () => {
    setLoading(true);
    setError("");
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    extractText(imageSrc);
  };

  // Extract text using Tesseract OCR
  const extractText = async (imageSrc) => {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageSrc,
        "eng",
        { logger: (m) => console.log(m) }
      );
      parseCNICData(text);
    } catch (err) {
      setError("Failed to scan. Try again with a clearer image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Parse extracted text to fill form
  const parseCNICData = (text) => {
    // Extract CNIC (XXXXX-XXXXXXX-X)
    const cnicRegex = /\b\d{5}-\d{7}-\d{1}\b/g;
    const cnicNumber = text.match(cnicRegex)?.[0] || "";

    // Extract Name (Assuming format: "Name: John Doe" or "NAME: JOHN DOE")
    const nameMatch = text.match(/Name:\s*([^\n]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : "";

    // Extract Father's Name (Assuming format: "Father's Name: Ali Khan")
    const fatherNameMatch = text.match(/Father['’]?s Name:\s*([^\n]+)/i);
    const fatherName = fatherNameMatch ? fatherNameMatch[1].trim() : "";

    // Extract DOB (Assuming format: "DOB: 01-01-1990" or "Date of Birth: 01/01/1990")
    const dobMatch = text.match(/DOB:\s*([^\n]+)/i);
    let dob = dobMatch ? dobMatch[1].trim() : "";

    // Format date if needed (e.g., "01/01/1990" → "01-01-1990")
    if (dob.includes("/")) {
      dob = dob.replace(/\//g, "-");
    }

    setFormData({
      name,
      fatherName,
      cnicNumber,
      dob,
    });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>CNIC Scanner & Auto-Fill Form</h1>
      
      {/* Webcam for scanning */}
      <div style={{ margin: "20px 0", textAlign: "center" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: "100%", borderRadius: "8px" }}
        />
        <button 
          onClick={captureImage} 
          disabled={loading}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Scanning..." : "Capture & Auto-Fill"}
        </button>
      </div>

      {/* Display error if any */}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Auto-filled form */}
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