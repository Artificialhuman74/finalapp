from app import create_app
from app.models import SOSAlert
from app.auth_models import User

app = create_app()

with app.app_context():
    print("\n=== Checking Users ===")
    users = User.query.all()
    for u in users:
        print(f"User: {u.username} (ID: {u.id})")

    print("\n=== Checking SOS Alerts ===")
    alerts = SOSAlert.query.all()
    print(f"Total Alerts: {len(alerts)}")
    
    for alert in alerts:
        print(f"Alert ID: {alert.id} | User ID: {alert.user_id}")
        print(f"  Trigger Time: {alert.trigger_time}")
        print(f"  Video URL: '{alert.video_recording_url}'")
        print(f"  Audio URL: '{alert.audio_recording_url}'")
        print("-" * 30)
