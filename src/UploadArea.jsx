import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadArea = ({ onFileSelect, onDragOver, onDragLeave, onDrop, imagePreview, loading, selectedFile, isDragActive }) => (
  <div className="upload-section w-full flex flex-col items-center">
    <AnimatePresence>
      <motion.div
        className={`upload-area w-full max-w-lg border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-500 shadow-lg bg-blue-50' : 'border-gray-300 bg-white dark:bg-gray-800'}`}
        onClick={() => document.getElementById('fileInput').click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        initial={false}
        animate={isDragActive ? { scale: 1.05, boxShadow: '0 0 0 4px #3b82f6' } : { scale: 1, boxShadow: '0 0 0 0px #fff' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="upload-icon text-4xl mb-2">📄</div>
        <div className="upload-text text-lg font-semibold mb-1">Click to upload or drag and drop</div>
        <div className="upload-subtext text-gray-500 mb-2">PNG, JPG, JPEG files only</div>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            <span className="font-medium">Selected:</span> {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}
      </motion.div>
    </AnimatePresence>
    {imagePreview && (
      <div className="text-center mt-4">
        <img
          src={imagePreview}
          alt="Preview"
          className="max-w-full max-h-72 rounded-lg shadow-md mx-auto"
        />
      </div>
    )}
  </div>
);

export default UploadArea;
