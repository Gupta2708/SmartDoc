import React, { useState } from "react";
import DrivingLicenseExtractor from "./DrivingLicenseExtractor";
import './App.css';
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from 'lucide-react';

const CARD_TYPES = [
  { key: 'driving_license', label: 'Driving License' },
  { key: 'pan_card', label: 'PAN Card' },
  { key: 'aadhaar_card', label: 'Aadhaar Card' },
];

function App() {
  const [selectedCard, setSelectedCard] = useState('driving_license');

  return (
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 transition-colors duration-300">
      <header className="mb-12 flex flex-col items-center relative">
        <img src="/vite.svg" alt="Logo" className="h-16 mb-2 mx-auto" />
        <h1 className="text-3xl font-bold text-blue-400">DL Info Extractor</h1>
        <p className="text-gray-300 text-lg">Upload your document and let Gemini AI extract all the details for you!</p>
      </header>
      {/* Tabs for Card Type Selection */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg bg-gray-700 shadow p-1">
          {CARD_TYPES.map((tab) => (
            <button
              key={tab.key}
              className={`relative px-6 py-2 font-medium rounded-lg focus:outline-none transition-colors duration-200 ${selectedCard === tab.key ? 'text-white bg-blue-500 shadow' : 'text-blue-300 bg-transparent hover:bg-gray-600'}`}
              onClick={() => setSelectedCard(tab.key)}
            >
              <AnimatePresence>
                {selectedCard === tab.key && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-lg z-0"
                    style={{ background: 'rgba(37, 99, 235, 0.15)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Main Extractor Component */}
      <DrivingLicenseExtractor cardType={selectedCard} />
      <footer className="mt-8 text-gray-500 text-sm">
        Made with <span className="text-blue-500">React</span> & Gemini AI | <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="underline">GitHub</a>
      </footer>
    </div>
  );
}

export default App;