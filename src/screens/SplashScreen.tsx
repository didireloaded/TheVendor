import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1800);
    const t2 = setTimeout(onComplete, 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className="splash-overlay" style={{ opacity: fading ? 0 : 1 }}>
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-ink-900 flex items-center justify-center mb-6 shadow-2xl">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L8 14V34L24 44L40 34V14L24 4Z" fill="white" />
            <path d="M24 14L16 19V29L24 34L32 29V19L24 14Z" fill="#0B0B12" />
            <path d="M24 20L20 22.5V27.5L24 30L28 27.5V22.5L24 20Z" fill="white" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-ink-900 tracking-tight">
          The Vendor
        </h1>
        <p className="text-sm text-ink-900/60 mt-2 font-medium">
          Find trusted vendors across Namibia
        </p>
      </div>
    </div>
  );
}
