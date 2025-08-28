import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, Pencil, Save, X, Download, Clipboard, FileText, FileJson, FileSpreadsheet, FilePdf } from 'lucide-react';

const SECTION_CONFIG = {
  driving_license: [
    {
      title: 'Personal Details',
      fields: [
        { key: 'name.firstName', label: 'First Name', regex: null },
        { key: 'name.middleName', label: 'Middle Name', regex: null },
        { key: 'name.lastName', label: 'Last Name', regex: null },
        { key: 'dateOfBirth', label: 'Date of Birth', regex: 'DD/MM/YYYY' },
        { key: 'sex', label: 'Sex', regex: 'M/F' },
        { key: 'height', label: 'Height', regex: null },
        { key: 'weight', label: 'Weight', regex: null },
        { key: 'eyeColor', label: 'Eye Color', regex: null },
        { key: 'hairColor', label: 'Hair Color', regex: null },
      ],
    },
    {
      title: 'Address',
      fields: [
        { key: 'address.street', label: 'Street', regex: null },
        { key: 'address.city', label: 'City', regex: null },
        { key: 'address.state', label: 'State', regex: null },
        { key: 'address.zipCode', label: 'Zip Code', regex: null },
      ],
    },
    {
      title: 'Document Details',
      fields: [
        { key: 'dlNumber', label: 'DL Number', regex: 'XX00 00000000000' },
        { key: 'issueDate', label: 'Issue Date', regex: 'DD/MM/YYYY' },
        { key: 'expiryDate', label: 'Expiry Date', regex: 'DD/MM/YYYY' },
        { key: 'dd', label: 'DD Number', regex: null },
        { key: 'restrictions', label: 'Restrictions', regex: null },
        { key: 'endorsements', label: 'Endorsements', regex: null },
      ],
    },
  ],
  pan_card: [
    {
      title: 'Personal Details',
      fields: [
        { key: 'name.firstName', label: 'First Name', regex: null },
        { key: 'name.middleName', label: 'Middle Name', regex: null },
        { key: 'name.lastName', label: 'Last Name', regex: null },
        { key: 'fatherName', label: 'Father Name', regex: null },
        { key: 'dateOfBirth', label: 'Date of Birth', regex: 'DD/MM/YYYY' },
      ],
    },
    {
      title: 'Document Details',
      fields: [
        { key: 'panNumber', label: 'PAN Number', regex: 'AAAAA0000A' },
        { key: 'issueDate', label: 'Issue Date', regex: 'DD/MM/YYYY' },
      ],
    },
  ],
  aadhaar_card: [
    {
      title: 'Personal Details',
      fields: [
        { key: 'name', label: 'Name', regex: null },
        { key: 'dateOfBirth', label: 'Date of Birth', regex: 'DD/MM/YYYY' },
        { key: 'gender', label: 'Gender', regex: 'M/F/Other' },
      ],
    },
    {
      title: 'Address',
      fields: [
        { key: 'address.house', label: 'House', regex: null },
        { key: 'address.street', label: 'Street', regex: null },
        { key: 'address.landmark', label: 'Landmark', regex: null },
        { key: 'address.city', label: 'City', regex: null },
        { key: 'address.state', label: 'State', regex: null },
        { key: 'address.pinCode', label: 'Pin Code', regex: null },
      ],
    },
    {
      title: 'Document Details',
      fields: [
        { key: 'aadhaarNumber', label: 'Aadhaar Number', regex: '0000 0000 0000' },
      ],
    },
  ],
};

function getField(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}
function setField(obj, path, value) {
  const parts = path.split('.');
  if (parts.length === 1) {
    obj[parts[0]] = value;
  } else {
    if (!obj[parts[0]]) obj[parts[0]] = {};
    setField(obj[parts[0]], parts.slice(1).join('.'), value);
  }
}

