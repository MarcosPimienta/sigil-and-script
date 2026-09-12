import { useState } from 'react';
import type { EventType } from '../../types/sigil.types';
import '../../styles/landing.css';

interface LandingHeroProps {
  onStartDesigning: () => void;
  onSignIn: () => void;
}

interface TemplateSample {
  type: EventType;
  label: string;
  title: string;
  subtitle: string;
  date: string;
  ceremony: string;
  reception: string;
  sealColor: string;
}

const TEMPLATE_SAMPLES: Record<EventType, TemplateSample> = {
  WEDDING: {
    type: 'WEDDING',
    label: 'Wedding / Boda',
    title: 'Elena & Marcus',
    subtitle: 'Request the honour of your presence',
    date: 'Saturday, December 12, 2026',
    ceremony: 'Ceremony · 4:00 PM · Old Cathedral',
    reception: 'Reception · 6:30 PM · The Glasshouse',
    sealColor: 'radial-gradient(circle at 35% 35%, #b91c1c 0%, #7f1d1d 80%)',
  },
  BIRTHDAY: {
    type: 'BIRTHDAY',
    label: 'Birthday / Cumpleaños',
    title: "Sophia's 30th Soirée",
    subtitle: 'Join us for an evening under the stars',
    date: 'Friday, October 23, 2026',
    ceremony: 'Cocktails · 7:00 PM · Rooftop Terrace',
    reception: 'Dinner & Music · 8:30 PM · Velvet Lounge',
    sealColor: 'radial-gradient(circle at 35% 35%, #047857 0%, #064e3b 80%)',
  },
  CORPORATE: {
    type: 'CORPORATE',
    label: 'Corporate / Gala',
    title: 'Global Vanguard Gala',
    subtitle: 'Celebrating Excellence & Leadership',
    date: 'Thursday, November 19, 2026',
    ceremony: 'Keynote · 5:30 PM · Grand Ballroom',
    reception: 'Dinner & Awards · 7:30 PM · Pavillion',
    sealColor: 'radial-gradient(circle at 35% 35%, #1d4ed8 0%, #1e3a8a 80%)',
  },
  BAPTISM: {
    type: 'BAPTISM',
    label: 'Baptism / Bautizo',
    title: 'Mateo Alexander',
    subtitle: 'Blessing & Celebration of Life',
    date: 'Sunday, September 20, 2026',
    ceremony: 'Blessing · 11:00 AM · San Pedro Chapel',
    reception: 'Luncheon · 1:00 PM · Hacienda Garden',
    sealColor: 'radial-gradient(circle at 35% 35%, #c2410c 0%, #7c2d12 80%)',
  },
  CUSTOM: {
    type: 'CUSTOM',
    label: 'Custom Celebration',
    title: 'Midsummer Solstice Gathering',
    subtitle: 'Music, Lanterns & Feast',
    date: 'Saturday, June 20, 2026',
    ceremony: 'Gathering · 6:00 PM · Sunken Meadow',
    reception: 'Banquet · 8:00 PM · The Orchard',
    sealColor: 'radial-gradient(circle at 35% 35%, #d97706 0%, #78350f 80%)',
  },
};

export function LandingHero({ onStartDesigning, onSignIn }: LandingHeroProps) {
  const [selectedType, setSelectedType] = useState<EventType>('WEDDING');
  const activeSample = TEMPLATE_SAMPLES[selectedType];

  return (
    <div className="landing-container">
      <div className="landing-ambient-glow" aria-hidden="true" />

      {/* Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <span className="landing-brand-badge" aria-hidden="true">S&amp;S</span>
          <span className="landing-brand-wordmark">Sigil &amp; Script</span>
        </div>
        <div className="landing-header-actions">
          <button
            type="button"
            className="landing-btn-ghost"
            onClick={onSignIn}
            aria-label="Sign In"
          >
            Sign In
          </button>
          <button
            type="button"
            className="landing-btn-primary"
            onClick={onStartDesigning}
            aria-label="Start Designing"
          >
            Start Designing
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="landing-hero">
        <div className="landing-pill-tag">
          <span>Interactive Invitation Studio &amp; Reception Suite</span>
        </div>

        <h1 className="landing-hero-title">
          Handcrafted Digital Invitations with <em>Timeless Elegance</em>
        </h1>

        <p className="landing-hero-subtitle">
          Design interactive, cinematic invitations with procedural wax seals, tactile parchment textures, and synchronized countdowns. Coordinate multi-guest families, track RSVPs, and organize seating blueprints together.
        </p>

        <div className="landing-cta-group">
          <button
            type="button"
            className="landing-btn-primary landing-cta-large"
            onClick={onStartDesigning}
          >
            Create Your First Invitation
          </button>
          <button
            type="button"
            className="landing-btn-ghost landing-cta-large"
            onClick={onSignIn}
          >
            Sign In to Existing Event
          </button>
        </div>

        {/* Interactive Showcase Preview */}
        <section className="landing-showcase" aria-label="Interactive Showcase">
          <div className="landing-showcase-nav">
            {(Object.keys(TEMPLATE_SAMPLES) as EventType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`landing-showcase-tab ${selectedType === type ? 'landing-showcase-tab--active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {TEMPLATE_SAMPLES[type].label}
              </button>
            ))}
          </div>

          <div className="landing-preview-card">
            <div
              className="landing-seal-mock"
              style={{ background: activeSample.sealColor }}
              aria-hidden="true"
            >
              ✦
            </div>
            <h2 className="landing-preview-title">{activeSample.title}</h2>
            <div className="landing-preview-subtitle">{activeSample.subtitle}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontStyle: 'italic', color: '#8b2500', marginBottom: '1.5rem' }}>
              {activeSample.date}
            </div>
            <div className="landing-preview-itinerary">
              <div>{activeSample.ceremony}</div>
              <div>{activeSample.reception}</div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="landing-features-grid" aria-label="Feature Highlights">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <h3>Procedural Wax Relief</h3>
            <p>
              Height-map wax seal engine with real-time directional lighting, adjustable emboss depth, and custom stamp crests.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Guest Hierarchy &amp; RSVPs</h3>
            <p>
              Individual and family allotments with dependent checkboxes, dietary requirements, and instant telemetry telemetry when envelopes are opened.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3>Table Seating Blueprints</h3>
            <p>
              Arrange round, square, and rectangular tables on a 2D floor plan map. Assign confirmed guests seat-by-seat with real-time capacity tracking.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </div>
            <h3>Co-Host Collaboration</h3>
            <p>
              Invite your partner, wedding planner, or event committee by email. Collaborate on designs, guest lists, and floor plans simultaneously.
            </p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Sigil &amp; Script · Interactive Multi-Tenant Invitation Platform</p>
      </footer>
    </div>
  );
}
