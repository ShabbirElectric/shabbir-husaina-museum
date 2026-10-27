import * as THREE from 'three';
import { getGalleryPathOffset } from './galleryPath.js';

/**
 * Cinematic third-person follow camera tracking Shabbir & Husaina
 * with interactive Left/Right wall inspection and smooth walkthrough controls.
 */
export class CameraController {
  constructor({ camera, canvas }) {
    this.camera = camera;
    this.canvas = canvas;

    this.progress = 0.0;
    this.targetProgress = 0.0;

    // Interactive lateral navigation & wall inspection
    this.lateralOffset = 0.0;
    this.targetLateralOffset = 0.0;
    this.lookYaw = 0.0;
    this.targetLookYaw = 0.0;

    // Mouse parallax offsets
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Smoothed lookAt and position
    this.currentLookAt = new THREE.Vector3(0, 1.8, 20);
    this.currentPos = new THREE.Vector3(0, 2.15, 26);

    this.targetPos = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    }, { passive: true });

    // Keyboard navigation: A/D or Left/Right arrows for wall inspection
    window.addEventListener('keydown', (e) => {
      // Don't intercept when user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.lookAtWall('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.lookAtWall('right');
      } else if (e.key === 'c' || e.key === 'C') {
        this.lookAtWall('center');
      }
    });
  }

  setProgress(p, instant = false) {
    this.targetProgress = Math.max(0.0, Math.min(1.0, p));
    if (instant) {
      this.progress = this.targetProgress;
    }
  }

  lookAtWall(side) {
    if (side === 'left') {
      // Stay safely inside the open central aisle to guarantee no pillar or divider wall blocks the view
      this.targetLateralOffset = -0.25;
      this.targetLookYaw = -1.08; // Turn camera head ~62° directly facing left wall art
    } else if (side === 'right') {
      this.targetLateralOffset = 0.25;
      this.targetLookYaw = 1.08; // Turn camera head ~62° directly facing right wall art
    } else {
      this.targetLateralOffset = 0.0;
      this.targetLookYaw = 0.0; // Return to center forward gaze
    }
  }

  step(forward = true) {
    // Slower, gentle walkthrough steps (was 0.045)
    const delta = forward ? 0.02 : -0.02;
    this.setProgress(this.targetProgress + delta);
    // When walking, re-center gaze naturally
    this.targetLookYaw *= 0.5;
    this.targetLateralOffset *= 0.5;
  }

  calculateTrajectory(p) {
    // Gallery walking range: Z goes from 21 down to -64
    // Cinema lounge is from -65 to -92
    if (p < 0.85) {
      // Walking Phase
      const walkP = p / 0.85;
      const startCoupleZ = 21.0;
      const endCoupleZ = -64.0;
      const coupleZ = startCoupleZ + (endCoupleZ - startCoupleZ) * walkP;

      // Gallery architectural detours (statue at Z=3.5, partition at Z=-23.75)
      const pathX = getGalleryPathOffset(coupleZ);
      const camPathX = getGalleryPathOffset(coupleZ + 3.8);

      // Smooth lateral offset & yaw for wall inspection
      this.lateralOffset += (this.targetLateralOffset - this.lateralOffset) * 0.085;
      this.lookYaw += (this.targetLookYaw - this.lookYaw) * 0.085;

      // Gentle natural camera float / drift
      const camDriftX = Math.sin(walkP * Math.PI * 3) * 0.15;
      const camHeight = 2.15;
      const followDistance = 4.4; // 4.4m behind the couple

      // Clamp camera X safely inside the central walkway corridor so it never touches any pillar or wall
      const safeCamX = THREE.MathUtils.clamp(
        camPathX + camDriftX + this.lateralOffset,
        -1.8,
        1.8
      );

      this.targetPos.set(
        safeCamX,
        camHeight,
        coupleZ + followDistance
      );

      // Camera view direction
      const lookDist = 5.5;
      const yaw = this.lookYaw;
      const lookDirX = Math.sin(yaw);
      const lookDirZ = -Math.cos(yaw);

      this.targetLookAt.set(
        safeCamX + lookDirX * lookDist,
        2.0,
        coupleZ + followDistance + lookDirZ * lookDist
      );
    } else {
      // Transition to Cinema Lounge: Unobstructed view of the cinema screen
      const loungeP = (p - 0.85) / 0.15; // 0 to 1

      // Reset any lateral inspection offsets in the cinema room
      this.lateralOffset += (0 - this.lateralOffset) * 0.1;
      this.lookYaw += (0 - this.lookYaw) * 0.1;

      // Camera smoothly enters lounge and sits comfortably at sofa at Z = -75.8, looking straight at screen at Z = -88
      const startCamZ = -64.0 + 4.4; // -59.6
      const finalCamZ = -75.8;
      const currentCamZ = startCamZ + (finalCamZ - startCamZ) * loungeP;

      const startHeight = 2.15;
      const finalHeight = 1.65; // Comfortable seated eye level
      const currentHeight = startHeight + (finalHeight - startHeight) * loungeP;

      this.targetPos.set(0, currentHeight, currentCamZ);

      // Looking squarely at the center of the giant cinema screen at Z = -88, height = 2.7
      const startLookZ = -64.0 - 4.5;
      const finalLookZ = -88.0;
      const currentLookZ = startLookZ + (finalLookZ - startLookZ) * loungeP;

      const finalLookY = 2.7; // Exactly matches screen center height (screenGroup Y = 2.7)
      const currentLookY = 1.95 + (finalLookY - 1.95) * loungeP;

      this.targetLookAt.set(0, currentLookY, currentLookZ);
    }
  }

  update(delta) {
    // Smooth progress lerp: 0.06 for graceful, cinematic gliding
    this.progress += (this.targetProgress - this.progress) * 0.06;

    // Mouse parallax lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Calculate position along trajectory
    this.calculateTrajectory(this.progress);

    // Apply gentle mouse parallax offset
    const parallaxX = this.mouse.x * 0.28;
    const parallaxY = this.mouse.y * 0.18;

    const finalTargetPos = this.targetPos.clone();
    finalTargetPos.x += parallaxX;
    finalTargetPos.y += parallaxY;

    // Smooth camera damping
    this.camera.position.lerp(finalTargetPos, 0.095);

    const finalTargetLookAt = this.targetLookAt.clone();
    finalTargetLookAt.x += this.mouse.x * 0.35;
    finalTargetLookAt.y += this.mouse.y * 0.22;

    this.currentLookAt.lerp(finalTargetLookAt, 0.095);
    this.camera.lookAt(this.currentLookAt);

    return this.progress;
  }
}
