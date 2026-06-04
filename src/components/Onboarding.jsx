import React, { useState } from 'react';
import { OB_SLIDES } from '../utils/mockData';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const s = OB_SLIDES[step];

  const next = () => {
    if (step < OB_SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      onDone();
    }
  };

  return (
    <div className="ob-wrap">
      <div className="ob-slide">
        <div className="ob-visual">
          <div className="ob-visual-bg" style={{ background: s.bg }} />
          <div className="ob-visual-emoji">{s.emoji}</div>
          <div className="ob-visual-content">
            <div className="ob-visual-tag">
              <div
                style={{
                  width: 6,
                  height: 6,
                  background: "#fff",
                  borderRadius: "50%",
                  opacity: 0.7
                }}
              />
              FloraCare · Уход за растениями
            </div>
          </div>
        </div>
        <div className="ob-body">
          <div className="ob-step">{s.step}</div>
          <div className="ob-h">{s.h}</div>
          <div className="ob-p">{s.p}</div>
          <div className="ob-dots">
            {OB_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`ob-dot ${i === step ? "ob-dot-active" : "ob-dot-inactive"}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="ob-footer">
        <button className="ob-btn-main" onClick={next}>
          {s.btn}
        </button>
        {s.pip && (
          <button className="ob-btn-skip" onClick={onDone}>
            {s.pip}
          </button>
        )}
      </div>
    </div>
  );
}
