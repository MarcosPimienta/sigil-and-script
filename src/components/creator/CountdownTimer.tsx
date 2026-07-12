import { useEffect, useState } from 'react';
import { useSigilSelector } from '../../context/SigilContext';

export function CountdownTimer() {
  const target = useSigilSelector((s) => s.design.countdownTarget);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!target) return;

    const calculateTime = () => {
      const difference = +new Date(target) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!target) return null;

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="section-countdown" style={{
      textAlign: 'center',
      padding: '2rem 1.5rem',
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      marginTop: '1.5rem',
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      <h4 style={{ fontSize: '1.4rem', fontStyle: 'italic', margin: '0 0 1rem 0', color: '#4c4844' }}>
        Faltan
      </h4>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        {[
          { label: 'DIAS', val: timeLeft.days },
          { label: 'HORAS', val: timeLeft.hours },
          { label: 'MINUTOS', val: timeLeft.minutes },
        ].map((unit, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 600, color: '#4c4844' }}>
              {pad(unit.val)}
            </span>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)', marginTop: '0.25rem' }}>
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
