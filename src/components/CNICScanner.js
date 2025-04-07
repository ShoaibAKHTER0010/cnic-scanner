import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

const CNICScanner = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    cnicNumber: "",
    dob: "",
    gender: "",
    country: "",
    issueDate: "",
    expiryDate: "",
  });
  const [facingMode, setFacingMode] = useState("user"); // Default: front camera

  const webcamRef = useRef(null);

  // Detect device type and set camera
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setFacingMode("environment"); // Use back camera on mobile
    }
  }, []);

  const videoConstraints = {
    facingMode: facingMode,
    width: 350,
    height: 350,
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    extractText(imageSrc);
  };

  const extractText = async (imageSrc) => {
    const {
      data: { text },
    } = await Tesseract.recognize(imageSrc, "eng", {
      logger: (m) => console.log(m),
    });
    setText(text);
    parseCNICData(text);
  };

  const parseCNICData = (rawText) => {
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let name = "";
    let fatherName = "";
    let cnicNumber = "";
    let dob = "";
    let gender = "";
    let country = "Pakistan";
    let issueDate = "";
    let expiryDate = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!name && /^[A-Za-z ]{3,}$/.test(line)) {
        name = line;
        continue;
      }

      if (name && !fatherName && /^[A-Za-z ]{3,}$/.test(line)) {
        fatherName = line;
        continue;
      }

      if (!cnicNumber && /\d{5}-\d{7}-\d{1}/.test(line)) {
        cnicNumber = line.match(/\d{5}-\d{7}-\d{1}/)[0];
        continue;
      }

      if (!dob && /(\d{2}-\d{2}-\d{4})/.test(line) && line.toLowerCase().includes("birth")) {
        dob = line.match(/(\d{2}-\d{2}-\d{4})/)[0];
        continue;
      }

      if (!issueDate && /issue/i.test(line) && /(\d{2}-\d{2}-\d{4})/.test(line)) {
        issueDate = line.match(/(\d{2}-\d{2}-\d{4})/)[0];
        continue;
      }

      if (!expiryDate && /expiry/i.test(line) && /(\d{2}-\d{2}-\d{4})/.test(line)) {
        expiryDate = line.match(/(\d{2}-\d{2}-\d{4})/)[0];
        continue;
      }

      if (!gender && /(Male|Female)/i.test(line)) {
        gender = line.match(/(Male|Female)/i)[0];
        continue;
      }
    }

    setFormData({
      name,
      fatherName,
      cnicNumber,
      dob,
      gender,
      country,
      issueDate,
      expiryDate,
    });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "30px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>CNIC Scanner & Auto-Fill Form</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={350}
          videoConstraints={videoConstraints}
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <button onClick={captureImage} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
          Capture & Scan
        </button>
      </div>

      {image && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src={image} alt="Captured CNIC" width="300" />
        </div>
      )}

      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "20px" }}>Scanned Information</h2>
        <form>
          {[
            ["Name", "name"],
            ["Father's Name", "fatherName"],
            ["CNIC Number", "cnicNumber"],
            ["Date of Birth", "dob"],
            ["Gender", "gender"],
            ["Country", "country"],
            ["Date of Issue", "issueDate"],
            ["Date of Expiry", "expiryDate"],
          ].map(([label, key]) => (
            <div key={key} style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{label}:</label>
              <input
                type="text"
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          ))}
        </form>
      </div>

      <div style={{ maxWidth: "600px", margin: "30px auto", fontSize: "12px", color: "#777" }}>
        <h4>Extracted OCR Text (for debugging):</h4>
        <pre>{text}</pre>
      </div>
    </div>
  );
};

export default CNICScanner;
