import { useCallback, useEffect, useRef, useState } from 'react';
import {
  barsFromLevel,
  isExtensionVoiceContext,
  startExtensionVoiceCapture,
  stopExtensionVoiceCapture,
} from './extension-voice';
import { postMessage } from './vscode';
import {
  applyVoiceModeText,
  loadVoiceDeviceId,
  loadVoiceEngine,
  loadVoiceMode,
  saveVoiceEngine,
  saveVoiceMode,
  VOICE_SETTINGS_EVENT,
  type VoiceEngine,
  type VoiceInputMode,
} from './voice-input-modes';

export type VoiceInputState = 'idle' | 'recording' | 'processing';

const MAX_RECORD_MS = 30_000;
const BAR_COUNT = 14;

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onSendNow?: (text: string) => void;
  getInputBase?: () => string;
}

export function useVoiceInput({
  onTranscript,
  onInterimTranscript,
  onSendNow,
  getInputBase,
}: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [level, setLevel] = useState(0);
  const [decibels, setDecibels] = useState(-60);
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const [mode, setModeState] = useState<VoiceInputMode>(loadVoiceMode);
  const [engine, setEngineState] = useState<VoiceEngine>(loadVoiceEngine);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const requestIdRef = useRef<string | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const speechRef = useRef<SpeechRecognition | null>(null);
  const speechTextRef = useRef('');
  const browserGotResultRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const modeRef = useRef(mode);
  const engineRef = useRef(engine);
  const deviceIdRef = useRef(loadVoiceDeviceId());
  const captureSessionIdRef = useRef<string | null>(null);
  const useExtensionRef = useRef(isExtensionVoiceContext());
  const recordingBaseRef = useRef('');
  const pressingRef = useRef(false);
  const pendingStopRef = useRef(false);
  const interimCallbackRef = useRef(onInterimTranscript);

  useEffect(() => {
    interimCallbackRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    engineRef.current = engine;
  }, [engine]);

  useEffect(() => {
    const syncSettings = () => {
      setModeState(loadVoiceMode());
      setEngineState(loadVoiceEngine());
      deviceIdRef.current = loadVoiceDeviceId();
    };
    window.addEventListener(VOICE_SETTINGS_EVENT, syncSettings);
    return () => window.removeEventListener(VOICE_SETTINGS_EVENT, syncSettings);
  }, []);

  const setMode = useCallback((next: VoiceInputMode) => {
    setModeState(next);
    saveVoiceMode(next);
  }, []);

  const setEngine = useCallback((next: VoiceEngine) => {
    setEngineState(next);
    saveVoiceEngine(next);
  }, []);

  const publishInterim = useCallback((text: string) => {
    setInterimText(text);
    interimCallbackRef.current?.(text);
  }, []);

  const stopAnalyser = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setLevel(0);
    setDecibels(-60);
    setBars(Array(BAR_COUNT).fill(0));
  }, []);

  const cleanupStream = useCallback(() => {
    stopAnalyser();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, [stopAnalyser]);

  const deliverTranscript = useCallback(
    (raw: string) => {
      const text = applyVoiceModeText(modeRef.current, raw);
      if (!text) return;

      const base = recordingBaseRef.current.trim();
      const merged = base ? `${base} ${text}` : text;
      recordingBaseRef.current = '';

      if (onSendNow) {
        onSendNow(merged);
      } else {
        onTranscript(merged);
      }
      setError(null);
    },
    [onSendNow, onTranscript]
  );

  const transcribeCapturedAudio = useCallback((audioBase64: string, mimeType: string) => {
    setState('processing');
    publishInterim('Whisper로 변환 중…');
    const requestId = crypto.randomUUID();
    requestIdRef.current = requestId;
    postMessage('transcribeVoice', { requestId, audioBase64, mimeType });
  }, [publishInterim]);

  const stopRecording = useCallback(() => {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    if (useExtensionRef.current && captureSessionIdRef.current) {
      stopExtensionVoiceCapture(captureSessionIdRef.current);
      return;
    }

    if (speechRef.current) {
      try {
        speechRef.current.stop();
      } catch {
        /* already stopped */
      }
      speechRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else if (mediaRecorderRef.current?.state === 'inactive') {
      cleanupStream();
      mediaRecorderRef.current = null;
    }
  }, [cleanupStream]);

  const startWhisperFromRecorder = useCallback(
    (mimeType: string) => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size < 100) {
        setState('idle');
        setPanelOpen(false);
        setError('녹음이 너무 짧아요. 조금 더 길게 말씀해 주세요.');
        cleanupStream();
        return;
      }

      setState('processing');
      publishInterim('Whisper로 변환 중…');

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl !== 'string') {
          setState('idle');
          setPanelOpen(false);
          setError('녹음 처리에 실패했어요.');
          return;
        }
        const base64 = dataUrl.split(',')[1];
        const requestId = crypto.randomUUID();
        requestIdRef.current = requestId;
        postMessage('transcribeVoice', { requestId, audioBase64: base64, mimeType });
      };
      reader.readAsDataURL(blob);
    },
    [cleanupStream, publishInterim]
  );

  const startMediaRecorder = useCallback(
    (stream: MediaStream) => {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        mediaRecorderRef.current = null;
        const eng = engineRef.current;
        const gotBrowser = browserGotResultRef.current;

        if (eng === 'browser' || (eng === 'auto' && gotBrowser)) {
          cleanupStream();
          return;
        }

        startWhisperFromRecorder(mimeType);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
    },
    [cleanupStream, startWhisperFromRecorder]
  );

  const startBrowserSpeech = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;

    const recognition = new Ctor();
    speechRef.current = recognition;
    browserGotResultRef.current = false;
    speechTextRef.current = '';
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        const part = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) finalText += part;
        else interim += part;
      }
      speechTextRef.current = (finalText + interim).trim();
      publishInterim(speechTextRef.current);
      if (finalText.trim()) browserGotResultRef.current = true;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') return;
      speechRef.current = null;
      if (engineRef.current === 'browser') {
        setState('idle');
        setPanelOpen(false);
        publishInterim('');
        setError('브라우저 음성 인식에 실패했어요. 인식 방식을 Whisper로 바꿔 보세요.');
        stopRecording();
      }
    };

    recognition.onend = () => {
      speechRef.current = null;
      const text = speechTextRef.current.trim();
      const eng = engineRef.current;

      if (text && (eng === 'browser' || eng === 'auto')) {
        browserGotResultRef.current = true;
        setState('idle');
        setPanelOpen(false);
        publishInterim('');
        deliverTranscript(text);
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        cleanupStream();
        return;
      }

      if (eng === 'browser') {
        setState('idle');
        setPanelOpen(false);
        publishInterim('');
        setError('음성을 인식하지 못했어요.');
        cleanupStream();
      }
    };

    try {
      recognition.start();
      return true;
    } catch {
      speechRef.current = null;
      return false;
    }
  }, [cleanupStream, deliverTranscript, publishInterim, stopRecording]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const type = event.data?.type as string | undefined;
      const payload = event.data?.payload as Record<string, unknown> | undefined;
      if (!type || !payload) return;

      if (type === 'voiceCaptureLevel') {
        if (payload.sessionId !== captureSessionIdRef.current) return;
        setLevel(Number(payload.level ?? 0));
        setDecibels(Number(payload.decibels ?? -60));
        setBars(barsFromLevel(Number(payload.level ?? 0)));
        return;
      }

      if (type === 'voiceCaptureStarted') {
        if (payload.sessionId !== captureSessionIdRef.current) return;
        publishInterim('');
        return;
      }

      if (type === 'voicePartialTranscript') {
        if (payload.sessionId !== captureSessionIdRef.current) return;
        const text = typeof payload.text === 'string' ? payload.text : '';
        if (text) publishInterim(text);
        return;
      }

      if (type === 'voiceCaptureStopped') {
        if (payload.sessionId !== captureSessionIdRef.current) return;
        captureSessionIdRef.current = null;
        setPanelOpen(false);
        const audioBase64 = payload.audioBase64 as string | undefined;
        const mimeType = (payload.mimeType as string | undefined) ?? 'audio/wav';
        if (!audioBase64) {
          setState('idle');
          setError('녹음 데이터를 받지 못했어요.');
          return;
        }
        transcribeCapturedAudio(audioBase64, mimeType);
        return;
      }

      if (type === 'voiceCaptureError') {
        if (payload.sessionId && payload.sessionId !== captureSessionIdRef.current) return;
        captureSessionIdRef.current = null;
        setState('idle');
        setPanelOpen(false);
        publishInterim('');
        stopAnalyser();
        const err = payload.error as string | undefined;
        setError(
          err?.includes('Input/output') || err?.includes('Permission')
            ? '마이크 권한이 필요해요. Settings → 마이크 권한 설정 열기를 눌러 Cursor를 허용해 주세요.'
            : err ?? '마이크 녹음에 실패했어요.'
        );
        return;
      }

      if (type !== 'voiceTranscriptionResult') return;
      if (!payload.requestId || payload.requestId !== requestIdRef.current) return;

      requestIdRef.current = null;
      setState('idle');
      setPanelOpen(false);
      publishInterim('');
      cleanupStream();

      if (payload.error) {
        setError(String(payload.error));
        return;
      }

      if (typeof payload.text === 'string' && payload.text.trim()) {
        deliverTranscript(payload.text.trim());
      } else {
        setError('음성을 인식하지 못했어요.');
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [cleanupStream, deliverTranscript, publishInterim, stopAnalyser, transcribeCapturedAudio]);

  useEffect(
    () => () => {
      stopRecording();
      cleanupStream();
    },
    [cleanupStream, stopRecording]
  );

  const beginRecording = useCallback(async () => {
    if (state === 'processing' || state === 'recording') return;

    recordingBaseRef.current = getInputBase?.() ?? '';
    setError(null);
    publishInterim('');
    setPanelOpen(true);
    setState('recording');

    if (useExtensionRef.current) {
      const sessionId = crypto.randomUUID();
      captureSessionIdRef.current = sessionId;
      startExtensionVoiceCapture(sessionId, deviceIdRef.current || '0');
      stopTimerRef.current = window.setTimeout(() => stopRecording(), MAX_RECORD_MS);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setState('idle');
      setPanelOpen(false);
      setError('이 환경에서는 마이크를 사용할 수 없어요.');
      return;
    }

    try {
      const deviceId = deviceIdRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId
          ? {
              deviceId: { exact: deviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
      });
      mediaStreamRef.current = stream;

      const eng = engineRef.current;
      const useBrowser = eng === 'browser' || eng === 'auto';
      const useWhisper = eng === 'whisper' || eng === 'auto';

      if (useWhisper) startMediaRecorder(stream);
      if (useBrowser) {
        const started = startBrowserSpeech();
        if (!started && eng === 'browser') {
          setState('idle');
          setPanelOpen(false);
          setError('브라우저 음성 인식을 사용할 수 없어요. Whisper로 바꿔 주세요.');
          cleanupStream();
          return;
        }
      }

      stopTimerRef.current = window.setTimeout(() => stopRecording(), MAX_RECORD_MS);

      if (pendingStopRef.current) {
        pendingStopRef.current = false;
        stopRecording();
      }
    } catch {
      setState('idle');
      setPanelOpen(false);
      publishInterim('');
      setError(
        deviceIdRef.current
          ? '선택한 마이크에 연결하지 못했어요. Settings에서 마이크를 다시 선택해 주세요.'
          : '마이크 권한이 필요해요. Cursor에서 마이크 접근을 허용해 주세요.'
      );
      cleanupStream();
    }
  }, [
    cleanupStream,
    getInputBase,
    publishInterim,
    startBrowserSpeech,
    startMediaRecorder,
    state,
    stopRecording,
  ]);

  const pressStart = useCallback(() => {
    if (pressingRef.current || state === 'processing') return;
    pressingRef.current = true;
    void beginRecording();
  }, [beginRecording, state]);

  const pressEnd = useCallback(() => {
    if (!pressingRef.current && !captureSessionIdRef.current && state !== 'recording') return;
    pressingRef.current = false;
    if (state === 'recording' || captureSessionIdRef.current) {
      stopRecording();
      return;
    }
    pendingStopRef.current = true;
  }, [state, stopRecording]);

  return {
    state,
    error,
    interimText,
    pressStart,
    pressEnd,
    mode,
    setMode,
    engine,
    setEngine,
    panelOpen,
    level,
    decibels,
    bars,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
    statusLabel:
      state === 'recording'
        ? '듣는 중… (버튼·단축키를 떼면 종료)'
        : state === 'processing'
          ? '음성을 글자로 바꾸는 중…'
          : null,
  };
}
