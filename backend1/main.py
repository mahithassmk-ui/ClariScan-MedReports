# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import pdfplumber
import tempfile
import shutil
import os
import time
import re
import requests
from dotenv import load_dotenv

# -----------------------------
# Configure environment + OCR
# -----------------------------
load_dotenv()
pytesseract.pytesseract.tesseract_cmd = r"C:/Users/HP/AppData/Local/Programs/Tesseract-OCR/tesseract.exe"

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
OLLAMA_TIMEOUT_SEC = int(os.getenv("OLLAMA_TIMEOUT_SEC", "300"))

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Radiology Report Simplifier")

origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _clean_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n\n", text)
    return text.strip()


def _llm_simplify_report(raw_text: str) -> str:
    if not OLLAMA_URL or not OLLAMA_MODEL:
        return "[Configuration error: OLLAMA_URL or OLLAMA_MODEL missing in backend/.env.]"

    system_prompt = (
        "You simplify radiology reports for patients. "
        "Use plain language and a calm, non-alarming tone. "
        "Do not provide diagnosis beyond the report. "
        "Do not invent findings. "
        "Output Markdown using exactly these sections:\n"
        "## Easy-to-Understand Report\n"
        "### 1) Why this scan was done\n"
        "### 2) Relevant background\n"
        "### 3) Main findings in simple words\n"
        "### 4) Overall summary\n"
        "### 5) Questions to ask your doctor\n"
        "### 6) Safety note\n"
        "Rules:\n"
        "- Keep reading level around grade 6-8.\n"
        "- Use short bullets.\n"
        "- Expand medical jargon in simple terms.\n"
        "- Include uncertainty if OCR text seems unclear.\n"
        "- In Safety note, include: 'This is educational and not a diagnosis.'\n"
    )

    cleaned = _clean_text(raw_text)
    truncated = cleaned[:14000]
    user_prompt = f"{system_prompt}\n\nRadiology report text:\n\n{truncated}"

    try:
        print(f"[ollama] Requesting model '{OLLAMA_MODEL}' at {OLLAMA_URL}")
        response = requests.post(
            f"{OLLAMA_URL.rstrip('/')}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": user_prompt,
                "stream": False,
                "options": {"temperature": 0.2},
            },
            timeout=OLLAMA_TIMEOUT_SEC,
        )
        response.raise_for_status()
        data = response.json()
        content = (data.get("response") or "").strip()
        print(f"[ollama] Response received, chars={len(content)}")
        return content or "[LLM response was empty.]"
    except requests.exceptions.RequestException as e:
        print(f"[ollama] Request failed: {str(e)}")
        return f"[Ollama request failed: {str(e)}. Ensure Ollama is running and model '{OLLAMA_MODEL}' is installed. Current timeout={OLLAMA_TIMEOUT_SEC}s.]"


# -----------------------------
# Upload and simplify endpoint
# -----------------------------
@app.post("/simplify")
async def simplify(file: UploadFile = File(...)):
    start_time = time.time()
    filename = file.filename.lower()
    content = ""
    print(f"[simplify] Received file: {filename}")

    try:
        if filename.endswith(".pdf"):
            try:
                with pdfplumber.open(file.file) as pdf:
                    content = "\n".join([page.extract_text() or "" for page in pdf.pages])
                if not content.strip():
                    return {"simplified_text": "[No text found in PDF.]"}
            except Exception as e:
                return {"simplified_text": f"[Error reading PDF: {str(e)}]"}
        elif filename.endswith((".jpg", ".jpeg", ".png")):
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
                    shutil.copyfileobj(file.file, tmp)
                    tmp_path = tmp.name

                image = Image.open(tmp_path)
                content = pytesseract.image_to_string(image, timeout=20)
                os.remove(tmp_path)

                if not content.strip():
                    return {"simplified_text": "[No text found in image.]"}
            except Exception as e:
                return {"simplified_text": f"[Image processing error: {str(e)}]"}
        else:
            return {"simplified_text": "[Unsupported file type. Upload PDF or image.]"}

        simplified_text = _llm_simplify_report(content)
        elapsed = round(time.time() - start_time, 2)
        print(f"[simplify] Completed in {elapsed}s")
        return {"simplified_text": simplified_text}
    except Exception as e:
        elapsed = round(time.time() - start_time, 2)
        print(f"[simplify] Failed in {elapsed}s: {str(e)}")
        return {"simplified_text": f"[Unexpected error: {str(e)}]"}
