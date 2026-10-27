import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function CharacterLabels({
  screenCoords,
  activeQuote,
  isSeated
}) {
  const { shabbir, husaina } = screenCoords;

  if (isSeated) {
    return null;
  }

  // Anti-collision spacing for name tags:
  // Ensure a clean minimum horizontal gap so tags never overlap
  let shabbirX = shabbir?.x ?? 0;
  let husainaX = husaina?.x ?? 0;
  if (shabbir?.visible && husaina?.visible) {
    const minGap = 88;
    const diff = shabbirX - husainaX;
    if (Math.abs(diff) < minGap) {
      const shift = (minGap - Math.abs(diff)) / 2;
      if (diff >= 0) {
        husainaX -= shift;
        shabbirX += shift;
      } else {
        husainaX += shift;
        shabbirX -= shift;
      }
    }
  }

  return (
    <div className="character-labels-container">
      {/* 1. MALE CHARACTER LABEL: SHABBIR */}
      {shabbir && shabbir.visible && (
        <div
          className="character-tag tag-shabbir"
          style={{
            transform: `translate3d(${shabbirX}px, ${shabbir.y}px, 0)`
          }}
        >
          <div className="tag-pill">
            <span className="status-dot dot-shabbir" />
            <span className="tag-name">Shabbir</span>
          </div>
        </div>
      )}

      {/* 2. FEMALE CHARACTER LABEL: HUSAINA */}
      {husaina && husaina.visible && (
        <div
          className="character-tag tag-husaina"
          style={{
            transform: `translate3d(${husainaX}px, ${husaina.y}px, 0)`
          }}
        >
          <div className="tag-pill">
            <span className="status-dot dot-husaina" />
            <span className="tag-name">Husaina</span>
          </div>
        </div>
      )}

      {/* 3. ROMANTIC FLOATING SPEECH BUBBLE */}
      {activeQuote && (
        <div
          className={`dialogue-bubble ${
            activeQuote.character === 'Shabbir' ? 'from-shabbir' : 'from-husaina'
          } ${isSeated ? 'bubble-seated' : ''}`}
          style={{
            transform: isSeated
              ? `translate3d(${window.innerWidth / 2}px, ${window.innerHeight * 0.34}px, 0)`
              : activeQuote.character === 'Shabbir' && shabbir && shabbir.visible
              ? `translate3d(${Math.max(170, Math.min(window.innerWidth - 170, shabbir.x))}px, ${Math.max(80, shabbir.y - 75)}px, 0)`
              : husaina && husaina.visible
              ? `translate3d(${Math.max(170, Math.min(window.innerWidth - 170, husaina.x))}px, ${Math.max(80, husaina.y - 75)}px, 0)`
              : `translate3d(${window.innerWidth / 2}px, 120px, 0)`
          }}
        >
          <div className="bubble-content">
            <div className="bubble-header">
              <span className="bubble-speaker">{activeQuote.character}</span>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            </div>
            <p className="bubble-text">{activeQuote.text}</p>
          </div>
          <div className="bubble-tail" />
        </div>
      )}
    </div>
  );
}
