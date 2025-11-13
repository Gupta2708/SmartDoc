import uvicorn
import base64
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from openai import OpenAI
import os

from dotenv import load_dotenv
from enum import Enum
import re
from datetime import datetime
from pathlib import Path

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set. Please add it to Bk/api/.env or the deployment environment.")

app = FastAPI()

# Your existing model classes remain the same...
class CardType(str, Enum):
    driving_license = "driving_license"
    pan_card = "pan_card"
    aadhaar_card = "aadhaar_card"

class ImageData(BaseModel):
    image_data: str
    mime_type: str
    card_type: CardType

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

class PanName(BaseModel):
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    lastName: Optional[str] = None

class PanCard(BaseModel):
    panNumber: Optional[str] = None
    name: Optional[PanName] = None
    fatherName: Optional[str] = None
    dateOfBirth: Optional[str] = None
    issueDate: Optional[str] = None

class AadhaarAddress(BaseModel):
    house: Optional[str] = None
    street: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pinCode: Optional[str] = None

class AadhaarCard(BaseModel):
    aadhaarNumber: Optional[str] = None
    name: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[AadhaarAddress] = None

class ExtractedData(BaseModel):
    drivingLicense: Optional[DrivingLicense] = None
    panCard: Optional[PanCard] = None
    aadhaarCard: Optional[AadhaarCard] = None

class APIResponse(BaseModel):
    success: bool
    data: Optional[ExtractedData] = None
    validation: Optional[dict] = None  # New field for validation results
    error: Optional[str] = None

# FIXED CORS configuration
origins = [
    "https://smart-doc-five.vercel.app",
    "https://licenseee-lovat.vercel.app",  
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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

def get_openai_prompt(card_type: CardType) -> str:
    if card_type == CardType.driving_license:
        return '''
        You are an AI system specialized in document information extraction. 
        You will receive a driving license image as input. Your task is to detect and extract all visible fields and 
        return them as a clean, strictly valid JSON object following this exact schema:
        {
            "drivingLicense": {
                "state": "string or null",
                "dlNumber": "string or null",
                "issueDate": "DD/MM/YYYY or null",
                "expiryDate": "DD/MM/YYYY or null",
                "name": {
                    "firstName": "string or null",
                    "middleName": "string or null",
                    "lastName": "string or null"
                },
                "address": {
                    "street": "string or null",
                    "city": "string or null",
                    "state": "string or null",
                    "zipCode": "string or null"
                },
                "sex": "M/F or null",
                "height": "string or null",
                "weight": "string or null",
                "dateOfBirth": "DD/MM/YYYY or null",
                "restrictions": ["restriction1", "restriction2"] or [],
                "hairColor": "string or null",
                "eyeColor": "string or null",
                "dd": "string or null",
                "endorsements": ["endorsement1", "endorsement2"] or []
            }
        }
        Strict rules you must follow:
        - Return ONLY a JSON object (no explanations, no markdown, no extra text).
        - If a field is missing, unreadable, or not applicable, return null (not "Not detected").
        - For restrictions and endorsements, return an empty list [] if none are visible.
        - Dates must be formatted consistently as DD/MM/YYYY.
        - Preserve leading zeros in license numbers, zip codes, and dates.
        - Do not hallucinate values. If unsure, use null.
        '''
    elif card_type == CardType.pan_card:
        return '''
        You are an AI system specialized in document information extraction. 
        You will receive a PAN card image as input. Your task is to detect and extract all visible fields and 
        return them as a clean, strictly valid JSON object following this exact schema:
        {
            "panCard": {
                "panNumber": "string or null",
                "name": {
                    "firstName": "string or null",
                    "middleName": "string or null",
                    "lastName": "string or null"
                },
                "fatherName": "string or null",
                "dateOfBirth": "DD/MM/YYYY or null",
                "issueDate": "DD/MM/YYYY or null"
            }
        }
        Strict rules you must follow:
        - Return ONLY a JSON object (no explanations, no markdown, no extra text).
        - If a field is missing, unreadable, or not applicable, return null (not "Not detected").
        - Dates must be formatted consistently as DD/MM/YYYY.
        - Preserve leading zeros in numbers and dates.
        - Do not hallucinate values. If unsure, use null.
        '''
    elif card_type == CardType.aadhaar_card:
        return '''
        You are an AI system specialized in document information extraction. 
        You will receive an Aadhaar card image as input. Your task is to detect and extract all visible fields and 
        return them as a clean, strictly valid JSON object following this exact schema:
        {
            "aadhaarCard": {
                "aadhaarNumber": "string or null",
                "name": "string or null",
                "dateOfBirth": "DD/MM/YYYY or null",
                "gender": "M/F/Other or null",
                "address": {
                    "house": "string or null",
                    "street": "string or null",
                    "landmark": "string or null",
                    "city": "string or null",
                    "state": "string or null",
                    "pinCode": "string or null"
                }
            }
        }
        Strict rules you must follow:
        - Return ONLY a JSON object (no explanations, no markdown, no extra text).
        - If a field is missing, unreadable, or not applicable, return null (not "Not detected").
        - Dates must be formatted consistently as DD/MM/YYYY.
        - Preserve leading zeros in numbers and dates.
        - Do not hallucinate values. If unsure, use null.
        '''
    else:
        raise ValueError("Invalid card type")

def coerce_types(data):
    dl = data.get("drivingLicense", {})
    # String fields
    for field in [
        "state", "dlNumber", "issueDate", "expiryDate", "sex", "height", "weight", "dateOfBirth", "hairColor", "eyeColor", "dd"
    ]:
        if field in dl and dl[field] is not None and not isinstance(dl[field], str):
            dl[field] = str(dl[field])
    # Name fields
    if "name" in dl and isinstance(dl["name"], dict):
        for nfield in ["firstName", "middleName", "lastName"]:
            if nfield in dl["name"] and dl["name"][nfield] is not None and not isinstance(dl["name"][nfield], str):
                dl["name"][nfield] = str(dl["name"][nfield])
    # Address fields
    if "address" in dl and isinstance(dl["address"], dict):
        for afield in ["street", "city", "state", "zipCode"]:
            if afield in dl["address"] and dl["address"][afield] is not None and not isinstance(dl["address"][afield], str):
                dl["address"][afield] = str(dl["address"][afield])
    # List fields
    for lfield in ["restrictions", "endorsements"]:
        if lfield in dl and not isinstance(dl[lfield], list):
            dl[lfield] = []
    data["drivingLicense"] = dl
    return data

def extract_info_with_openrouter(image_data: str, mime_type: str, card_type: CardType) -> Dict[str, Any]:
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENAI_API_KEY,
        )
        prompt = get_openai_prompt(card_type)  # Same prompt
        system_prompt = prompt + "\nThe following image is attached in base64 format. Return only valid JSON as response."
        msg_content = f"Image base64 (mime_type={mime_type}): {image_data[:100]}... (truncated)"
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": msg_content}
        ]
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            temperature=0.2,
            max_tokens=1024
        )
        response_text = response.choices[0].message.content.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
        extracted_data = json.loads(response_text)
        extracted_data = coerce_types(extracted_data)
        return extracted_data
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse OpenRouter response as JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenRouter API error: {str(e)}")

