import { useEffect } from 'react';
import integrityService from '../services/integrityService';

const useIntegrityEvents = (sessionId) => {
  useEffect(() => {
    if (!sessionId) return;

    if (!sessionId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab switched or window minimized');
        const token = localStorage.getItem('token');
        integrityService.logEvent(sessionId, 'TAB_SWITCH', { visibilityState: 'hidden' }, token);
      }
    };

    const handleBlur = () => {
      console.log('Window lost focus');
      const token = localStorage.getItem('token');
      integrityService.logEvent(sessionId, 'FOCUS_LOSS', {}, token);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [sessionId]);
};

export default useIntegrityEvents;
