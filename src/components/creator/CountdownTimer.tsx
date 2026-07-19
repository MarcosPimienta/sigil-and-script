import { useEffect, useState } from 'react';
import { useSigilSelector } from '../../context/SigilContext';
import { getTranslation } from '../../utils/i18n';

// Corner flourish matching the ItineraryTimeline style
const CornerFlourish = ({ color = 'rgba(120, 100, 80, 0.55)' }: { color?: string }) => (
  <svg width="40" height="40" viewBox="0 0 45 45" style={{ pointerEvents: 'none' }}>
    <path d="M 12 45 L 12 12 L 45 12" stroke={color} fill="none" strokeWidth="1.2" />
    <path d="M 12 30 C 12 20 20 12 30 12" stroke={color} fill="none" strokeWidth="0.8" />
    <path d="M 12 38 C 12 24 24 12 38 12" stroke={color} fill="none" strokeWidth="0.6" />
    <path d="M 18 18 C 22 14 26 18 22 22 C 18 26 14 22 18 18 Z" fill="none" stroke={color} strokeWidth="0.8" />
    <circle cx="32" cy="18" r="1.5" fill={color} />
    <circle cx="18" cy="32" r="1.5" fill={color} />
  </svg>
);

export function CountdownTimer() {
  const target = useSigilSelector((s) => s.design.countdownTarget);
  const lang = useSigilSelector((s) => s.design.language);
  const t = getTranslation(lang);
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
    <div
      className="section-countdown-container"
      style={{
        position: 'relative',
        width: '100%',
        marginTop: '1.5rem',
        padding: '2.5rem 1.75rem',
        boxSizing: 'border-box',
        fontFamily: "'Cormorant Garamond', serif",
      }}
    >
      {/* Outer decorative border */}
      <div
        style={{
          position: 'absolute',
          inset: '3px',
          border: '0.5px solid rgba(120, 100, 80, 0.18)',
          borderRadius: '1px',
          pointerEvents: 'none',
        }}
      />

      {/* Inner ornamented border frame with corner flourishes */}
      <div
        style={{
          position: 'absolute',
          inset: '10px',
          border: '1px solid rgba(120, 100, 80, 0.32)',
          borderRadius: '2px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0 }}><CornerFlourish /></div>
        <div style={{ position: 'absolute', top: 0, right: 0, transform: 'scaleX(-1)' }}><CornerFlourish /></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'scaleY(-1)' }}><CornerFlourish /></div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'scale(-1)' }}><CornerFlourish /></div>
      </div>

      {/* Countdown content — no background, sits directly on invitation paper */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* Title */}
        <h4
          style={{
            fontSize: '1.05rem',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            margin: '0 0 1.4rem 0',
            color: '#5a4a3a',
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}
        >
          {t.countdownTitle}
        </h4>

        {/* Numbers */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          {[
            { label: t.days, val: timeLeft.days },
            { label: t.hours, val: timeLeft.hours },
            { label: t.minutes, val: timeLeft.minutes },
          ].map((unit, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '2.6rem',
                  fontWeight: 300,
                  color: '#3a2e26',
                  minWidth: '44px',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                {pad(unit.val)}
              </span>
              <span
                style={{
                  fontSize: '0.54rem',
                  letterSpacing: '0.15em',
                  color: '#8c7d6b',
                  marginTop: '0.35rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
