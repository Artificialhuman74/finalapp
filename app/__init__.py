from flask import Flask, Response
from datetime import datetime
import os
from sqlalchemy import text
from dotenv import load_dotenv

def create_app():
    # Load environment variables from .env if present
    try:
        load_dotenv()
    except Exception:
        pass
    except Exception:
        pass
    
    # Configure Flask to serve React build
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'your-secret-key-change-this-in-production-2024'
    app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER') or 'app/uploads/evidence'
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
    
    # Database configuration
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    db_path = os.environ.get('DATABASE_PATH') or os.path.join(basedir, 'instance', 'women_safety.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Create database directory BEFORE using it
    db_dir = os.path.dirname(db_path)
    try:
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
    except PermissionError:
        # Fallback to /tmp if the configured path is not writable
        db_path = '/tmp/women_safety.db'
        db_dir = os.path.dirname(db_path)
        os.makedirs(db_dir, exist_ok=True)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
    
    # Create upload folder
    upload_folder = app.config.get('UPLOAD_FOLDER', 'app/uploads/evidence')
    try:
        os.makedirs(upload_folder, exist_ok=True)
    except PermissionError:
        upload_folder = '/tmp/uploads'
        os.makedirs(upload_folder, exist_ok=True)
        app.config['UPLOAD_FOLDER'] = upload_folder
    
    # Initialize database
    from app.models import db
    from app.auth_models import User  # Import User model
    db.init_app(app)
    
    # Create tables
    with app.app_context():
        db.create_all()
