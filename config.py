import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    # Use env var for upload folder, default to local
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'app/uploads/evidence'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'm4a', 'mp4', 'mov', 'pdf'}
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024
    
    # Gemini AI Configuration (from environment)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')
    GEMINI_API_VERSION = os.environ.get('GEMINI_API_VERSION', 'v1')
