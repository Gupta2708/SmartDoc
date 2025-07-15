import React, { useState } from 'react';
import api from './Bk/api';

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
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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

  const renderInfoCard = (title, value) => {
    return (
      <div key={title} className="info-card">
        <h3>{title}</h3>
        <p>{value || 'Not detected'}</p>
      </div>
    );
  };

  const renderResults = () => {
    if (!extractedData?.drivingLicense) return null;

    const dl = extractedData.drivingLicense;
    const infoCards = [
      { title: 'State', value: dl.state },
      { title: 'DL Number', value: dl.dlNumber },
      { title: 'First Name', value: dl.name?.firstName },
      { title: 'Middle Name', value: dl.name?.middleName },
      { title: 'Last Name', value: dl.name?.lastName },
      { title: 'Date of Birth', value: dl.dateOfBirth },
      { title: 'Street Address', value: dl.address?.street },
      { title: 'City', value: dl.address?.city },
      { title: 'State', value: dl.address?.state },
      { title: 'Zip Code', value: dl.address?.zipCode },
      { title: 'Sex', value: dl.sex },
      { title: 'Height', value: dl.height },
      { title: 'Weight', value: dl.weight },
      { title: 'Eye Color', value: dl.eyeColor },
      { title: 'Hair Color', value: dl.hairColor },
      { title: 'Issue Date', value: dl.issueDate },
      { title: 'Expiry Date', value: dl.expiryDate },
      { title: 'DD Number', value: dl.dd },
      { title: 'Restrictions', value: dl.restrictions?.join(', ') },
      { title: 'Endorsements', value: dl.endorsements?.join(', ') }
    ];

    return (
      <div className="results-section show">
        <button className="back-btn" onClick={goBack}>
          ← Back to Upload
        </button>
        <h2 className="results-title">📋 Extracted Information</h2>
        <div className="info-grid">
          {infoCards.map(card => renderInfoCard(card.title, card.value))}
        </div>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="main-card">
      <div className="upload-section">
        <div 
          className="upload-area"
          onClick={() => document.getElementById('fileInput').click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📄</div>
          <div className="upload-text">Click to upload or drag and drop</div>
          <div className="upload-subtext">PNG, JPG, JPEG files only</div>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {imagePreview && (
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}

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

        {loading && (
          <div style={{ textAlign: 'center', padding: '30px', marginTop: '20px' }}>
            <div style={{
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #007bff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: '#333', fontSize: '1.1rem', margin: '10px 0' }}>
              Processing your driving license with Gemini AI...
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            marginTop: '15px'
          }}>
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .upload-area {
          border: 2px dashed #007bff;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f9fa;
          margin-bottom: 20px;
        }
        
        .upload-area:hover {
          border-color: #0056b3;
          background: #e9ecef;
        }
        
        .upload-area.dragover {
          border-color: #28a745;
          background: #d4edda;
        }
        
        .upload-icon {
          font-size: 2rem;
          color: #007bff;
          margin-bottom: 15px;
        }
        
        .upload-text {
          font-size: 1.2rem;
          color: #333;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .upload-subtext {
          font-size: 0.9rem;
          color: #666;
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
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        
        .info-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border-left: 4px solid #007bff;
        }
        
        .info-card h3 {
          color: #333;
          font-size: 0.9rem;
          margin: 0 0 10px 0;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .info-card p {
          color: #555;
          font-size: 1.1rem;
          margin: 0;
          word-wrap: break-word;
        }
        
        .results-section {
          background: #f8f9fa;
          padding: 30px;
        }
        
        .back-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }
        
        .back-btn:hover {
          background: #545b62;
        }
        
        .results-title {
          color: #333;
          font-size: 1.8rem;
          margin-bottom: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default DrivingLicenseExtractor;