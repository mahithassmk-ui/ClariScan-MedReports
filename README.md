# CLARISCAN
Our application is a patient-friendly web app that converts complex radiology reports which is in PDF or image format into clear and understandable summaries
Users upload a report and our application extracts text and simplifies it into patient-friendly language,including a risk indicator and a structured report with:
  1. Why was the scan done
  2. Relevant background
  3. Main findings in simple terms
  4. Overall summary
  5. Questions patientscan ask their doctor
  6. A safety note for patients using our application
The generated summary can be downloaded or printed for later review or to share during a doctor consultation 

# FEATURES
1. Upload PDF/Images of radiology reports
2. OCR + text extraction (handles scanned PDFs and images)
3. Patient-friendly summary generated via LLM (Ollama)
4. Risk indicator (non-clinical , adviosry)
5. Structured sections(why scan,background findings,summary,questions to ask to doctor,safety note)
6. Download and Print the simplified summary

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
   _[Current path given in the codebase is C:\Users\HP\AppData\Local\Programs\Tesseract-OCR\tesseract.exe.If your Tesseract is installed elsewhere,update the path in main.py file]_
4. Optional : Ollama running locally

# Backend Setup
### 1.Installed Dependencies
pip install -r requirements.txt

### 2.Environment Variables
Create a .env fil which includes
  1. OLLAMA_API_KEY
  2. OLLAMA_MODE
  3. OLLAMA_URL

3. To rn the backend , use command python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000. The API will be available at http://localhost:8000
4. Optional : Start ollama server with the command ollama serve and pull the required model using the command ollama pull llama3.2:1b
_[If the pull responds OK , the model is available locally . Keep the OLLAMA_MODEL = llama3.2:1b and OLLAMA_URL = http://127.0.0.1:11434 in .env]_

# Frontend Setup

### Install dependencies
npm install

### To run the application
ng serve

# Limitations
OCR quality depends on the scan clarity , handwritten texts may be inaccurate.Please make sure that the uploaded PDF or image of radiology reports is a clear image and not a blurred image.

      
