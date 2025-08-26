import React, { useState } from 'react';
import api from './api.js';
import UploadArea from './UploadArea';
import ResultsSection from './ResultsSection';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

const DrivingLicenseExtractor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setExtractedData(null);
    setShowResults(false);
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const base64Image = await convertToBase64(selectedFile);
      const response = await api.post('/extract-license', {
        image_data: base64Image,
        mime_type: selectedFile.type
      });
      if (response.data.success) {
        setExtractedData(response.data.data);
        setShowResults(true);
      } else {
        setError(response.data.error || 'Failed to extract information');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to extract information from the image'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setShowResults(false);
    setSelectedFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setError(null);
  };

  if (showResults) {
    return <ResultsSection extractedData={extractedData} goBack={goBack} />;
  }

  return (
    <div className="main-card">
      <UploadArea
        onFileSelect={handleFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        imagePreview={imagePreview}
        loading={loading}
        selectedFile={selectedFile}
      />
      <button
        className="submit-btn"
        onClick={handleExtract}
        disabled={!selectedFile || loading}
        style={{
          width: '100%',
          padding: '15px',
          background: (!selectedFile || loading) ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: (!selectedFile || loading) ? 'not-allowed' : 'pointer',
          marginTop: '15px'
        }}
      >
        {loading ? '⏳ Processing...' : '🔍 Extract Information'}
      </button>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert error={error} />}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .main-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
        }
        .upload-section {
          padding: 30px;
        }
        .submit-btn {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default DrivingLicenseExtractor;