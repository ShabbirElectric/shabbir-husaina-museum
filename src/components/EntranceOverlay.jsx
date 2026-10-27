import React from 'react';
import { Heart, ChevronDown, Sparkles } from 'lucide-react';

export default function EntranceOverlay({ progress, onEnter }) {
  if (progress > 0.08) return null;

  const opacity = Math.max(0, 1 - progress / 0.08);

  return (
    <div
      className="entrance-overlay"
      style={{ opacity, pointerEvents: opacity > 0.1 ? 'auto' : 'none' }}
    >
      <div className="entrance-hero-content">
        <div className="entrance-badge">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>A PRIVATE 3D EXHIBITION</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>

        <h1 className="entrance-title">
          Shabbir <span className="title-heart">♥</span> Husaina
        </h1>

        <p className="entrance-subtitle">
          "Walking together through a world crafted from our most cherished memories,
          sacred moments, and shared dreams."
        </p>

        <div className="entrance-actions">
          <button className="entrance-enter-btn" onClick={onEnter}>
            <span>Enter The Museum</span>
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="scroll-indicator-wrap">
          <div className="mouse-scroll-icon">
            <div className="mouse-wheel-dot" />
          </div>
          <span className="scroll-text">Scroll down or drag to explore</span>
        </div>
      </div>
    </div>
  );
}
