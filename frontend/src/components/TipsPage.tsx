import React from 'react';
import '../styles/Tips.css';

interface TipItem {
  icon: string;
  title: string;
  detail: string;
}

interface TipSet {
  title: string;
  subtitle: string;
  tips: TipItem[];
  quickActions: TipItem[];
}

type Variant = 'safety' | 'sos';

const TIP_SETS: Record<Variant, TipSet> = {
  safety: {
    title: 'Safety Tips',
    subtitle: 'Do these before and during your trip to stay safer.',
    tips: [
      { icon: '🧭', title: 'Share your trip', detail: 'Send live location and ETA to a trusted contact before you start.' },
      { icon: '💡', title: 'Stay visible', detail: 'Pick well-lit main roads; avoid empty shortcuts and closed campuses.' },
      { icon: '🚕', title: 'Check the vehicle', detail: 'Match plate and driver photo, sit in the back, keep child lock off.' },
      { icon: '🎧', title: 'Keep one ear free', detail: 'Lower headphone volume so you can hear traffic and people nearby.' },
      { icon: '📍', title: 'Save safe stops', detail: 'Pin open stores, metro stations, and police booths along your route.' },
      { icon: '📢', title: 'Use your voice', detail: 'If you feel watched, make a quick call aloud to signal you are connected.' }
    ],
    quickActions: [
      { icon: '⚡', title: 'SOS ready', detail: 'Keep SOS visible on the dock and pre-fill emergency contacts.' },
      { icon: '🔋', title: 'Battery & data', detail: 'Charge above 30% and keep data on for sharing location and SOS.' },
      { icon: '👟', title: 'Plan exits', detail: 'Know nearest well-lit junctions you can move toward if uneasy.' }
    ]
  },
  sos: {
    title: 'SOS Tips',
    subtitle: 'Use SOS calmly and clearly so help can reach you fast.',
    tips: [
      { icon: '📲', title: 'One-press trigger', detail: 'Keep SOS on the dock. Long-press to start if you are in danger.' },
      { icon: '🎙', title: 'Speak clear keywords', detail: 'State name, location, landmark, and what is happening in one sentence.' },
      { icon: '🛰', title: 'Stay on the move', detail: 'If possible, move to lit, crowded spots while SOS is active.' },
      { icon: '🚨', title: 'Visible deterrent', detail: 'Hold phone visibly and say you are on a live SOS with location shared.' },
      { icon: '👥', title: 'Loop trusted people', detail: 'Call or text one trusted contact to stay on the line until safe.' },
      { icon: '🧩', title: 'Describe clothing', detail: 'Share what you and the person near you are wearing for responders.' }
    ],
    quickActions: [
      { icon: '📡', title: 'Location on', detail: 'Ensure GPS is enabled so SOS shares an accurate position.' },
      { icon: '🔕', title: 'Silent mode?', detail: 'If you need stealth, lower volume and use vibration-only alerts.' },
      { icon: '🧾', title: 'Fast facts', detail: 'Keep blood group, allergies, and an ICE contact saved in the app.' }
    ]
  }
};

interface Props {
  variant: Variant;
}

const TipsPage: React.FC<Props> = ({ variant }) => {
  const tipSet = TIP_SETS[variant];

  return (
    <div className="tips-page">
      <div className="tips-hero">
        <div className="tips-pill">Guides</div>
        <h1>{tipSet.title}</h1>
        <p>{tipSet.subtitle}</p>
      </div>

      <section className="tips-section">
        <div className="tips-section-header">
          <h2>Essentials</h2>
          <span className="tips-note">6 quick reads</span>
        </div>
        <div className="tips-grid">
          {tipSet.tips.map((tip) => (
            <div key={tip.title} className="tip-card">
              <div className="tip-icon" aria-hidden="true">{tip.icon}</div>
              <div className="tip-body">
                <h3>{tip.title}</h3>
                <p>{tip.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tips-section">
        <div className="tips-section-header">
          <h2>Do this now</h2>
          <span className="tips-note">3 fast actions</span>
        </div>
        <div className="tips-grid compact">
          {tipSet.quickActions.map((tip) => (
            <div key={tip.title} className="tip-card compact">
              <div className="tip-icon" aria-hidden="true">{tip.icon}</div>
              <div className="tip-body">
                <h3>{tip.title}</h3>
                <p>{tip.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TipsPage;
