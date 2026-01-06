from app import create_app
from app.models import db, SOSAlert
from app.auth_models import User

app = create_app()

with app.app_context():
    # Find the latest alert for user Vrunda (ID 4)
    # In a real scenario, we'd look up the user by name, but I know the ID from the debug output.
    # Or I can look up by username "Vrunda"
    user = User.query.filter_by(username="Vrunda").first()
    if not user:
        print("User Vrunda not found")
        exit(1)
        
    alert = SOSAlert.query.filter_by(user_id=user.id).order_by(SOSAlert.trigger_time.desc()).first()
    
    if alert:
        print(f"Found latest alert: ID {alert.id} at {alert.trigger_time}")
        # The video file from the log
        video_url = "/uploads/sos/recordings/20260105_142756_sos_1767623244386.webm"
        alert.video_recording_url = video_url
        db.session.commit()
        print(f"Updated alert {alert.id} with video URL: {video_url}")
    else:
        print("No alerts found for user")
