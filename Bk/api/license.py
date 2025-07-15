from http.server import BaseHTTPRequestHandler
import json
import base64
import google.generativeai as genai
import os
from typing import Dict, Any

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            image_data = data.get('image_data')
            mime_type = data.get('mime_type')
            
            # Your existing Gemini logic here
            result = self.extract_license_info_with_gemini(image_data, mime_type)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def extract_license_info_with_gemini(self, image_data: str, mime_type: str) -> Dict[str, Any]:
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
            
            return {
                "success": True,
                "data": extracted_data
            }
            
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse Gemini response as JSON: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Gemini API error: {str(e)}"
            }