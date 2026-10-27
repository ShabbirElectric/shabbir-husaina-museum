import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, RotateCcw } from 'lucide-react';

export default function MuseumWalkControls({
  onStepForward,
  onStepBackward,
  onLookLeft,
  onLookRight,
  onCenterView,
  visible = true
}) {
  if (!visible) return null;

  return (
    <div className="museum-walk-controls-hud">
      <div className="walk-controls-bar">
        {/* Look Left Wall */}
        <button
          className="walk-btn wall-btn"
          onClick={onLookLeft}
          title="Look at photos on Left Wall (Press Left Arrow / A)"
        >
          <ChevronLeft size={16} />
          <span>Left Wall</span>
        </button>

        {/* Walk Back (Out of museum) */}
        <button
          className="walk-btn move-btn"
          onClick={onStepBackward}
          title="Walk Backward (Press Down Arrow / S)"
        >
          <ChevronDown size={16} />
          <span>Walk Out</span>
        </button>

        {/* Center View */}
        <button
          className="walk-btn center-btn"
          onClick={onCenterView}
          title="Center Corridor View (Press C)"
        >
          <Eye size={15} />
          <span>Center</span>
        </button>

        {/* Walk Forward (Into museum) */}
        <button
          className="walk-btn move-btn highlight-walk"
          onClick={onStepForward}
          title="Walk Forward into Gallery (Press Up Arrow / W / Scroll Down)"
        >
          <ChevronUp size={16} />
          <span>Walk In</span>
        </button>

        {/* Look Right Wall */}
        <button
          className="walk-btn wall-btn"
          onClick={onLookRight}
          title="Look at photos on Right Wall (Press Right Arrow / D)"
        >
          <span>Right Wall</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="walk-controls-hint">
        <span>Scroll / Drag to explore • Press <b>A/D</b> to inspect walls</span>
      </div>
    </div>
  );
}
