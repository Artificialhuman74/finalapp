import { useCallback, useEffect, useState } from 'react';

export const useVoiceGuidance = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string, priority: 'low' | 'high' = 'low') => {
    if (!isSupported) return;

    // Cancel current speech if high priority
    if (priority === 'high' && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, cancel, isSupported, isSpeaking };
};
