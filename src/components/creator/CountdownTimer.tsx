import { useEffect, useState } from 'react';
import { useSigilSelector } from '../../context/SigilContext';

const getScallopPath = (radius: number, numScallops: number, scallopDepth: number) => {
  const points: string[] = [];
  const cx = 100;
  const cy = 100;
  for (let i = 0; i < numScallops; i++) {
    const angle1 = (i * 2 * Math.PI) / numScallops;
    const angle2 = ((i + 1) * 2 * Math.PI) / numScallops;
    const midAngle = (angle1 + angle2) / 2;
    
    const rxOuter = radius + scallopDepth;
    const ryOuter = radius + scallopDepth;
    
    const x1 = cx + radius * Math.cos(angle1);
    const y1 = cy + radius * Math.sin(angle1);
    const x2 = cx + radius * Math.cos(angle2);
    const y2 = cy + radius * Math.sin(angle2);
    const xCtrl = cx + rxOuter * Math.cos(midAngle);
    const yCtrl = cy + ryOuter * Math.sin(midAngle);
    
    if (i === 0) {
      points.push(`M ${x1} ${y1}`);
    }
    points.push(`Q ${xCtrl} ${yCtrl} ${x2} ${y2}`);
  }
  return points.join(' ') + ' Z';
};

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
    <div className="section-countdown-container" style={{
      position: 'relative',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem 0',
      marginTop: '1.5rem',
    }}>

      {/* Scalloped Circle Badge */}
      <div 
        className="countdown-scallop-badge"
        style={{
          position: 'relative',
          width: '190px',
          height: '190px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        {/* Scalloped SVG Background */}
        <svg 
          viewBox="0 0 200 200" 
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.06))',
          }}
        >
          <path 
            d={getScallopPath(86, 16, 6)} 
            fill="#faf8f2" 
            stroke="rgba(160, 142, 124, 0.25)" 
            strokeWidth="1.2" 
          />
          <path 
            d={getScallopPath(80, 16, 5)} 
            fill="none" 
            stroke="rgba(160, 142, 124, 0.15)" 
            strokeWidth="0.8" 
          />
        </svg>

        {/* Content Container (absolutely centered inside the scallop badge) */}
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', marginTop: '-4px' }}>
          <h4 style={{ 
            fontSize: '1.9rem', 
            fontFamily: "'Pinyon Script', cursive", 
            margin: '0 0 0.1rem 0', 
            color: '#4c4844',
            fontWeight: 400,
            textShadow: '0 1px 1px rgba(255,255,255,0.8)'
          }}>
            Faltan
          </h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.7rem', margin: '0.1rem 0' }}>
            {[
              { label: 'DIAS', val: timeLeft.days },
              { label: 'HORAS', val: timeLeft.hours },
              { label: 'MINUTOS', val: timeLeft.minutes },
            ].map((unit, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 500, color: '#333333', minWidth: '30px', letterSpacing: '-0.02em' }}>
                  {pad(unit.val)}
                </span>
                <span style={{ 
                  fontSize: '0.52rem', 
                  letterSpacing: '0.1em', 
                  color: '#8c7d6b', 
                  marginTop: '0.1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
