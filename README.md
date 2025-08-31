# SmartDoc Extractor

An AI-powered document parser built with Google Gemini AI + React + FastAPI, designed to extract and validate key information from Driving Licenses, Aadhaar Cards, and PAN Cards. The system combines LLM intelligence with regex-based validation for high accuracy and provides structured exports (JSON, CSV, PDF) for downstream use cases such as KYC, fintech onboarding, and digital identity verification.

---

## Features  
- 📄 **Multi-Document Support** – Extract details from Driving Licenses, Aadhaar Cards, and more.  
- 🤖 **AI-Powered Extraction** – Uses **Gemini AI** for accurate and fast data parsing.  
- 🎨 **Modern UI/UX** – Developed using **React + TailwindCSS** for a responsive and clean design.  
- 📂 **Export Options** – Save extracted results as **PDF, JSON, CSV, or TXT**.  
- 🔍 **Copy to Clipboard** – Quickly copy extracted details for further use.  
- ⚡ **Fast & Lightweight** – Built with **Vite** for optimized performance.  
- 🌙 **Dark Mode** – Always-on dark theme for comfortable viewing.

---

## 🛠️ Tech Stack  
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI, python-dotenv  
- **API**: Google Generative AI (Gemini)
- **Icons & UI**: Lucide React 

---

## Folder Structure
```
my-react-app/
├── README.md
├── eslint.config.js
├── index.html                # Entry HTML (Vite)
├── netlify.toml              # Netlify config for frontend
├── package.json
├── vite.config.js
│
├── Bk/                       # Backend folder
│   ├── requirements.txt      # Python dependencies
│   ├── runtime.txt           # Python version for deploy
│   ├── vercel.json           # Vercel config
│   └── api/
│       └── backk.py          # FastAPI app
│
└── src/                      # React frontend
    ├── api.js                # Axios API client
    ├── App.jsx               # Main app layout
    ├── App.css
    ├── index.jsx             # React entry
    ├── index.css
    ├── DrivingLicenseExtractor.jsx
    ├── ResultsSection.jsx    # Shows extracted results + export buttons
    ├── UploadArea.jsx        # Drag-and-drop upload UI
    ├── InfoCard.jsx          # Card for extracted fields
    ├── ErrorAlert.jsx
    └── LoadingSpinner.jsx

```
---

## 📑 Usage

- Upload a document (Driving License, Aadhaar, etc.).
- Gemini AI extracts structured details automatically.
- Review results in a clean UI with copy & edit options.
- Export data in PDF, JSON, CSV, or TXT format.

---

## Setup Instructions

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd my-react-app
```

### 2. Frontend Setup (React)
```sh
npm install
# Create a .env file in the root (optional, for custom API URL):
echo VITE_API_URL=http://localhost:8102 > .env
npm run dev
```
- The app runs at `http://localhost:5173` by default.

### 3. Backend Setup (FastAPI)
```sh
cd Bk/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
# Create .env file with your Gemini API key:
echo GEMINI_API_KEY=your_gemini_api_key > .env
python backk.py
```
- The API runs at `http://localhost:8102` by default.

---

## Environment Variables
- **Frontend:**
  - `VITE_API_URL` — URL of the backend API (default: deployed backend or localhost)
- **Backend:**
  - `GEMINI_API_KEY` — Your Google Gemini API key (required, never commit this!)

---

## API Documentation

### `POST /extract-license`
- **Request:**
  - `image_data`: base64-encoded image string
  - `mime_type`: image MIME type (e.g., `image/jpeg`)
- **Response:**
  - `success`: boolean
  - `data`: extracted license info (if success)
  - `error`: error message (if failed)

### Example Request (frontend)
```js
await api.post('/extract-license', {
  image_data: base64Image,
  mime_type: 'image/jpeg'
});
```

---

## Deployment
- **Frontend:** Deploy `my-react-app` to Netlify or Vercel. Set `VITE_API_URL` in environment variables to your backend URL.
- **Backend:** Deploy `Bk/api/backk.py` to Vercel/Render. Set `GEMINI_API_KEY` in environment variables.
- See `vercel.json` for Vercel config.

---

## License
[MIT](LICENSE) (add your license file if needed)

---

## Credits
- [Google Generative AI (Gemini)](https://ai.google.dev/)
- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Vite](https://vitejs.dev/)
