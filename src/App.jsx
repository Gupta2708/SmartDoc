import React, { useState, useEffect } from "react";
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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="mb-8 flex flex-col items-center relative">
        <img src="/vite.svg" alt="Logo" className="h-16 mb-2 mx-auto" />
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">DL Info Extractor</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Upload your document and let Gemini AI extract all the details for you!</p>
        <button
          className="absolute right-4 top-4 flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setDarkMode(d => !d)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'} Mode</span>
        </button>
      </header>
      {/* Tabs for Card Type Selection */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg bg-white dark:bg-gray-700 shadow p-1">
          {CARD_TYPES.map((tab) => (
            <button
              key={tab.key}
              className={`relative px-6 py-2 font-medium rounded-lg focus:outline-none transition-colors duration-200 ${selectedCard === tab.key ? 'text-white bg-blue-600 dark:bg-blue-500 shadow' : 'text-blue-600 dark:text-blue-300 bg-transparent hover:bg-blue-50 dark:hover:bg-gray-600'}`}
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