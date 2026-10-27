import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function PhotoModal({
  photo,
  onClose,
  onNext,
  onPrev
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!photo) return null;

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Viewing Badge matching Giftvera reference video */}
        <div className="viewing-pill-badge">
          <span>Viewing</span>
        </div>

        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close photo view"
        >
          <X size={20} />
        </button>

        {/* Prev / Next Buttons */}
        <button
          className="modal-nav-btn prev-btn"
          onClick={onPrev}
          aria-label="Previous photo"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="modal-nav-btn next-btn"
          onClick={onNext}
          aria-label="Next photo"
        >
          <ChevronRight size={24} />
        </button>

        {/* Framed Photograph Artwork */}
        <div className="modal-art-frame">
          <div className="modal-inner-mat">
            <img
              src={photo.url}
              alt={photo.title}
              className="modal-photo-img"
            />
          </div>
        </div>

        {/* Exhibition Placard matching reference video */}
        <div className="modal-placard">
          <span className="placard-collection">A DEDICATED COLLECTION • SHABBIR ♥ HUSAINA</span>
          <h2 className="placard-title">{photo.title}</h2>
          <p className="placard-quote">"{photo.caption}"</p>
          <div className="placard-footer">
            <span className="placard-room">{photo.room}</span>
            <span className="placard-counter">Frame {photo.id} of 16</span>
          </div>
        </div>
      </div>
    </div>
  );
}
