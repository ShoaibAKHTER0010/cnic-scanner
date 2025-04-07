import React, { useState, useRef } from "react";
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

  const webcamRef = useRef(null);

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

      if (!cnicNumber && /\d{5}-\d{7}-\d{1}/.test(line)) {
        cnicNumber = line.match(/\d{5}-\d{7}-\d{1}/)[0];
        continue;
      }

      if (!gender && /\b(M|F|Male|Female)\b/i.test(line)) {
        gender = line.match(/\b(M|F|Male|Female)\b/i)[0];
        continue;
      }

      // Look for three date patterns in a line (DOB, Issue, Expiry)
      if ((dob === "" || issueDate === "" || expiryDate === "") && /\d{2}\.\d{2}\.\d{4}/.test(line)) {
        const matches = line.match(/\d{2}\.\d{2}\.\d{4}/g);
        if (matches) {
          if (matches[0] && !dob) dob = matches[0];
          if (matches[1] && !issueDate) issueDate = matches[1];
          if (matches[2] && !expiryDate) expiryDate = matches[2];
        }
        continue;
      }

      // Name and Father's Name
      if (!name && /^[A-Z][a-z]+\s[A-Z][a-z]+/.test(line)) {
        name = line;
        continue;
      }

      if (name && !fatherName && /^[A-Z][a-z]+\s[A-Z][a-z]+/.test(line)) {
        fatherName = line;
        continue;
      }
    }

    setFormData({
      name,
      fatherName,
      cnicNumber,
      dob: dob.replace(/\./g, "-"),
      gender,
      country,
      issueDate: issueDate.replace(/\./g, "-"),
      expiryDate: expiryDate.replace(/\./g, "-"),
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
          videoConstraints={{
            facingMode: typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent) ? { exact: "environment" } : "user",
          }}
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

      {/* Debugging Text */}
      <div style={{ maxWidth: "600px", margin: "30px auto", fontSize: "12px", color: "#777" }}>
        <h4>Extracted OCR Text (for debugging):</h4>
        <pre>{text}</pre>
      </div>
    </div>
  );
};

export default CNICScanner;
