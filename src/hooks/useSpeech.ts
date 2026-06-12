import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechReturn {
  isSpeaking: boolean;
  isListening: boolean;
  supported: {
    speechSynthesis: boolean;
    speechRecognition: boolean;
  };
  speak: (text: string, onStart?: () => void, onEnd?: () => void) => void;
  listen: (onResult: (text: string) => void, onEnd?: () => void) => void;
  stopListening: () => void;
  cancelSpeech: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState({
    speechSynthesis: false,
    speechRecognition: false,
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const hasSynth = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const SpeechRecognition = typeof window !== 'undefined' && 
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const hasRecog = !!SpeechRecognition;

    setSupported({
      speechSynthesis: hasSynth,
      speechRecognition: hasRecog,
    });

    if (hasRecog) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    }
  }, []);

  const speak = useCallback((text: string, onStart?: () => void, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Fallback if not supported
      onStart?.();
      setIsSpeaking(true);
      setTimeout(() => {
        setIsSpeaking(false);
        onEnd?.();
      }, Math.min(3000, text.length * 50));
      return;
    }

    // Cancel active synthesis
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to set a pleasant, realistic boy/male voice
    const voices = window.speechSynthesis.getVoices();
    
    const preferredVoiceName = typeof window !== 'undefined' ? localStorage.getItem('preferred_voice_name') : null;
    let selectedVoice = null;
    
    if (preferredVoiceName) {
      selectedVoice = voices.find(v => v.name === preferredVoiceName);
    }
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.name.includes('Google US English') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.name.includes('Google') && v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Daniel') || v.name.includes('Microsoft David'))
        || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
        || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('samantha') && !v.name.toLowerCase().includes('hazel'))
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1.05; // Friendly conversational rate
    utterance.pitch = 1.08; // Youthful boy-like assistant tone

    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const listen = useCallback((onResult: (text: string) => void, onEnd?: () => void) => {
    if (!recognitionRef.current) {
      // Fallback simulation if speech recognition is not supported
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        onResult("This is a simulated mic input because SpeechRecognition is not supported in this browser environment.");
        onEnd?.();
      }, 2000);
      return;
    }

    try {
      const recognition = recognitionRef.current;
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        onResult(resultText);
      };

      recognition.onend = () => {
        setIsListening(false);
        onEnd?.();
      };

      recognition.onerror = (e: any) => {
        console.error('SpeechRecognition error:', e);
        setIsListening(false);
        onEnd?.();
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
    setIsListening(false);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    isListening,
    supported,
    speak,
    listen,
    stopListening,
    cancelSpeech,
  };
}
