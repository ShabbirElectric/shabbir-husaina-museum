import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function LoadingScreen({ progress, isReady }) {
  if (isReady) return null;

  return (
    <div className="loading-screen-overlay">
      <div className="loading-card">
        <div className="loading-monogram">
          <Heart className="w-10 h-10 text-rose-400 fill-rose-400 animate-pulse" />
        </div>

        <h2 className="loading-title">Shabbir ♥ Husaina</h2>
        <p className="loading-subtitle">Preparing your 3D romantic museum gallery...</p>

        {/* Progress Bar */}
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>

        <div className="loading-meta">
          <span>Loading Exhibition Assets</span>
          <span className="font-semibold text-amber-300">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
