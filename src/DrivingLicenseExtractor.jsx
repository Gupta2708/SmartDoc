import React, { useState } from 'react';
import api from './api.js';
import UploadArea from './UploadArea';
import ResultsSection from './ResultsSection';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import { motion } from 'framer-motion';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'extract', label: 'Extract' },
  { key: 'validate', label: 'Validate' },
  { key: 'export', label: 'Export' },
];

const DrivingLicenseExtractor = ({ cardType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
    setCurrentStep(1); // Move to Extract step
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
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
    setCurrentStep(2); // Move to Validate step (extracting)
    try {
      const base64Image = await convertToBase64(selectedFile);
      const response = await api.post('/extract-info', {
        image_data: base64Image,
        mime_type: selectedFile.type,
        card_type: cardType
      });
      if (response.data.success) {
        setExtractedData(response.data.data);
        setShowResults(true);
        setCurrentStep(3); // Move to Export step (results ready)
      } else {
        setError(response.data.error || 'Failed to extract information');
        setCurrentStep(1); // Back to Extract step
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to extract information from the image'
      );
      setCurrentStep(1); // Back to Extract step
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
    setCurrentStep(0);
  };

  // Stepper UI
  const Stepper = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-0">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.key}>
            <motion.div
              className={`flex flex-col items-center z-10`}
              initial={false}
              animate={{ scale: currentStep === idx ? 1.15 : 1, opacity: currentStep >= idx ? 1 : 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${currentStep > idx ? 'bg-green-500 border-green-500 text-white' : currentStep === idx ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-200 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600'} font-bold text-lg mb-1`}>{idx + 1}</div>
              <span className={`text-xs font-medium ${currentStep >= idx ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</span>
            </motion.div>
            {idx < STEPS.length - 1 && (
              <div className={`h-1 w-8 ${currentStep > idx ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  if (showResults) {
    return (
      <div className="main-card bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <Stepper />
        <ResultsSection extractedData={extractedData} goBack={goBack} />
      </div>
    );
  }

  return (
    <div className="main-card bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <Stepper />
      <UploadArea
        onFileSelect={handleFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        imagePreview={imagePreview}
        loading={loading}
        selectedFile={selectedFile}
        isDragActive={isDragActive}
      />
      <button
        className="submit-btn w-full py-3 mt-4 rounded-lg font-semibold text-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700"
        onClick={handleExtract}
        disabled={!selectedFile || loading}
      >
        {loading ? '⏳ Processing...' : '🔍 Extract Information'}
      </button>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert error={error} />}
    </div>
  );
};

export default DrivingLicenseExtractor;