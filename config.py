import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    # Use env var for upload folder, default to local
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'app/uploads/evidence'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'm4a', 'mp4', 'mov', 'pdf'}
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024
    
    # Gemini AI Configuration
    GEMINI_API_KEY = 'AIzaSyB9i7ZuCj9-snQ8wd7udU1JY3lg51XutVQ'  # Get from https://ai.google.dev/