const ResultsSection = ({ extractedData, goBack }) => {
  // Determine card type and data
  let cardType = null;
  let cardData = null;
  if (extractedData?.drivingLicense) {
    cardType = 'driving_license';
    cardData = extractedData.drivingLicense;
  } else if (extractedData?.panCard) {
    cardType = 'pan_card';
    cardData = extractedData.panCard;
  } else if (extractedData?.aadhaarCard) {
    cardType = 'aadhaar_card';
    cardData = extractedData.aadhaarCard;
  }
  const [openSections, setOpenSections] = useState([0]);
  const [editField, setEditField] = useState(null);
  const [localData, setLocalData] = useState(cardData);
  if (!cardType || !cardData) return null;

  // Helper for validation icon
  function ValidationIcon({ valid, value, regex }) {
    if (valid === true) return <CheckCircle className="text-green-500 inline w-5 h-5" title="Valid" />;
    if (valid === false) return <XCircle className="text-red-500 inline w-5 h-5" title={regex ? `Format: ${regex}` : 'Invalid'} />;
    if (value == null || value === '') return <HelpCircle className="text-gray-400 inline w-5 h-5" title="Missing" />;
    return <HelpCircle className="text-gray-400 inline w-5 h-5" title="Unknown" />;
  }

  // Collapsible section
  function Section({ section, idx }) {
    const isOpen = openSections.includes(idx);
    return (
      <div className="mb-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <button
          className="w-full flex justify-between items-center px-4 py-3 font-semibold text-lg focus:outline-none hover:bg-blue-50 dark:hover:bg-gray-700 rounded-t-lg"
          onClick={() => setOpenSections(isOpen ? openSections.filter(i => i !== idx) : [...openSections, idx])}
        >
          <span>{section.title}</span>
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            className="ml-2 text-blue-500"
          >▶</motion.span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-3"
            >
              {section.fields.map(field => {
                // Support nested fields
                let fieldObj = localData;
                let valid = null;
                let value = null;
                if (field.key.includes('.')) {
                  const [parent, child] = field.key.split('.');
                  if (fieldObj[parent]) {
                    value = fieldObj[parent][child]?.value ?? fieldObj[parent][child];
                    valid = fieldObj[parent][child]?.valid;
                  }
                } else {
                  value = fieldObj[field.key]?.value ?? fieldObj[field.key];
                  valid = fieldObj[field.key]?.valid;
                }
                // Array fields (restrictions, endorsements)
                if (Array.isArray(value)) value = value.join(', ');
                // Editing logic
                const isEditing = editField === field.key;
                return (
                  <div key={field.key} className="flex items-center py-2 border-b last:border-b-0">
                    <span className="w-48 font-medium text-gray-700 dark:text-gray-200 flex items-center">
                      {field.label}
                      {field.regex && (
                        <span className="ml-1 text-xs text-gray-400" title={`Format: ${field.regex}`}>ⓘ</span>
                      )}
                    </span>
                    <span className="flex-1 text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <input
                          className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900"
                          value={value || ''}
                          autoFocus
                          onChange={e => {
                            const newValue = e.target.value;
                            setLocalData(prev => {
                              const updated = JSON.parse(JSON.stringify(prev));
                              if (field.key.includes('.')) {
                                const [parent, child] = field.key.split('.');
                                if (!updated[parent]) updated[parent] = {};
                                if (updated[parent][child] && typeof updated[parent][child] === 'object' && 'value' in updated[parent][child]) {
                                  updated[parent][child].value = newValue;
                                } else {
                                  updated[parent][child] = newValue;
                                }
                              } else {
                                if (updated[field.key] && typeof updated[field.key] === 'object' && 'value' in updated[field.key]) {
                                  updated[field.key].value = newValue;
                                } else {
                                  updated[field.key] = newValue;
                                }
                              }
                              return updated;
                            });
                          }}
                          onBlur={() => setEditField(null)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') setEditField(null);
                            if (e.key === 'Escape') setEditField(null);
                          }}
                        />
                      ) : (
                        <span>{value || <span className="text-gray-400">Not detected</span>}</span>
                      )}
                    </span>
                    <span className="ml-2 flex items-center gap-2">
                      <ValidationIcon valid={valid} value={value} regex={field.regex} />
                      {isEditing ? (
                        <button className="ml-1 text-green-600" onClick={() => setEditField(null)} title="Save"><Save size={18} /></button>
                      ) : (
                        <button className="ml-1 text-blue-500" onClick={() => setEditField(field.key)} title="Edit"><Pencil size={18} /></button>
                      )}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Live JSON view
  function getLiveJson() {
    // Remove .valid keys for export
    function stripValid(obj) {
      if (Array.isArray(obj)) return obj.map(stripValid);
      if (obj && typeof obj === 'object') {
        const out = {};
        for (const k in obj) {
          if (k === 'valid') continue;
          out[k] = stripValid(obj[k]);
        }
        return out;
      }
      return obj;
    }
    return JSON.stringify(stripValid(localData), null, 2);
  }

  // Export handlers
  function handleCopyJson() {
    navigator.clipboard.writeText(getLiveJson());
  }
  function handleExportJson() {
    const blob = new Blob([getLiveJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cardType}_info.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function handleExportCsv() {
    // Flatten object for CSV
    function flatten(obj, prefix = '') {
      return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
          Object.assign(acc, flatten(obj[k], pre + k));
        } else {
          acc[pre + k] = Array.isArray(obj[k]) ? obj[k].join(', ') : obj[k];
        }
        return acc;
      }, {});
    }
    const flat = flatten(JSON.parse(getLiveJson()));
    const csv = [Object.keys(flat).join(','), Object.values(flat).map(v => `"${v ?? ''}"`).join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cardType}_info.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function handleExportPdf() {
    // Print the results section (MVP)
    window.print();
  }

  return (
    <div className="results-section show">
      <button className="back-btn mb-4 text-blue-600 dark:text-blue-400 underline" onClick={goBack}>
        ← Back to Upload
      </button>
      <h2 className="results-title text-2xl font-bold mb-4">📋 Extracted Information</h2>
      <div className="info-grid">
        {SECTION_CONFIG[cardType].map((section, idx) => (
          <Section key={section.title} section={section} idx={idx} />
        ))}
      </div>
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Live JSON</h3>
        <div className="flex gap-2 mb-2 flex-wrap">
          <button onClick={handleCopyJson} className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200"><Clipboard size={16}/>Copy JSON</button>
          <button onClick={handleExportJson} className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200"><FileJson size={16}/>Export JSON</button>
          <button onClick={handleExportCsv} className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200"><FileSpreadsheet size={16}/>Export CSV</button>
          <button onClick={handleExportPdf} className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200"><FilePdf size={16}/>Export PDF</button>
        </div>
        <pre className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-xs overflow-x-auto max-h-64 border border-gray-200 dark:border-gray-700">
          {getLiveJson()}
        </pre>
      </div>
    </div>
  );
};

export default ResultsSection;
