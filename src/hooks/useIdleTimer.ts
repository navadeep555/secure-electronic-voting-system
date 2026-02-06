import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useIdleTimer = (timeoutInSeconds: number = 60) => {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      // Clear session to prevent back-button access
      sessionStorage.clear(); 
      // Redirect to home/login
      navigate('/'); 
      // Optional: Force a refresh to ensure all states are wiped
      window.location.reload(); 
    }, timeoutInSeconds * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer(); // Start timer on mount

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
};