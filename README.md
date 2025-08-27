# DL Info Extractor

A modern web application to extract all visible information from a driving license image using Google Gemini AI.

---

## Features
- Upload your driving license image (drag & drop or file picker)
- Extracts all visible details (name, address, DL number, etc.) using Gemini Vision API
- Fast, responsive React frontend (Vite)
- Python FastAPI backend with secure CORS
- Clean, user-friendly UI

---

## Demo
- **Frontend:** [Netlify/Vercel deployment link here]
- **Backend:** [Vercel/Render deployment link here]

---

## Tech Stack
- **Frontend:** React, Vite, Axios
- **Backend:** FastAPI, Google Generative AI (Gemini), python-dotenv
- **Deployment:** Vercel (backend), Netlify/Vercel (frontend)

---

## Folder Structure
```
my-react-app/
├── src/                  # React frontend
│   ├── App.jsx           # Main app layout
│   ├── api.js            # Axios API client
│   ├── DrivingLicenseExtractor.jsx
│   ├── ResultsSection.jsx
│   ├── UploadArea.jsx
│   ├── InfoCard.jsx
│   ├── ErrorAlert.jsx
│   └── LoadingSpinner.jsx
├── Bk/api/               # Python FastAPI backend
│   ├── backk.py          # Main FastAPI app
│   ├── license.py        # Alternative HTTP handler (for Vercel)
│   ├── requirements.txt  # Python dependencies
│   ├── runtime.txt       # Python version
│   └── .env              # (Not committed) Gemini API key
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

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

## Security Best Practices
- **Never commit `.env` files or API keys.**
- `.env` and `*.env` are in `.gitignore`.
- If you accidentally commit a secret, revoke it immediately and follow [removal instructions](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

---

## License
[MIT](LICENSE) (add your license file if needed)

---

## Credits
- [Google Generative AI (Gemini)](https://ai.google.dev/)
- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Vite](https://vitejs.dev/)
