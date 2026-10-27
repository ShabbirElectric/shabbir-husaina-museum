import React, { useState, useEffect, useRef, useMemo } from 'react';
import MuseumCanvas from './components/MuseumCanvas.jsx';
import NavigationHUD from './components/NavigationHUD.jsx';
import CharacterLabels from './components/CharacterLabels.jsx';
import PhotoModal from './components/PhotoModal.jsx';
import PhotoDrawer from './components/PhotoDrawer.jsx';
import CinemaHUD from './components/CinemaHUD.jsx';
import EntranceOverlay from './components/EntranceOverlay.jsx';
import MuseumWalkControls from './components/MuseumWalkControls.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { galleryPhotos, romanticQuotes } from './data/photos.js';
import confetti from 'canvas-confetti';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0.0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPhotoDrawerOpen, setIsPhotoDrawerOpen] = useState(false);
  const [isCinemaLightsOff, setIsCinemaLightsOff] = useState(true);
  const [characterMode, setCharacterMode] = useState('models'); // default to 3D models
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [isReady, setIsReady] = useState(false);
  const [screenCoords, setScreenCoords] = useState({
    shabbir: { x: 0, y: 0, visible: false },
    husaina: { x: 0, y: 0, visible: false }
  });

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const targetProgressRef = useRef(0.0);
  const confettiTriggeredRef = useRef(false);

  // Safety fallback: ensure museum ready state transitions smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2200);

    // Global testing helpers
    window.__setMuseumProgress = (p) => {
      targetProgressRef.current = p;
      setScrollProgress(p);
    };
    window.__openPhoto = (id) => {
      const p = galleryPhotos.find((item) => item.id === id);
      if (p) setSelectedPhoto(p);
    };
    window.__closePhoto = () => setSelectedPhoto(null);
    window.__setMode = (m) => setCharacterMode(m);

    return () => clearTimeout(timer);
  }, []);

  // Compute active dialogue quote based on scroll progress
  const activeQuote = useMemo(() => {
    return romanticQuotes.find(
      (q) => scrollProgress >= q.progressRange[0] && scrollProgress <= q.progressRange[1]
    );
  }, [scrollProgress]);

  // Handle wheel & touch events for natural museum walkthrough
  useEffect(() => {
    const onWheel = (e) => {
      // Smooth, responsive walkthrough progression - calibrated for a relaxed, slow stroll (was 0.0011)
      const delta = e.deltaY * 0.00035;
      targetProgressRef.current = Math.max(0.0, Math.min(1.0, targetProgressRef.current + delta));
      setScrollProgress(targetProgressRef.current);
    };

    let touchStartY = 0;
    let touchStartX = 0;
    const onTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const deltaY = touchStartY - e.touches[0].clientY;
        const deltaX = touchStartX - e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;

        // Vertical drag moves into/out of gallery - slow & controlled (was 0.0022)
        targetProgressRef.current = Math.max(0.0, Math.min(1.0, targetProgressRef.current + deltaY * 0.00075));
        setScrollProgress(targetProgressRef.current);

        // Horizontal swipe triggers subtle wall peek
        if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            window.__cameraController?.lookAtWall('right');
          } else {
            window.__cameraController?.lookAtWall('left');
          }
        }
      }
    };

    const onKeyDown = (e) => {
      if (selectedPhoto || isPhotoDrawerOpen) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        targetProgressRef.current = Math.min(1.0, targetProgressRef.current + 0.016);
        setScrollProgress(targetProgressRef.current);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        targetProgressRef.current = Math.max(0.0, targetProgressRef.current - 0.016);
        setScrollProgress(targetProgressRef.current);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        window.__cameraController?.lookAtWall('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        window.__cameraController?.lookAtWall('right');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        window.__cameraController?.lookAtWall('center');
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedPhoto, isPhotoDrawerOpen]);

  // Audio ducking: when entering cinema lounge, pause ambient piano
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (scrollProgress >= 0.86) {
      if (!audio.paused) {
        audio.pause();
      }
    } else if (isMusicPlaying) {
      if (audio.paused) {
        audio.play().catch(console.warn);
      }
    }
  }, [scrollProgress, isMusicPlaying]);

  // Romantic Confetti trigger when reaching Cinema Lounge
  useEffect(() => {
    if (scrollProgress >= 0.92 && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f43f5e', '#fb7185', '#d4af37', '#ffffff']
      });
    } else if (scrollProgress < 0.7) {
      confettiTriggeredRef.current = false;
    }
  }, [scrollProgress]);

  // Walk & Wall Inspection Handlers
  const handleStepForward = () => {
    targetProgressRef.current = Math.min(1.0, targetProgressRef.current + 0.02);
    setScrollProgress(targetProgressRef.current);
    window.__cameraController?.lookAtWall('center');
  };

  const handleStepBackward = () => {
    targetProgressRef.current = Math.max(0.0, targetProgressRef.current - 0.02);
    setScrollProgress(targetProgressRef.current);
    window.__cameraController?.lookAtWall('center');
  };

  const handleLookLeft = () => {
    window.__cameraController?.lookAtWall('left');
  };

  const handleLookRight = () => {
    window.__cameraController?.lookAtWall('right');
  };

  const handleCenterView = () => {
    window.__cameraController?.lookAtWall('center');
  };

  // Quick Room Navigation
  const handleNavigateTo = (p) => {
    targetProgressRef.current = p;
    setScrollProgress(p);
  };

  // Toggle Background Music
  const handleToggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio.play()
        .then(() => setIsMusicPlaying(true))
        .catch((err) => {
          console.warn("Audio autoplay policy", err);
          setIsMusicPlaying(false);
        });
    }
  };

  // Toggle Character Style
  const handleToggleCharacterMode = () => {
    setCharacterMode((prev) => (prev === 'likeness' ? 'models' : 'likeness'));
  };

  // Resolve video autoplay interaction
  const handleResolveAutoplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play()
      .then(() => setIsAutoplayBlocked(false))
      .catch(console.warn);
  };

  // Photo modal navigation
  const handleNextPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = galleryPhotos.findIndex((p) => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % galleryPhotos.length;
    setSelectedPhoto(galleryPhotos[nextIndex]);
  };

  const handlePrevPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = galleryPhotos.findIndex((p) => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    setSelectedPhoto(galleryPhotos[prevIndex]);
  };

  return (
    <div className="museum-app-root">
      {/* Hidden Media Elements */}
      <video
        ref={videoRef}
        src="/assets/videos/shabbir_husaina_cinema.mp4"
        poster="/assets/videos/cinema_poster.jpg"
        playsInline
        crossOrigin="anonymous"
        loop
        preload="auto"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '640px',
          height: '360px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      <audio
        ref={audioRef}
        src="/assets/audio/romantic_piano.mp3"
        loop
        preload="auto"
      />

      {/* 3D WebGL Canvas Viewport */}
      <MuseumCanvas
        scrollProgress={scrollProgress}
        onUpdateCoords={setScreenCoords}
        onSelectPhoto={setSelectedPhoto}
        characterMode={characterMode}
        videoRef={videoRef}
        audioRef={audioRef}
        isMusicPlaying={isMusicPlaying}
        isCinemaLightsOff={isCinemaLightsOff}
        onAutoplayBlockedChange={setIsAutoplayBlocked}
        onLoadingProgress={(p) => setLoadingProgress(Math.max(p, 15))}
        onReady={() => setIsReady(true)}
      />

      {/* Top Navigation HUD */}
      <NavigationHUD
        progress={scrollProgress}
        onNavigateTo={handleNavigateTo}
        onOpenPhotoDrawer={() => setIsPhotoDrawerOpen(true)}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
      />

      {/* Floating Name Labels for Shabbir & Husaina */}
      <CharacterLabels
        screenCoords={screenCoords}
        activeQuote={activeQuote}
        isSeated={scrollProgress >= 0.88}
      />

      {/* Grand Entrance Overlay */}
      <EntranceOverlay
        progress={scrollProgress}
        onEnter={() => handleNavigateTo(0.14)}
      />

      {/* Interactive Museum Walk & Wall Inspection Controls */}
      <MuseumWalkControls
        visible={scrollProgress < 0.85 && !selectedPhoto && !isPhotoDrawerOpen}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onLookLeft={handleLookLeft}
        onLookRight={handleLookRight}
        onCenterView={handleCenterView}
      />

      {/* Cinema Room Media HUD with Lights Toggle */}
      <CinemaHUD
        videoRef={videoRef}
        visible={scrollProgress >= 0.85}
        isAutoplayBlocked={isAutoplayBlocked}
        isLightsOff={isCinemaLightsOff}
        onToggleLights={() => setIsCinemaLightsOff((prev) => !prev)}
        onResolveAutoplay={handleResolveAutoplay}
      />

      {/* Exhibition Photos Drawer (All 16 framed photos on Left & Right walls) */}
      <PhotoDrawer
        isOpen={isPhotoDrawerOpen}
        onClose={() => setIsPhotoDrawerOpen(false)}
        onSelectPhoto={setSelectedPhoto}
        onNavigateToProgress={handleNavigateTo}
      />

      {/* High-Resolution Interactive Photo Viewer */}
      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
      />

      {/* Initial Romantic Loading Screen */}
      <LoadingScreen
        progress={loadingProgress}
        isReady={isReady}
      />
    </div>
  );
}