def validate_dl_number(dl_number):
    if not dl_number:
        return None
    return bool(re.fullmatch(r"[A-Z]{2}[0-9]{2} ?[0-9]{11}", dl_number))

def validate_pan_number(pan_number):
    if not pan_number:
        return None
    return bool(re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]{1}", pan_number))

def validate_aadhaar_number(aadhaar_number):
    if not aadhaar_number:
        return None
    return bool(re.fullmatch(r"^[2-9]{1}[0-9]{3} ?[0-9]{4} ?[0-9]{4}$", aadhaar_number))

def validate_date(date_str):
    if not date_str:
        return None, None
    # Try to parse and convert to DD/MM/YYYY
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%m/%d/%Y", "%d.%m.%Y"):
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%d/%m/%Y"), True
        except Exception:
            continue
    return date_str, False

def validate_field(value, validator):
    if value is None:
        return {"value": None, "valid": None}
    valid = validator(value)
    return {"value": value, "valid": valid}

def validate_card_fields(card_type, data):
    if card_type == CardType.driving_license:
        dl = data.get("drivingLicense", {})
        # Validate fields
        result = {
            "drivingLicense": {
                "state": {"value": dl.get("state"), "valid": None},
                "dlNumber": validate_field(dl.get("dlNumber"), validate_dl_number),
                "issueDate": validate_date(dl.get("issueDate"))[0] and {"value": validate_date(dl.get("issueDate"))[0], "valid": validate_date(dl.get("issueDate"))[1]} or {"value": None, "valid": None},
                "expiryDate": validate_date(dl.get("expiryDate"))[0] and {"value": validate_date(dl.get("expiryDate"))[0], "valid": validate_date(dl.get("expiryDate"))[1]} or {"value": None, "valid": None},
                "name": {
                    "firstName": {"value": dl.get("name", {}).get("firstName"), "valid": None},
                    "middleName": {"value": dl.get("name", {}).get("middleName"), "valid": None},
                    "lastName": {"value": dl.get("name", {}).get("lastName"), "valid": None},
                },
                "address": {
                    "street": {"value": dl.get("address", {}).get("street"), "valid": None},
                    "city": {"value": dl.get("address", {}).get("city"), "valid": None},
                    "state": {"value": dl.get("address", {}).get("state"), "valid": None},
                    "zipCode": {"value": dl.get("address", {}).get("zipCode"), "valid": None},
                },
                "sex": {"value": dl.get("sex"), "valid": dl.get("sex") in ["M", "F", None]},
                "height": {"value": dl.get("height"), "valid": None},
                "weight": {"value": dl.get("weight"), "valid": None},
                "dateOfBirth": validate_date(dl.get("dateOfBirth"))[0] and {"value": validate_date(dl.get("dateOfBirth"))[0], "valid": validate_date(dl.get("dateOfBirth"))[1]} or {"value": None, "valid": None},
                "restrictions": {"value": dl.get("restrictions"), "valid": None},
                "hairColor": {"value": dl.get("hairColor"), "valid": None},
                "eyeColor": {"value": dl.get("eyeColor"), "valid": None},
                "dd": {"value": dl.get("dd"), "valid": None},
                "endorsements": {"value": dl.get("endorsements"), "valid": None},
            }
        }
        return result
    elif card_type == CardType.pan_card:
        pan = data.get("panCard", {})
        result = {
            "panCard": {
                "panNumber": validate_field(pan.get("panNumber"), validate_pan_number),
                "name": {
                    "firstName": {"value": pan.get("name", {}).get("firstName"), "valid": None},
                    "middleName": {"value": pan.get("name", {}).get("middleName"), "valid": None},
                    "lastName": {"value": pan.get("name", {}).get("lastName"), "valid": None},
                },
                "fatherName": {"value": pan.get("fatherName"), "valid": None},
                "dateOfBirth": validate_date(pan.get("dateOfBirth"))[0] and {"value": validate_date(pan.get("dateOfBirth"))[0], "valid": validate_date(pan.get("dateOfBirth"))[1]} or {"value": None, "valid": None},
                "issueDate": validate_date(pan.get("issueDate"))[0] and {"value": validate_date(pan.get("issueDate"))[0], "valid": validate_date(pan.get("issueDate"))[1]} or {"value": None, "valid": None},
            }
        }
        return result
    elif card_type == CardType.aadhaar_card:
        aadhaar = data.get("aadhaarCard", {})
        result = {
            "aadhaarCard": {
                "aadhaarNumber": validate_field(aadhaar.get("aadhaarNumber"), validate_aadhaar_number),
                "name": {"value": aadhaar.get("name"), "valid": None},
                "dateOfBirth": validate_date(aadhaar.get("dateOfBirth"))[0] and {"value": validate_date(aadhaar.get("dateOfBirth"))[0], "valid": validate_date(aadhaar.get("dateOfBirth"))[1]} or {"value": None, "valid": None},
                "gender": {"value": aadhaar.get("gender"), "valid": aadhaar.get("gender") in ["M", "F", "Other", None]},
                "address": {
                    "house": {"value": aadhaar.get("address", {}).get("house"), "valid": None},
                    "street": {"value": aadhaar.get("address", {}).get("street"), "valid": None},
                    "landmark": {"value": aadhaar.get("address", {}).get("landmark"), "valid": None},
                    "city": {"value": aadhaar.get("address", {}).get("city"), "valid": None},
                    "state": {"value": aadhaar.get("address", {}).get("state"), "valid": None},
                    "pinCode": {"value": aadhaar.get("address", {}).get("pinCode"), "valid": None},
                }
            }
        }
        return result
    else:
        return data

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

@app.post("/extract-info", response_model=APIResponse)
async def extract_info(image_data: ImageData):
    try:
        if not image_data.image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        if not image_data.mime_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid image format")
        extracted_info = extract_info_with_openrouter(
            image_data.image_data,
            image_data.mime_type,
            image_data.card_type
        )
        # Build ExtractedData for the main data field
        data_obj = ExtractedData()
        if image_data.card_type == CardType.driving_license:
            data_obj.drivingLicense = DrivingLicense(**extracted_info.get("drivingLicense", {}))
        elif image_data.card_type == CardType.pan_card:
            data_obj.panCard = PanCard(**extracted_info.get("panCard", {}))
        elif image_data.card_type == CardType.aadhaar_card:
            data_obj.aadhaarCard = AadhaarCard(**extracted_info.get("aadhaarCard", {}))
        # Validation results (regex etc.)
        validation_results = validate_card_fields(image_data.card_type, extracted_info)
        return APIResponse(
            success=True,
            data=data_obj,
            validation=validation_results
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