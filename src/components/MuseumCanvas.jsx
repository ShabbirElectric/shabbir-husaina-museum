import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { buildMuseumArchitecture } from '../utils/museumArchitecture.js';
import { buildCinemaLounge } from '../utils/cinemaBuilder.js';
import { createPhotoFrame } from '../utils/frameBuilder.js';
import { CharacterManager } from '../utils/characterManager.js';
import { CameraController } from '../utils/cameraPath.js';
import { galleryPhotos, romanticQuotes } from '../data/photos.js';

export default function MuseumCanvas({
  scrollProgress,
  onUpdateCoords,
  onSelectPhoto,
  characterMode,
  videoRef,
  audioRef,
  isMusicPlaying,
  isCinemaLightsOff = true,
  onAutoplayBlockedChange,
  onLoadingProgress,
  onReady
}) {
  const canvasRef = useRef(null);
  const characterManagerRef = useRef(null);
  const cameraControllerRef = useRef(null);
  const cinemaObjectsRef = useRef(null);
  const museumLightsRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mousePointerRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121418);
    scene.fog = new THREE.Fog(0x121418, 55, 160);

    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      180
    );
    camera.position.set(0, 2.2, 28);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // 2. Texture & Loading Manager
    let loadedCount = 0;
    const totalAssets = galleryPhotos.length + 4; // photos + cutouts + models
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const pct = Math.min(100, (itemsLoaded / itemsTotal) * 100);
      if (onLoadingProgress) onLoadingProgress(pct);
    };
    loadingManager.onLoad = () => {
      if (onLoadingProgress) onLoadingProgress(100);
      if (onReady) onReady();
    };

    const textureLoader = new THREE.TextureLoader(loadingManager);

    // 3. Build Museum Architecture & Grand Statue Monument
    const museumArchitecture = buildMuseumArchitecture({ scene, textureLoader });
    museumLightsRef.current = museumArchitecture;

    // 4. Build Cinema Lounge & Screen
    const cinemaObjects = buildCinemaLounge({
      scene,
      videoElement: videoRef.current
    });
    cinemaObjectsRef.current = cinemaObjects;

    // 5. Build 16 Framed Wall Photographs
    const frameMeshes = [];
    galleryPhotos.forEach((photo) => {
      const frameGroup = createPhotoFrame({
        photo,
        textureLoader,
        scene,
        onLoaded: () => {
          loadedCount++;
          if (onLoadingProgress) {
            onLoadingProgress((loadedCount / totalAssets) * 100);
          }
        }
      });
      frameMeshes.push(frameGroup);
    });

    // 6. Character Manager (Shabbir & Husaina)
    const characterManager = new CharacterManager({ scene, camera });
    characterManager.setMode(characterMode);
    characterManagerRef.current = characterManager;

    // 7. Camera Controller
    const cameraController = new CameraController({ camera, canvas });
    cameraControllerRef.current = cameraController;
    window.__cameraController = cameraController;

    // 8. Raycasting for Photo Frame Interaction & Cursor Hover
    const onPointerMove = (e) => {
      mousePointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mousePointerRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);
      const photoHit = intersects.find((hit) => hit.object.userData?.isPhoto);

      if (photoHit) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    };

    const onPointerClick = (e) => {
      // Ignore drags
      mousePointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mousePointerRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);
      const photoHit = intersects.find((hit) => hit.object.userData?.isPhoto);

      if (photoHit && photoHit.object.userData.photoData) {
        onSelectPhoto(photoHit.object.userData.photoData);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('click', onPointerClick);

    // 9. Resize Handling
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update Camera along spline
      const currentProgress = cameraController.update(delta);

      // Update Characters (Walking or Seated on Sofa)
      characterManager.update(currentProgress, delta, elapsed);

      // Send screen coordinates for overhead name tags
      if (onUpdateCoords) {
        onUpdateCoords(characterManager.getScreenCoords());
      }

      // Dynamic Cinema Lighting: Turn lights OFF in the cinema theater!
      const inCinema = currentProgress >= 0.85;
      const cinemaP = inCinema ? Math.min(1.0, (currentProgress - 0.85) / 0.12) : 0.0;
      
      if (museumLightsRef.current) {
        const { ambientLight, mainFollowLight, roomDownlights } = museumLightsRef.current;
        const lightsOff = isCinemaLightsOff && inCinema;
        
        // Dim ambient light down to dark cinema theater (0.05)
        const targetAmb = lightsOff ? 1.25 * (1 - cinemaP) + 0.05 * cinemaP : 1.25;
        if (ambientLight) {
          ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmb, 0.08);
        }

        // Dim directional key light to near zero (0.03)
        const targetDir = lightsOff ? 1.2 * (1 - cinemaP) + 0.03 * cinemaP : 1.2;
        if (mainFollowLight) {
          mainFollowLight.intensity = THREE.MathUtils.lerp(mainFollowLight.intensity, targetDir, 0.08);
        }

        // Turn down lounge ceiling downlight so theater is dark
        if (roomDownlights && roomDownlights.length > 0) {
          const loungeDownlight = roomDownlights[roomDownlights.length - 1];
          if (loungeDownlight) {
            loungeDownlight.intensity = THREE.MathUtils.lerp(
              loungeDownlight.intensity,
              lightsOff ? 0.0 : 18.0,
              0.08
            );
          }
        }
      }

      // Cinema video ambient reaction
      if (cinemaObjects && cinemaObjects.ambientScreenLight && videoRef.current) {
        if (!videoRef.current.paused) {
          cinemaObjects.ambientScreenLight.intensity =
            7.0 + Math.sin(elapsed * 4) * 1.5;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('click', onPointerClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update target progress when scrollProgress changes
  useEffect(() => {
    if (cameraControllerRef.current) {
      cameraControllerRef.current.setProgress(scrollProgress);
    }
  }, [scrollProgress]);

  // Update character mode
  useEffect(() => {
    if (characterManagerRef.current) {
      characterManagerRef.current.setMode(characterMode);
    }
  }, [characterMode]);

  // Video Autoplay / Pause logic based on progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (scrollProgress >= 0.88) {
      // In the Cinema Lounge!
      if (video.paused) {
        video
          .play()
          .then(() => {
            if (onAutoplayBlockedChange) onAutoplayBlockedChange(false);
          })
          .catch((err) => {
            console.warn("Video autoplay waiting for interaction", err);
            if (onAutoplayBlockedChange) onAutoplayBlockedChange(true);
          });
      }
    } else {
      // Not in cinema lounge, pause video to save resources
      if (!video.paused) {
        video.pause();
      }
    }
  }, [scrollProgress]);

  return (
    <div className="museum-canvas-wrap">
      <canvas ref={canvasRef} className="museum-webgl-canvas" />
    </div>
  );
}
