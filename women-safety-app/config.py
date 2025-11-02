import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    UPLOAD_FOLDER = 'app/uploads/evidence'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'm4a', 'mp4', 'mov', 'pdf'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # Gemini AI Configuration (set environment variable GEMINI_API_KEY; do not hardcode)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
