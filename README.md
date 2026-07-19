# CLARISCAN
Our application is a patient-friendly web app that converts complex radiology reports which is in PDF or image format into clear and understandable summaries.ClariScan is designed to inform and prepare patients—it does not diagnose medical conditions or replace professional medical advice.
Users can upload radiology reports in PDF or image format. The application extracts the report text using OCR when necessary and generates a structured explanation in plain language, helping patients better understand their report before consulting their healthcare provider.

# Features
1. Upload radiology/Lab reports in PDF or image format.
2. OCR-based text extraction for scanned PDFs and images.
3. AI-generated patient-friendly explanations using an LLM.
4. Structured report containing:
    a. Why the scan was performed (when available)
    b. Main findings explained in simple language
    c. Overall report summary
    d. Suggested questions to ask the doctor
    e. Safety note reminding users to consult a healthcare professional
6. Advisory risk indicator to highlight findings that may warrant discussion with a healthcare provider (non-diagnostic).
7. Download or print the simplified report for future reference or to bring to a medical consultation.

# Tech Stack
1. Frontend - Angular
2. Backend - Python FastAPI
3. OCR and parsing - PDF text extraction using pdfplumer
4 Scanned PDF/images -pytesseract
5. LLM Integration - Ollama API

# Prerequisites
1. Node.js v20+ and npm installed
2. Python version 3.10+
3. Tesseract OCR installed
   _[Replace the existing Tesseract path in `main.py` with the path to your local Tesseract installation after installing Tesseract OCR.]
]_
4. Ollama
   
# Backend Setup
### 1.Installed Dependencies
`pip install -r requirements.txt` _[make sure you are inside backend folder. dont forget to do `cd backend`]_

### 2. Start ollama server :
  Make sure you are inside ollama repository
  
  Run command : `.\ollama.exe pull llama3.2:1b`
  
  Run command : `.\ollama.exe serve`
  
  Verify if the ollama is running using the command : `.\ollama.exe list`

### 3.To run the backend : _[ make sure you are inside backend folder. dont forget to do `cd backend`]_
   Run command:  `python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`. _[The API will be available at http://localhost:8000]_

# Frontend Setup

### Install dependencies
`npm install`

### To run the application
`ng serve`

### Note 
Make sure you run Backend commands and Frontend commands in seperate terminals

# Limitations
OCR quality depends on the scan clarity , handwritten texts may be inaccurate.Please make sure that the uploaded PDF or image of radiology reports is a clear image and not a blurred image.

      
