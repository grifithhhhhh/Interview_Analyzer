import { useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';

export default function useAntiCheat({ interviewId, onWarning, onVoid }) {
  const flagCount = useRef(0);
  const voided = useRef(false);

  const sendFlag = useCallback(async (type) => {
    if (voided.current) return;

    try {
      const { data } = await API.post('/interview/flag', { interviewId, type });
      flagCount.current = data.flagCount;

      if (data.flagCount >= 3) {
        voided.current = true;
        await API.post('/interview/void', {
          interviewId,
          reason: `Terminated due to repeated violations: ${type}`,
        });
        onVoid(`Terminated due to repeated violations. Last violation: ${formatType(type)}`);
      } else {
        onWarning(formatType(type), data.flagCount);
      }
    } catch (err) {
      console.error('Flag error:', err);
    }
  }, [interviewId, onWarning, onVoid]);

  const formatType = (type) => {
    const map = {
      tab_switch: 'Tab switch detected',
      window_blur: 'Window left focus',
      fullscreen_exit: 'Fullscreen exited',
    };
    return map[type] || type;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !voided.current) {
        sendFlag('tab_switch');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sendFlag]);

  useEffect(() => {
    const handleBlur = () => {
      if (!voided.current) sendFlag('window_blur');
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [sendFlag]);

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