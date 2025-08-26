import React from 'react';

const UploadArea = ({ onFileSelect, onDragOver, onDragLeave, onDrop, imagePreview, loading, selectedFile }) => (
  <div className="upload-section">
    <div 
      className="upload-area"
      onClick={() => document.getElementById('fileInput').click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="upload-icon">📄</div>
      <div className="upload-text">Click to upload or drag and drop</div>
      <div className="upload-subtext">PNG, JPG, JPEG files only</div>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={onFileSelect}
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
  </div>
);

export default UploadArea;
