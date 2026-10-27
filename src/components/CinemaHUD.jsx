import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Film,
  Sparkles,
  Lightbulb
} from 'lucide-react';

export default function CinemaHUD({
  videoRef,
  visible,
  isAutoplayBlocked,
  isLightsOff = true,
  onToggleLights,
  onResolveAutoplay
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setIsMuted(video.muted);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration || 75.5);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [videoRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.warn);
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(console.warn);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.warn);
    } else if (video.requestFullscreen) {
      video.requestFullscreen().catch(console.warn);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!visible) return null;

  return (
    <div className="cinema-hud-container">
      {/* Prominent Play Banner if autoplay is waiting for interaction */}
      {isAutoplayBlocked && (
        <div className="autoplay-unblock-banner" onClick={onResolveAutoplay}>
          <Play className="w-5 h-5 fill-amber-300 text-amber-300 animate-pulse" />
          <span>Click to Play Our Cinema Video with Audio</span>
        </div>
      )}

      {/* Main Glass HUD Bar */}
      <div className="cinema-hud-bar">
        <div className="cinema-hud-left">
          <button
            className="hud-play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <button
            className="hud-icon-btn"
            onClick={handleRestart}
            aria-label="Restart Video"
            title="Restart Video"
          >
            <RotateCcw size={17} />
          </button>

          <div className="cinema-title-wrap">
            <span className="cinema-title">Shabbir & Husaina • Our Song</span>
            <span className="cinema-time">
              {formatTime(currentTime)} / {formatTime(duration || 75.5)}
            </span>
          </div>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="cinema-scrubber-wrap">
          <input
            type="range"
            min={0}
            max={duration || 75.5}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="cinema-slider"
          />
        </div>

        <div className="cinema-hud-right">
          {/* Cinema Lights Mode Toggle */}
          <button
            className={`hud-lights-btn ${isLightsOff ? 'active-lights-off' : ''}`}
            onClick={onToggleLights}
            aria-label="Toggle Theater Lights"
            title={isLightsOff ? "Theater Lights OFF (Click to Turn ON)" : "Theater Lights ON (Click to Turn OFF)"}
          >
            <Lightbulb size={16} />
            <span>{isLightsOff ? "Lights OFF" : "Lights ON"}</span>
          </button>

          <button
            className="hud-icon-btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            className="hud-icon-btn"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
