import React, { useState, useRef, useEffect, useCallback } from 'react';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';

type CallMode = 'select' | 'ai' | 'emergency';
type CallState = 'idle' | 'incoming' | 'connected';

// Local WhatsApp ringtone from public folder
const RINGTONE_URL = '/audio/whatsapp-ringtone.mp3';
const CONVERSATION_URL = '/audio/conversation.mp3';

const FakeCall: React.FC = () => {
  const [mode, setMode] = useState<CallMode>('select');
  const [callState, setCallState] = useState<CallState>('idle');
  const [callerName, setCallerName] = useState('Mom');
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<{ who: string; text: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [customAudioPath, setCustomAudioPath] = useState<string | null>(null);
  const [voiceReady, setVoiceReady] = useState(false);
  const [voiceError, setVoiceError] = useState(false);
  const [lastTts, setLastTts] = useState<string | null>(null);

  // Fetch user profile on mount to check for custom audio
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/profile/export');
        if (res.ok) {
          const data = await res.json();
          if (data.fake_call_audio_path) {
            setCustomAudioPath(data.fake_call_audio_path);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioUnlockedRef = useRef(false);
  const conversationAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on first user interaction
  const initAudio = useCallback(() => {
    if (!ringtoneRef.current) {
      const audio = new Audio(RINGTONE_URL);
      audio.loop = true;
      audio.preload = 'auto';
      ringtoneRef.current = audio;

      // Test load
      audio.load();
      audio.addEventListener('canplaythrough', () => setAudioReady(true));
    }
  }, []);

  // iOS Safari needs a user-gesture unlock for both AudioContext and speechSynthesis
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;

    try {
      window.speechSynthesis?.resume();
    } catch (_) { /* ignore */ }

    // Create a short silent audio burst to unlock playback
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AC) {
      try {
        const ctx = new AC();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (_) { /* ignore */ }
    }

    // Prime TTS engine with a silent utterance on iOS
    if (window.speechSynthesis) {
      try {
        const test = new SpeechSynthesisUtterance(' ');
        test.volume = 0;
        test.rate = 10;
        window.speechSynthesis.speak(test);
      } catch (_) { /* ignore */ }
    }

    audioUnlockedRef.current = true;
    setVoiceReady(true);
  }, []);

  // Best-effort auto unlock on first user gesture (touch/click)
  useEffect(() => {
    const onGesture = () => unlockAudio();
    window.addEventListener('touchend', onGesture, { once: true, passive: true });
    window.addEventListener('click', onGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('touchend', onGesture);
      window.removeEventListener('click', onGesture);
    };
  }, [unlockAudio]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis?.cancel(); // Stop TTS on unmount
      if (conversationAudioRef.current) {
        conversationAudioRef.current.pause();
        conversationAudioRef.current = null;
      }
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, []);

  // Call timer
  useEffect(() => {
    if (callState === 'connected') {
      callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callState]);

  // Preload voices
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Refs to break circular dependencies
  const converseWithAIRef = useRef<any>(null);
  const startListeningRef = useRef<any>(null);
  const stopListeningRef = useRef<any>(null);

  // Humanized TTS
  const speak = useCallback((text: string, allowFallback: boolean = true) => {
    setLastTts(text);
    const playConversationFallback = () => {
      if (!allowFallback) {
        setVoiceError(true);
        return;
      }
      unlockAudio();
      if (!conversationAudioRef.current) {
        const audio = new Audio(CONVERSATION_URL);
        audio.preload = 'auto';
        (audio as any).playsInline = true;
        conversationAudioRef.current = audio;
      }
      conversationAudioRef.current.currentTime = 0;
      conversationAudioRef.current.play().catch(() => { /* ignore */ });
    };

    if (!window.speechSynthesis) {
      playConversationFallback();
      return;
    }

    // Ensure audio is unlocked before TTS
    unlockAudio();
    setVoiceError(false);

    window.speechSynthesis.cancel();

    // Stop listening while speaking
    if (stopListeningRef.current) stopListeningRef.current();

    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice = voices.find(v =>
      v.name.includes('Google US English') ||
      v.name.includes('Google UK English Female') ||
      v.name.includes('Microsoft Zira') ||
      v.name.includes('Samantha')
    ) || voices.find(v => /en.?US/i.test(v.lang));

    if (preferredVoice) u.voice = preferredVoice;
    u.rate = 1.0; // Normal speed is often more natural for high-quality voices
    u.pitch = 1.0; // Natural pitch
    u.volume = 1.0;
    u.volume = 1.0;

    const fallbackTimer = setTimeout(playConversationFallback, 3000);

    u.onstart = () => {
      clearTimeout(fallbackTimer);
      setVoiceReady(true);
      setVoiceError(false);
    };

    u.onerror = () => {
      clearTimeout(fallbackTimer);
      playConversationFallback();
    };

    // Resume listening after speech ends
    u.onend = () => {
      clearTimeout(fallbackTimer);
      if (callState === 'connected' && mode === 'ai') {
        if (startListeningRef.current) startListeningRef.current();
      }
    };

    try {
      // Try to resume engine (needed on iOS/Safari)
      try { window.speechSynthesis.resume(); } catch (_) { /* ignore */ }
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (_) { /* ignore */ }
      }
      window.speechSynthesis.speak(u);
    } catch (_) {
      clearTimeout(fallbackTimer);
      playConversationFallback();
    }
  }, [callState, mode, unlockAudio]);

  // Auto-retry TTS once audio is unlocked after an error
  useEffect(() => {
    if (voiceReady && voiceError && lastTts) {
      // retry without fallback to avoid emergency clip
      speak(lastTts, false);
    }
  }, [voiceReady, voiceError, lastTts, speak]);

  // AI conversation
  const converseWithAI = useCallback(async (userText: string = '') => {
    setAiThinking(true);
    try {
      const priming = "Roleplay as my close family member calling me. Speak casually and naturally. Use fillers like 'um', 'uh', 'like' occasionally to sound human. Keep replies short (5-15 words). Do NOT mention being an AI.";
      const msg = userText ? `${priming}\nUser said: ${userText}` : `${priming}\nStart the call with a natural opener asking if I'm okay.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg, persona: callerName })
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      const reply = data?.message || "Hey! How are you doing? Is everything okay?";
      setTranscript(prev => [...prev, { who: callerName, text: reply }]);
      speak(reply, false);
    } catch (err) {
      // Silent fallback - don't warn console to avoid alarming user
      // Fallback simulation if AI fails
      const fallbacks = [
        "Hey sweetie! I was just calling to check on you. Are you safe?",
        "I can't hear you very well, but I'm here. Just keep walking.",
        "That sounds good. I'll stay on the line with you.",
        "Okay, I understand. I'm listening.",
        "Love you too. Be careful okay?",
        "I'm right here with you. Don't worry.",
        "Just keep talking to me, I'm listening."
      ];

      // Cycle through fallbacks based on how many times we've fallen back
      // Count how many AI responses are already in transcript to determine next index
      const aiResponseCount = transcript.filter(t => t.who === callerName).length;
      const index = aiResponseCount % fallbacks.length;
      const fallback = fallbacks[index];

      setTranscript(prev => [...prev, { who: callerName, text: fallback }]);
      speak(fallback);
    } finally {
      setAiThinking(false);
    }
  }, [callerName, speak, transcript.length]);

  // Update ref
  useEffect(() => {
    converseWithAIRef.current = converseWithAI;
  }, [converseWithAI]);

  // Speech recognition
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // If already listening, don't restart
    if (isListening && recognitionRef.current) return;

    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = false;
    r.continuous = true;

    r.onresult = (e: any) => {
      const results = e.results;
      const lastResult = results[results.length - 1];
      const txt = lastResult?.[0]?.transcript?.trim() || '';
      if (txt) {
        setTranscript(prev => [...prev, { who: 'You', text: txt }]);
        // Use ref to call converseWithAI to avoid circular dependency
        if (converseWithAIRef.current) {
          converseWithAIRef.current(txt);
        }
      }
    };

    r.onend = () => {
      // Auto-restart if supposed to be listening
      if (isListening && callState === 'connected') {
        try { r.start(); } catch { }
      }
    };

    recognitionRef.current = r;
    setIsListening(true);
    try { r.start(); } catch { }
  }, [callState, isListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
      recognitionRef.current = null;
    }
  }, []);

  // Update refs
  useEffect(() => {
    startListeningRef.current = startListening;
    stopListeningRef.current = stopListening;
  }, [startListening, stopListening]);

  // Play ringtone
  const playRingtone = useCallback(() => {
    initAudio();

    // Use Web Audio API as fallback
    if (ringtoneRef.current) {
      ringtoneRef.current.currentTime = 0;
      const playPromise = ringtoneRef.current.play();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn('Ringtone play failed, trying alternative:', err);
          // Try alternative approach
          const audio = new Audio(RINGTONE_URL);
          audio.loop = true;
          audio.play().catch(() => { });
          ringtoneRef.current = audio;
        });
      }
    }

    // Vibrate
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
    }
  }, [initAudio]);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  // Call handlers
  const startCall = useCallback((selectedMode: 'ai' | 'emergency') => {
    initAudio();
    unlockAudio();
    setMode(selectedMode);
    setCallState('incoming');
    setCallDuration(0);
    setTranscript([]);

    // Small delay to ensure click is registered before playing audio
    setTimeout(() => {
      playRingtone();
    }, 50);
  }, [initAudio, playRingtone]);

  const handleAnswer = useCallback(() => {
    unlockAudio();
    stopRingtone();
    setCallState('connected');

    if (mode === 'ai') {
      // iOS requires TTS to start during user gesture - speak immediately before async AI call
      const tempText = "Hi, I'm calling to check on you.";
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.resume();
          const tempU = new SpeechSynthesisUtterance(tempText);
          tempU.volume = 1.0;
          tempU.rate = 1.0;
          tempU.pitch = 1.0;
          window.speechSynthesis.speak(tempU);
        } catch (_) { /* ignore */ }
      }
      // Then get AI response (will replace with real response when ready)
      converseWithAI('');
      // Don't start listening yet - wait for AI to speak first
    } else {
      // For emergency mode, check for custom audio
      if (customAudioPath) {
        const audio = new Audio(customAudioPath);
        audio.play().catch(e => console.error("Failed to play custom audio", e));
      } else {
        // Fallback to TTS
        setTimeout(() => speak("Hey! I'm so glad I caught you. How's everything going?", true), 500);
        setTimeout(() => speak("That's great to hear. I was just calling to check in on you.", true), 5000);
        setTimeout(() => speak("Okay, well I'll let you go. Stay safe! Love you!", true), 12000);
      }
    }
  }, [mode, converseWithAI, speak, stopRingtone, customAudioPath]);

  const handleDecline = useCallback(() => {
    stopRingtone();
    stopListening();
    window.speechSynthesis?.cancel();
    if (conversationAudioRef.current) {
      conversationAudioRef.current.pause();
      conversationAudioRef.current.currentTime = 0;
    }
    setCallState('idle');
    setMode('select');
  }, [stopRingtone, stopListening]);

  // Styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fbeff6 0%, #fff8f4 100%)',
    padding: '40px 20px',
    paddingBottom: '120px'
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: '500px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    textAlign: 'center'
  };

  const optionCardStyle = (color: string): React.CSSProperties => ({
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    borderRadius: '16px',
    padding: '28px 24px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: `0 8px 24px ${color}50`,
    border: 'none',
    width: '100%',
    textAlign: 'left' as const
  });

  // Mode selection screen
  if (mode === 'select') {
    return (
      <div style={containerStyle}>
        <FloatingDecorations />
        <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />

        <div style={cardStyle}>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: '#2d1b69', fontWeight: 800 }}>
            📞 Fake Call
          </h1>
          <p style={{ margin: '0 0 24px', color: '#6b5b8d', fontSize: '15px' }}>
            Choose a call mode to escape uncomfortable situations
          </p>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Caller name (e.g., Mom, Dad, Friend)"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              onClick={initAudio}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '14px',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* AI Call Option */}
            <button
              onClick={() => startCall('ai')}
              style={optionCardStyle('#8B5CF6')}
            >
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🤖</div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>AI-Powered Call</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Real-time AI voice conversation. Responds naturally to what you say.
              </div>
              <div style={{
                marginTop: '12px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '12px',
                display: 'inline-block',
                fontWeight: 600
              }}>
                ✨ Recommended
              </div>
            </button>

            {/* Emergency Backup Option */}
            <button
              onClick={() => startCall('emergency')}
              style={optionCardStyle('#22C55E')}
            >
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚨</div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Emergency Backup</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Pre-recorded conversation. Works offline without AI.
              </div>
            </button>
          </div>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            borderLeft: '4px solid #8b5cf6',
            textAlign: 'left'
          }}>
            <strong style={{ color: '#2d3748', fontSize: '14px' }}>💡 Quick Tips:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#4a5568', fontSize: '13px', lineHeight: '1.6' }}>
              <li>Use AI Call for realistic two-way conversation</li>
              <li>Use Emergency Backup if AI isn't working</li>
              <li>Keep phone visible to look natural</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Call screen
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(180deg, #fbeff6 0%, #fff8f4 100%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto',
      padding: '20px 0'
    }}>
      <div style={{
        background: 'white',
        width: '90%',
        maxWidth: '400px',
        borderRadius: '32px',
        padding: '48px 28px',
        paddingBottom: '120px',
        textAlign: 'center',
        boxShadow: '0 25px 80px rgba(45, 27, 105, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        margin: 'auto'
      }}>
        {/* Avatar */}
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: mode === 'ai'
            ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
            : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '64px',
          color: 'white',
          fontWeight: 700,
          marginBottom: '20px',
          boxShadow: mode === 'ai'
            ? '0 12px 32px rgba(139, 92, 246, 0.3)'
            : '0 12px 32px rgba(34, 197, 94, 0.3)',
          animation: callState === 'incoming' ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}>
          {callerName.charAt(0).toUpperCase()}
        </div>

        {/* Caller name */}
        <div style={{ fontWeight: 800, fontSize: '28px', color: '#2d1b69', marginBottom: '4px' }}>
          {callerName}
        </div>

        {/* Call status */}
        <div style={{ color: '#6b5b8d', fontSize: '16px', fontWeight: 500, marginBottom: '12px' }}>
          {callState === 'incoming' ? (
            mode === 'ai' ? '🤖 AI-Powered Call...' : '📞 Incoming Call...'
          ) : (
            <>✅ Connected • {formatDuration(callDuration)}</>
          )}
        </div>

        {/* Mode badge */}
        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          background: mode === 'ai' ? '#EDE9FE' : '#DCFCE7',
          color: mode === 'ai' ? '#7C3AED' : '#16A34A',
          marginBottom: '20px'
        }}>
          {mode === 'ai' ? '🤖 AI Mode' : '🚨 Emergency Mode'}
        </div>

        {/* AI transcript */}
        {mode === 'ai' && callState === 'connected' && transcript.length > 0 && (
          <div style={{
            background: '#f8fafc',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '20px',
            maxHeight: '160px',
            overflowY: 'auto',
            textAlign: 'left',
            fontSize: '14px',
            border: '1px solid #e2e8f0'
          }}>
            {transcript.map((t, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <strong style={{ color: t.who === 'You' ? '#8B5CF6' : '#22C55E' }}>
                  {t.who}:
                </strong>{' '}
                <span style={{ color: '#334155' }}>{t.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status indicators */}
        {aiThinking && (
          <div style={{ color: '#8B5CF6', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
            🤔 AI is thinking...
          </div>
        )}
        {isListening && (
          <div style={{ color: '#22C55E', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
            🎤 Listening...
          </div>
        )}
        {voiceError && mode === 'ai' && (
          <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>
            Voice blocked. Tap below to enable audio, then answer again.
          </div>
        )}
        {!voiceReady && mode === 'ai' && (
          <button
            onClick={unlockAudio}
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '2px solid #8B5CF6',
              background: '#F5F3FF',
              color: '#4C1D95',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Enable AI voice
          </button>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '28px', justifyContent: 'center', marginTop: '24px' }}>
          {callState === 'incoming' ? (
            <>
              {/* Decline */}
              <button
                onClick={handleDecline}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  fontSize: '32px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>

              {/* Accept */}
              <button
                onClick={handleAnswer}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: 'white',
                  fontSize: '32px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✓
              </button>
            </>
          ) : (
            <>
              {/* Mic toggle (AI mode only) */}
              {mode === 'ai' && (
                <button
                  onClick={() => isListening ? stopListening() : startListening()}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isListening
                      ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                      : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white',
                    fontSize: '28px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  🎤
                </button>
              )}

              {/* End call */}
              <button
                onClick={handleDecline}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                📞
              </button>
            </>
          )}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default FakeCall;
