import React, { useState, useEffect, useRef } from 'react';
import '../styles/SOSCenter.css';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';

interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
}

const SOSCenter: React.FC = () => {
  const [status, setStatus] = useState('Ready.');
  const [locStatus, setLocStatus] = useState('Location idle.');
  const [uploadStatus, setUploadStatus] = useState('None yet.');
  const [shakeEnabled, setShakeEnabled] = useState(true);



  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    if (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
          setShakeEnabled(true);
        } else {
          alert('Permission to access device motion was denied.');
          setShakeEnabled(false);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // Non-iOS 13+ devices
      setPermissionGranted(true);
      setShakeEnabled(true);
    }
  };

  const toggleShake = () => {
    if (!shakeEnabled && !permissionGranted) {
      requestPermission();
    } else {
      setShakeEnabled(!shakeEnabled);
    }
  };

  // ... (rest of the component)


  const [isRecording, setIsRecording] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [countdownCancelled, setCountdownCancelled] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [alertText, setAlertText] = useState('');
  const [batteryLevel, setBatteryLevel] = useState('Unknown');
  const [sosId, setSosId] = useState<string | number | null>(null);

  const sosIdRef = useRef<string | number | null>(null);
  const mimeTypeRef = useRef<string>('video/webm');

  useEffect(() => {
    sosIdRef.current = sosId;
  }, [sosId]);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const locTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const slideThumbRef = useRef<HTMLDivElement>(null);
  const slideTrackRef = useRef<HTMLDivElement>(null);

  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const isSecure = window.isSecureContext || window.location.protocol === 'https:';

  useEffect(() => {
    fetchEmergencyContacts();
    checkLocationPermission();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const res = await fetch('/api/emergency-contacts');
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const checkLocationPermission = () => {
    if ('permissions' in navigator && typeof navigator.permissions.query === 'function') {
      try {
        navigator.permissions.query({ name: 'geolocation' }).then((res) => {
          const map: { [key: string]: string } = {
            granted: 'Location ready.',
            prompt: 'Location permission will be requested on SOS.',
            denied: 'Location permission denied. Enable it in site settings.'
          };
          if (res?.state) setLocStatus(map[res.state] || 'Location status unknown.');
          if (res) {
            res.onchange = () => {
              if (res.state) setLocStatus(map[res.state] || 'Location status changed.');
            };
          }
        });
      } catch (_) {
        // ignore
      }
    }
  };

  const playAlarm = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'square' as OscillatorType;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const startAlarm = () => {
    playAlarm();
    alarmIntervalRef.current = setInterval(playAlarm, 500);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const startMedia = async () => {
    if (mediaStreamRef.current) return mediaStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
        previewRef.current.style.display = 'block';
        previewRef.current.play().catch(() => { });
      }
      return stream;
    } catch (e: any) {
      const reason = e?.name || 'UnknownError';
      const errorMessages: { [key: string]: string } = {
        NotAllowedError: 'Permission denied by user or browser.',
        NotFoundError: 'No camera/microphone found.',
        SecurityError: 'Blocked by insecure connection. Use HTTPS.',
        NotReadableError: 'Hardware in use by another app.'
      };
      setStatus(errorMessages[reason] || 'Could not access camera/mic.');
      throw e;
    }
  };

  const startRecorder = () => {
    if (!mediaStreamRef.current) return;
    chunksRef.current = [];

    let options;
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4' };
      mimeTypeRef.current = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      options = { mimeType: 'video/webm;codecs=vp9,opus' };
      mimeTypeRef.current = 'video/webm;codecs=vp9,opus';
    } else {
      options = { mimeType: 'video/webm' };
      mimeTypeRef.current = 'video/webm';
    }

    try {
      recorderRef.current = new MediaRecorder(mediaStreamRef.current, options);
    } catch (_) {
      recorderRef.current = new MediaRecorder(mediaStreamRef.current);
    }
    recorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size) chunksRef.current.push(e.data);
    };
    recorderRef.current.onstop = uploadRecording;
    recorderRef.current.start(1000);
  };

  const uploadRecording = async () => {
    try {
      const type = mimeTypeRef.current.split(';')[0];
      const ext = type === 'video/mp4' ? 'mp4' : 'webm';
      const blob = new Blob(chunksRef.current, { type: type });
      const form = new FormData();
      form.append('recording', blob, `sos_${Date.now()}.${ext}`);
      form.append('sosId', sosIdRef.current?.toString() || '');

      const res = await fetch('/api/upload-recording', { method: 'POST', body: form });
      const data = await res.json();
      if (data?.fileUrl) {
        setUploadStatus('Uploaded: ' + data.fileUrl);
        setStatus('Recording uploaded');
      } else {
        setUploadStatus('Upload complete.');
        setStatus('Recording uploaded');
      }
    } catch (e) {
      setUploadStatus('Upload failed.');
      setStatus('Upload failed');
    }
  };

  const startLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocStatus('Geolocation not available');
      return;
    }

    const tick = () =>
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocStatus(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
          if (sosId) {
            fetch('/api/sos-live', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sosId,
                latitude,
                longitude,
                timestamp: new Date().toISOString()
              })
            }).catch(() => { });
          }
        },
        (err) => {
          setLocStatus('Location error: ' + err.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
      );

    tick();
    if (locTimerRef.current) clearInterval(locTimerRef.current);
    locTimerRef.current = setInterval(tick, 60000);
  };

  const beginSOS = async () => {
    if (contacts.length < 3) {
      setStatus('⚠️ Please add at least 3 emergency contacts first!');
      setTimeout(() => {
        window.location.href = '/emergency-contacts';
      }, 2000);
      return;
    }

    setShowCountdown(true);
    setCountdownCancelled(false);
    setCountdown(5);
    startAlarm();

    for (let i = 5; i >= 1; i--) {
      if (countdownCancelled) {
        setShowCountdown(false);
        stopAlarm();
        setStatus('SOS cancelled.');
        return;
      }

      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
    }

    stopAlarm();
    setShowCountdown(false);
    setSosActive(true);
    setStatus('SOS ACTIVATED!');

    startLocation();

    // Get battery level
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        setBatteryLevel(Math.round(battery.level * 100).toString());
      }
    } catch (_) {
      // ignore
    }

    // Log SOS
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: (window as any).currentUser || 'Anonymous',
          time: new Date().toISOString(),
          triggeredBy: 'Button',
          battery: batteryLevel,
          location: locStatus.includes('Lat:') ? {
            latitude: parseFloat(locStatus.split('Lat: ')[1].split(',')[0]),
            longitude: parseFloat(locStatus.split('Lng: ')[1])
          } : undefined
        })
      });
      const data = await res.json();
      setSosId(data?.sosId || Date.now());
    } catch (e) {
      console.error('SOS logging failed:', e);
    }

    // Start recording
    if (isSecure || isLocalhost) {
      try {
        await startMedia();
        startRecorder();
        setIsRecording(true);
        setStatus('Recording… <span class="recording-dot"></span>');
      } catch (_) {
        setStatus('⚠️ SOS Active (recording failed)');
      }
    } else {
      setStatus('⚠️ SOS Active! Location tracked. (Recording requires HTTPS)');
    }

    // Send alerts directly (SMS + WhatsApp) without prompting
    sendDirectAlerts();
  };

  const stopSOS = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
      setStatus('Stopped. Uploading…');
    } else {
      setStatus('SOS ended.');
      setUploadStatus('No recording (HTTP mode).');
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (locTimerRef.current) {
      clearInterval(locTimerRef.current);
      locTimerRef.current = null;
    }

    setSosActive(false);
    setIsRecording(false);
  };

  const sanitizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

  const sendDirectAlerts = () => {
    const userName = (window as any).currentUser || 'User';
    const trackUrl = `${window.location.origin}/track/${sosId || Date.now()}`;
    const batteryText = batteryLevel === 'Unknown' ? 'Unknown' : `${batteryLevel}%`;
    const baseText = `🚨 EMERGENCY ALERT from ${userName}. I'm in danger and need help. Live location: ${trackUrl}\nBattery: ${batteryText}\nPlease check in immediately.`;
    setAlertText(baseText);

    if (!contacts.length) {
      setStatus('SOS active. No contacts saved.');
      return;
    }

    // Open SMS for the first contact
    const first = contacts[0];
    const smsUrl = `sms:${first.phone}?body=${encodeURIComponent(baseText)}`;
    try {
      window.location.href = smsUrl;
    } catch (_) {
      // ignore
    }

    // Open WhatsApp chats for all contacts in background tabs (best-effort)
    contacts.forEach((c, idx) => {
      const waNumber = sanitizePhone(c.phone);
      if (!waNumber) return;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(baseText)}`;
      setTimeout(() => {
        try { window.open(waUrl, '_blank'); } catch (_) { /* ignore */ }
      }, idx * 200);
    });

    setShowWhatsAppModal(false);
  };

  const handleSlideStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!slideThumbRef.current) return;
    slideThumbRef.current.style.cursor = 'grabbing';
  };

  const handleSlideCancel = () => {
    setCountdownCancelled(true);
  };

  useEffect(() => {
    if (!shakeEnabled) return;

    // Check if permission is needed but not granted (for initial load on non-iOS)
    if (!permissionGranted && typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
      setPermissionGranted(true);
    }

    const threshold = 15;
    let lastX = 0, lastY = 0, lastZ = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const { x, y, z } = acc;
      if (x === null || y === null || z === null) return;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > threshold) {
        if (!sosActive && !showCountdown) {
          beginSOS();
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [shakeEnabled, sosActive, showCountdown]);

  const handleTestRecording = async () => {
    try {
      setStatus('Testing recording... (Alerts disabled)');
      await startMedia();
      startRecorder();
      setIsRecording(true);
    } catch (e: any) {
      setStatus('Test failed: ' + (e.message || 'Camera error'));
    }
  };

  return (
    <div className="sos-container sylvie-landing">
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />
      {/* Countdown Overlay */}
      {showCountdown && (
        <div className="countdown-overlay active">
          <div className="countdown-content">
            <div className="countdown-number">{countdown}</div>
            <div className="countdown-text">Emergency SOS Activating</div>
            <div className="countdown-warning">🚨 Your emergency contacts will be alerted 🚨</div>
            <div className="slide-to-cancel-container">
              <div className="slide-to-cancel-track" ref={slideTrackRef}></div>
              <div
                className="slide-to-cancel-thumb"
                ref={slideThumbRef}
                onMouseDown={handleSlideStart}
                onTouchStart={handleSlideStart}
              >
                ➜
              </div>
              <div className="slide-to-cancel-text">Slide to Cancel</div>
            </div>
            <button
              onClick={handleSlideCancel}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel SOS
            </button>
          </div>
        </div>
      )}

      {/* Main SOS Hero - Single Container Layout */}
      <div className="sos-hero" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card-lite" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '40px' }}>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="sos-title" style={{ fontSize: '28px', margin: 0 }}>SOS Center</h2>
            <a href="tel:181" className="btn btn-sm btn-light" style={{ fontWeight: 'bold' }}>
              Call 181
            </a>
          </div>

          <p className="mb-4" style={{ fontSize: '16px', color: '#666' }}>
            Trigger SOS to auto-record and share live location.
          </p>

          <div className="d-grid gap-3 mb-4">
            <button
              className="btn-sos"
              onClick={beginSOS}
              disabled={sosActive || isRecording}
              style={{ opacity: sosActive || isRecording ? 0.5 : 1, fontSize: '24px', padding: '24px' }}
            >
              🚨 Start SOS
            </button>

            {(sosActive || isRecording) && (
              <button className="btn btn-stop" onClick={stopSOS}>
                ⛔ Stop & Upload
              </button>
            )}
          </div>

          <div className="status-container mb-4" style={{ background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '12px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontWeight: '600' }}>Live Location:</span>
              <span className="small">{locStatus}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontWeight: '600' }}>Status:</span>
              <span className="small" dangerouslySetInnerHTML={{ __html: status }}></span>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleTestRecording}
              disabled={sosActive || isRecording}
            >
              Test recording
            </button>
            <button
              className={`btn btn-sm ${shakeEnabled ? 'btn-light' : 'btn-ghost'}`}
              onClick={toggleShake}
              style={{ border: shakeEnabled ? '1px solid #ff6b6b' : '1px solid #ccc', color: shakeEnabled ? '#ff6b6b' : '#666' }}
            >
              {shakeEnabled ? 'Disable Shake to SOS' : 'Enable Shake to SOS'}
            </button>
          </div>

          <video ref={previewRef} playsInline muted style={{ display: 'none', width: '100%', marginTop: '20px', borderRadius: '12px' }} />
        </div>
      </div>

      {/* WhatsApp Modal */}
      {/* WhatsApp modal disabled: direct alerts now sent automatically */}
    </div>
  );
};

export default SOSCenter;
