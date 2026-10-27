import React from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  Heart,
  Images,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { museumSections } from '../data/photos.js';

export default function NavigationHUD({
  progress,
  onNavigateTo,
  onOpenPhotoDrawer,
  isMusicPlaying,
  onToggleMusic
}) {
  // Determine active section
  let activeSection = museumSections[0];
  for (let i = 0; i < museumSections.length; i++) {
    if (progress >= museumSections[i].progress - 0.08) {
      activeSection = museumSections[i];
    }
  }

  return (
    <nav className="nav-hud-header">
      {/* Scroll Progress Bar along top edge */}
      <div className="nav-progress-track">
        <div
          className="nav-progress-fill"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="nav-hud-inner">
        {/* Left: Couple Monogram & Title */}
        <div
          className="nav-brand"
          onClick={() => onNavigateTo(0.0)}
          title="Return to Grand Entrance"
        >
          <div className="brand-monogram">S♥H</div>
          <div className="brand-names">
            <span className="brand-main">Shabbir & Husaina</span>
            <span className="brand-sub">The 3D Romantic Museum</span>
          </div>
        </div>

        {/* Center: Room Navigation Quick Pills */}
        <div className="nav-room-pills">
          {museumSections.map((sec) => {
            const isActive = activeSection.id === sec.id;
            return (
              <button
                key={sec.id}
                className={`room-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => onNavigateTo(sec.progress)}
              >
                <span>{sec.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Controls & Toggles */}
        <div className="nav-hud-actions">
          {/* Photos Collection Drawer */}
          <button
            className="nav-action-pill photos-drawer-pill"
            onClick={onOpenPhotoDrawer}
            title="Browse all 16 framed photographs on the left and right walls"
          >
            <Images size={15} className="text-amber-300" />
            <span className="text-xs font-semibold">Exhibition (16)</span>
          </button>

          {/* Background Ambient Piano Music Toggle */}
          <button
            className={`nav-action-icon-btn ${isMusicPlaying ? 'music-playing' : ''}`}
            onClick={onToggleMusic}
            title={isMusicPlaying ? 'Mute Background Music' : 'Play Romantic Background Music'}
            aria-label="Toggle Background Music"
          >
            {isMusicPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
