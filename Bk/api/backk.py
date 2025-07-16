import uvicorn
import base64
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import google.generativeai as genai
import os

from dotenv import load_dotenv

# Load environment variables
load_dotenv()
print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY"))
app = FastAPI()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Your existing model classes remain the same...
class ImageData(BaseModel):
    image_data: str
    mime_type: str

class Name(BaseModel):
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    lastName: Optional[str] = None

class Address(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None

class DrivingLicense(BaseModel):
    state: Optional[str] = None
    dlNumber: Optional[str] = None
    issueDate: Optional[str] = None
    expiryDate: Optional[str] = None
    name: Optional[Name] = None
    address: Optional[Address] = None
    sex: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    dateOfBirth: Optional[str] = None
    restrictions: Optional[List[str]] = None
    hairColor: Optional[str] = None
    eyeColor: Optional[str] = None
    dd: Optional[str] = None
    endorsements: Optional[List[str]] = None

class ExtractedData(BaseModel):
    drivingLicense: DrivingLicense

class APIResponse(BaseModel):
    success: bool
    data: Optional[ExtractedData] = None
    error: Optional[str] = None

# FIXED CORS configuration
origins = [
    "https://cosmic-zabaione-2c2572.netlify.app",
    "https://my-react-app-nine-self.vercel.app",  # Fixed: removed trailing slash
    "https://licenseee-lovat.vercel.app",  # Fixed: removed trailing slash
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use the specific origins list
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def extract_license_info_with_gemini(image_data: str, mime_type: str) -> Dict[str, Any]:
    """
    Extract driving license information using Gemini Vision API
    """
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Create the image part for Gemini
        image_part = {
            "mime_type": mime_type,
            "data": image_bytes
        }
        
        # Prompt for extracting driving license information
        prompt = """
        Analyze this driving license image and extract all visible information in JSON format. 
        Return ONLY a valid JSON object with the following structure:
        
        {
            "drivingLicense": {
                "state": "state name",
                "dlNumber": "license number",
                "issueDate": "issue date",
                "expiryDate": "expiry date",
                "name": {
                    "firstName": "first name",
                    "middleName": "middle name",
                    "lastName": "last name"
                },
                "address": {
                    "street": "street address",
                    "city": "city",
                    "state": "state",
                    "zipCode": "zip code"
                },
                "sex": "M/F",
                "height": "height",
                "weight": "weight",
                "dateOfBirth": "date of birth",
                "restrictions": ["restriction1", "restriction2"],
                "hairColor": "hair color",
                "eyeColor": "eye color",
                "dd": "dd number",
                "endorsements": ["endorsement1", "endorsement2"]
            }
        }
        
        Important notes:
        - If any field is not visible or available, use null
        - For restrictions and endorsements, use empty arrays if none are present
        - Ensure all dates are in readable format
        - Return ONLY the JSON object, no additional text
        """
        
        # Generate content
        response = model.generate_content([prompt, image_part])
        
        # Parse the response
        response_text = response.text.strip()
        
        # Remove any markdown formatting if present
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
        
        # Parse JSON
        extracted_data = json.loads(response_text)
        
        return extracted_data
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse Gemini response as JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint to test if the server is running"""
    return {"message": "DL Info Extractor API is running!", "status": "ok"}

@app.get("/extract-license")
async def extract_license_get():
    """GET endpoint to show API info for /extract-license"""
    return {
        "message": "This endpoint accepts POST requests only",
        "method": "POST",
        "endpoint": "/extract-license",
        "content_type": "application/json",
        "required_fields": ["image_data", "mime_type"],
        "description": "Upload a driving license image to extract information",
        "example": {
            "image_data": "base64_encoded_image_string",
            "mime_type": "image/jpeg"
        }
    }

@app.post("/extract-license", response_model=APIResponse)
async def extract_license(image_data: ImageData):
    """
    Extract driving license information from uploaded image
    """
    try:
        # Validate image data
        if not image_data.image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        if not image_data.mime_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Extract information using Gemini
        extracted_info = extract_license_info_with_gemini(
            image_data.image_data, 
            image_data.mime_type
        )
        
        # Validate and structure the response
        driving_license_data = DrivingLicense(**extracted_info.get("drivingLicense", {}))
        extracted_data = ExtractedData(drivingLicense=driving_license_data)
        
        return APIResponse(
            success=True,
            data=extracted_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return APIResponse(
            success=False,
            error=f"Failed to process image: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "driving-license-extractor"}

@app.get("/extract-license-info")
async def extract_license_info():
    """GET endpoint to show API info"""
    return {
        "message": "This endpoint accepts POST requests only",
        "method": "POST",
        "endpoint": "/extract-license",
        "content_type": "application/json",
        "required_fields": ["image_data", "mime_type"],
        "description": "Upload a driving license image to extract information"
    }

# Add this to run the app directly
# Add this to run the app directly
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8102)