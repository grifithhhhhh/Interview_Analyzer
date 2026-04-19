import { useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';

export default function useAntiCheat({ candidateId, onWarning, onVoid }) {
  const flagCount = useRef(0);
  const voided = useRef(false);

  const sendFlag = useCallback(async (type) => {
    if (voided.current) return;

    try {
      const { data } = await API.post('/interview/flag', { candidateId, type });
      flagCount.current = data.flagCount;

      if (data.flagCount >= 3) {
        voided.current = true;
        await API.post('/interview/void', {
          candidateId,
          reason: `Terminated due to repeated violations: ${type}`,
        });
        onVoid(`Terminated due to repeated violations. Last violation: ${formatType(type)}`);
      } else {
        onWarning(formatType(type), data.flagCount);
      }
    } catch (err) {
      console.error('Flag error:', err);
    }
  }, [candidateId, onWarning, onVoid]);

  const formatType = (type) => {
    const map = {
      tab_switch: 'Tab switch detected',
      window_blur: 'Window left focus',
      fullscreen_exit: 'Fullscreen exited',
    };
    return map[type] || type;
  };

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !voided.current) {
        sendFlag('tab_switch');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sendFlag]);

  // Window blur detection
  useEffect(() => {
    const handleBlur = () => {
      if (!voided.current) sendFlag('window_blur');
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [sendFlag]);

  // Fullscreen exit detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !voided.current) {
        sendFlag('fullscreen_exit');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [sendFlag]);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {});
  };

  return { enterFullscreen };
}