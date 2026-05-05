import os
import secrets

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
    UPLOAD_FOLDER = 'app/uploads/evidence'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'm4a', 'mp4', 'mov', 'pdf'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    # Gemini AI — set GEMINI_API_KEY in environment (never hardcode)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
