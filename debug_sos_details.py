from app import create_app
from app.models import SOSAlert
from app.auth_models import User

app = create_app()

with app.app_context():
    print("\n=== SOS Alerts Detail Debug ===")
    # Get alerts for Vrunda
    user = User.query.filter_by(username="Vrunda").first()
    if not user:
        print("User Vrunda not found")
        exit()
        
    alerts = SOSAlert.query.filter_by(user_id=user.id).order_by(SOSAlert.trigger_time.desc()).all()
    
    for alert in alerts:
        print(f"ID: {alert.id}")
        print(f"  Time (DB): {alert.trigger_time} (Type: {type(alert.trigger_time)})")
        print(f"  Location: Lat={alert.latitude}, Lon={alert.longitude}")
        print(f"  Video URL: {alert.video_recording_url}")
        print("-" * 30)
