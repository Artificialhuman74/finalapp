import os
import json
from app import create_app
from app.models import SOSAlert
from app.auth_models import User

app = create_app()

def check_sos_videos():
    with app.app_context():
        print("Checking Database Alerts...")
        alerts = SOSAlert.query.all()
        print(f"Total Alerts in DB: {len(alerts)}")
        for alert in alerts:
            print(f"Alert ID: {alert.id}, User ID: {alert.user_id}, Video URL: {alert.video_recording_url}")

        print("\nChecking Recordings Log...")
        logs_dir = os.path.join('app', 'uploads', 'sos', 'logs')
        log_path = os.path.join(logs_dir, 'recordings_log.json')
        
        if os.path.exists(log_path):
            try:
                with open(log_path, 'r') as f:
                    data = json.load(f)
                print(f"Total Entries in Log: {len(data)}")
                for entry in data:
                    print(f"Log Entry: {entry}")
            except Exception as e:
                print(f"Error reading log: {e}")
        else:
            print("recordings_log.json does not exist")

        print("\nChecking Uploads Directory...")
        rec_dir = os.path.join('app', 'uploads', 'sos', 'recordings')
        if os.path.exists(rec_dir):
            files = os.listdir(rec_dir)
            print(f"Files in recordings dir: {files}")
            
            for fname in files:
                fpath = os.path.join(rec_dir, fname)
                size = os.path.getsize(fpath)
                print(f"\nFile: {fname}, Size: {size} bytes")
                
                # Check header
                with open(fpath, 'rb') as f:
                    header = f.read(12)
                    print(f"  Header (hex): {header.hex()}")
                    
                    # Try to find 'avc1' (H.264) or 'hvc1'/'hev1' (H.265)
                    f.seek(0)
                    content = f.read(4096) # Read first 4KB
                    if b'avc1' in content:
                        print("  Codec Check: Found 'avc1' (H.264) - Should be compatible")
                    elif b'hvc1' in content or b'hev1' in content:
                        print("  Codec Check: Found 'hvc1'/'hev1' (H.265) - Might be incompatible on some browsers")
                    elif b'vp8' in content or b'vp9' in content:
                        print("  Codec Check: Found VP8/VP9 (WebM) - Compatible")
                    else:
                        print("  Codec Check: Could not identify common codec atom in first 4KB")
                    
                # Check URL generation (simulated)
                with app.test_request_context('/'):
                    from flask import url_for
                    from app.routes import _public_url
                    # Simulate request context usually present
                    # We can't easily simulate the exact request headers here without more setup
                    # but we can check what _public_url does with default config
                    
                    rel_url = url_for('main.serve_uploads', filename=f"sos/recordings/{fname}")
                    pub_url = _public_url(rel_url)
                    print(f"  Generated URL: {pub_url}")
        else:
            print("Recordings directory does not exist")

if __name__ == "__main__":
    check_sos_videos()
