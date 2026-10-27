import React from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { galleryPhotos } from '../data/photos.js';

export default function PhotoDrawer({
  isOpen,
  onClose,
  onSelectPhoto,
  onNavigateToProgress
}) {
  if (!isOpen) return null;

  return (
    <div className="photo-drawer-backdrop" onClick={onClose}>
      <div className="photo-drawer-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="photo-drawer-header">
          <div className="drawer-title-wrap">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="drawer-title">Gallery Collection • Shabbir & Husaina</h3>
              <p className="drawer-sub">16 Framed Exhibition Photographs Mounted on Museum Walls</p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="photo-drawer-grid">
          {galleryPhotos.map((photo) => (
            <div
              key={photo.id}
              className="drawer-photo-card"
              onClick={() => {
                onSelectPhoto(photo);
                if (onNavigateToProgress) {
                  // Approximate progress for the photo room
                  const roomProgress =
                    photo.room === 'The Sacred Vows'
                      ? 0.22
                      : photo.room === 'Golden Days'
                      ? 0.46
                      : 0.70;
                  onNavigateToProgress(roomProgress);
                }
                onClose();
              }}
            >
              <div className="card-thumb-wrap">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="card-thumb-img"
                  loading="lazy"
                />
                <span className="card-wall-tag">
                  {photo.wall === 'left' ? 'Left Wall' : photo.wall === 'right' ? 'Right Wall' : 'Center Divider'}
                </span>
              </div>
              <div className="card-meta">
                <h4 className="card-title">{photo.title}</h4>
                <p className="card-subtitle">{photo.subtitle}</p>
                <span className="card-room">{photo.room}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
