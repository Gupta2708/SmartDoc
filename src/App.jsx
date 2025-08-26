import React from "react";
import DrivingLicenseExtractor from "./DrivingLicenseExtractor";
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{ marginBottom: '2rem' }}>
        <img src="/vite.svg" alt="Logo" style={{ height: 60, marginBottom: 10 }} />
        <h1>DL Info Extractor</h1>
        <p style={{ color: '#555', fontSize: '1.1rem' }}>
          Upload your driving license image and let Gemini AI extract all the details for you!
        </p>
      </header>
      <DrivingLicenseExtractor />
      <footer style={{ marginTop: '2rem', color: '#888', fontSize: '0.95rem' }}>
        Made with <span style={{ color: '#007bff' }}>React</span> & Gemini AI | <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </div>
  );
}

export default App;