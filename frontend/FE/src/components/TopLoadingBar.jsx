import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./TopLoadingBar.css";

export default function TopLoadingBar() {
  const { pathname, search } = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const finishRef = useRef(null);

  useEffect(() => {
    // Clear any existing timers
    clearInterval(timerRef.current);
    clearTimeout(finishRef.current);

    // Start bar
    setProgress(0);
    setVisible(true);

    // Quickly jump to 20%, then inch forward slowly
    let current = 0;
    timerRef.current = setInterval(() => {
      current += current < 30 ? 10 : current < 60 ? 5 : current < 85 ? 2 : 0.5;
      if (current >= 92) current = 92; // stall near end
      setProgress(current);
    }, 80);

    // Finish after a short delay (simulate page ready)
    finishRef.current = setTimeout(() => {
      clearInterval(timerRef.current);
      setProgress(100);
      setTimeout(() => setVisible(false), 400);
    }, 600);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(finishRef.current);
    };
  }, [pathname, search]);

  if (!visible) return null;

  return (
    <div className="top-loading-bar" style={{ width: `${progress}%` }} />
  );
}
