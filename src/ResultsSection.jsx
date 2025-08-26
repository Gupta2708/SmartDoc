import React from 'react';
import InfoCard from './InfoCard';

const ResultsSection = ({ extractedData, goBack }) => {
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
        {infoCards.map(card => (
          <InfoCard key={card.title} title={card.title} value={card.value} />
        ))}
      </div>
    </div>
  );
};

export default ResultsSection;
