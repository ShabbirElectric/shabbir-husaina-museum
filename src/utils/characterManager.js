import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getGalleryPathOffset } from './galleryPath.js';

/**
 * Manages the realistic 3D animated Boy (Shabbir) and Girl (Husaina) characters
 * walking together side-by-side into the museum halls.
 */
export class CharacterManager {
  constructor({ scene, camera }) {
    this.scene = scene;
    this.camera = camera;

    this.group = new THREE.Group();
    this.group.name = "CharactersGroup";
    this.scene.add(this.group);

    // Positions & tracking
    this.currentZ = 21.0;
    this.isSeated = false;

    // Head positions in 3D for floating name labels
    // Husaina is on the LEFT (-X), Shabbir is on the RIGHT (+X)
    this.shabbirHeadPos = new THREE.Vector3(0.48, 2.05, 21);
    this.husainaHeadPos = new THREE.Vector3(-0.48, 1.85, 21);

    // Screen-space 2D coordinates for UI overlay
    this.screenCoords = {
      shabbir: { x: 0, y: 0, visible: true },
      husaina: { x: 0, y: 0, visible: true }
    };

    // Animation Mixers
    this.shabbirMixer = null;
    this.husainaMixer = null;
    this.walkActionShabbir = null;
    this.walkActionHusaina = null;
    this.husainaWalkClip = null;

    // 3D Models
    this.shabbirModel = null;
    this.husainaModel = null;
    this.shadowMesh = null;

    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
    this.textureLoader = new THREE.TextureLoader();

    this.initGroundShadow();
    this.load3DCharacters();
  }

  setMode(mode) {
    this.mode = mode;
  }

  // 1. Soft Oval Ground Contact Shadows for realistic floor contact
  initGroundShadow() {
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.4, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(0, 0.02, 21);
    this.group.add(this.shadowMesh);
  }

  // 2. Load Photorealistic 3D Boy (Nathan) and 3D Girl (Ready Player Me Brunette)
  load3DCharacters() {
    // A. Male Character: Shabbir (RenderPeople Nathan 3D Model with Walk Animation)
    this.gltfLoader.load(
      '/assets/models/boy/scene.gltf',
      (gltf) => {
        this.shabbirModel = gltf.scene;
        // Nathan is 185 cm tall, scale to 0.0098 for ~1.82m realistic height
        this.shabbirModel.scale.set(0.0098, 0.0098, 0.0098);
        this.shabbirModel.position.set(0.48, 0, 21);
        this.shabbirModel.rotation.y = Math.PI; // Face walking forward towards gallery (-Z)

        this.shabbirModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.55;
            }
          }
        });

        // Animation mixer for Shabbir
        if (gltf.animations && gltf.animations.length > 0) {
          this.shabbirMixer = new THREE.AnimationMixer(this.shabbirModel);
          const walkClip = gltf.animations[0]; // Take 001
          this.walkActionShabbir = this.shabbirMixer.clipAction(walkClip);
          this.walkActionShabbir.play();
        }

        this.group.add(this.shabbirModel);
      },
      undefined,
      (err) => console.warn('Failed to load boy 3D model:', err)
    );

    // B. Female Character: Husaina (Photorealistic 3D Human Model with Walk Animation)
    // 1. Load walk animation FBX and retarget to Ready Player Me skeleton
    this.fbxLoader.load(
      '/assets/models/walking.fbx',
      (fbx) => {
        if (fbx.animations && fbx.animations.length > 0) {
          const rawClip = fbx.animations[0];
          const clip = rawClip.clone();

          // Retarget Mixamo tracks to Ready Player Me bone names:
          // e.g. mixamorigHips.position -> Hips.position
          clip.tracks.forEach((track) => {
            track.name = track.name.replace(/mixamorig:?/g, '');
            const parts = track.name.split('.');
            if (parts[1] === 'position') {
              for (let i = 0; i < track.values.length; i++) {
                track.values[i] = track.values[i] * 0.01; // scale cm to meters
              }
            }
          });

          this.husainaWalkClip = clip;
          this.applyHusainaWalkAnimation();
        }
      },
      undefined,
      (err) => console.warn('Failed to load walking.fbx:', err)
    );

    // 2. Load Ready Player Me Brunette 3D Model
    this.gltfLoader.load(
      '/assets/models/brunette.glb',
      (gltf) => {
        this.husainaModel = gltf.scene;
        // Ready Player Me avatars are naturally 1.65m in meters
        this.husainaModel.scale.set(0.98, 0.98, 0.98);
        this.husainaModel.position.set(-0.48, 0, 21);
        this.husainaModel.rotation.y = Math.PI; // Face walking forward towards gallery (-Z)

        this.husainaModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Hide glasses for clear view of her eyes
            if (child.name.includes('Glasses')) {
              child.visible = false;
            }
            if (child.material) {
              child.material.roughness = 0.6;
              // Festive pastel cream/champagne styling for top & bottom
              if (child.name.includes('Outfit_Top') || child.name.includes('Outfit_Bottom')) {
                child.material.color = new THREE.Color(0xf6eed6);
              }
            }
          }
        });

        this.group.add(this.husainaModel);
        this.applyHusainaWalkAnimation();
      },
      undefined,
      (err) => console.warn('Failed to load brunette 3D model:', err)
    );
  }

  applyHusainaWalkAnimation() {
    if (!this.husainaModel || !this.husainaWalkClip || this.husainaMixer) return;

    this.husainaMixer = new THREE.AnimationMixer(this.husainaModel);
    this.walkActionHusaina = this.husainaMixer.clipAction(this.husainaWalkClip);
    this.walkActionHusaina.timeScale = 1.0;
    this.walkActionHusaina.play();
    this.walkActionHusaina.setEffectiveWeight(0.0); // start in idle standing pose
    this.husainaMixer.update(0.016);
  }

  update(progress, delta, time) {
    const walkingProgress = Math.min(1.0, progress / 0.88);
    const startZ = 21.0;
    const endZ = -64.0;
    const currentZ = startZ + (endZ - startZ) * walkingProgress;
    this.currentZ = currentZ;

    // Gallery path offset around center monument statue (Z = 3.5) and partition wall (Z = -23.75)
    const pathX = getGalleryPathOffset(currentZ);

    this.isSeated = progress >= 0.85;

    // Calculate actual movement speed from progress changes so characters only walk when moving
    const progressDiff = Math.abs(progress - (this.lastProgress ?? progress));
    this.lastProgress = progress;
    const velocity = progressDiff / Math.max(delta, 0.001);

    // Characters are walking when moving through the museum (progress < 0.85)
    const isActuallyMoving = velocity > 0.003 && progress > 0.005 && progress < 0.85;
    this.movingWeight = THREE.MathUtils.lerp(this.movingWeight ?? 0, isActuallyMoving ? 1.0 : 0.0, 0.12);

    const strideFreq = 4.0; // Slower, relaxed stride frequency (was 6.2)
    const bob = Math.abs(Math.sin(time * strideFreq)) * 0.012 * this.movingWeight;
    const sway = Math.sin(time * strideFreq * 0.5) * 0.009 * this.movingWeight;

    if (this.isSeated) {
      // In the Cinema Lounge:
      // Hide characters completely so the user has an unobstructed, private theater view of the screen!
      if (this.shabbirModel) this.shabbirModel.visible = false;
      if (this.husainaModel) this.husainaModel.visible = false;
      if (this.shadowMesh) this.shadowMesh.visible = false;
    } else {
      // Walking inside the museum halls
      // Update 3D Boy (Shabbir)
      if (this.shabbirModel) {
        this.shabbirModel.visible = true;
        this.shabbirModel.position.set(pathX + 0.48 + sway, bob, currentZ);
        if (this.shabbirMixer) {
          if (this.movingWeight > 0.05) {
            // Slower, graceful stroll (0.72 speed instead of 1.05)
            this.walkActionShabbir.timeScale = 0.72;
            this.shabbirMixer.update(delta * 0.72 * this.movingWeight);
          } else {
            // Calm idle breathing when stopped
            this.walkActionShabbir.timeScale = 0.18;
            this.shabbirMixer.update(delta * 0.18);
          }
        }
      }

      // Update 3D Girl (Husaina)
      if (this.husainaModel) {
        this.husainaModel.visible = true;
        this.husainaModel.position.set(pathX - 0.48 + sway, bob, currentZ);
        if (this.husainaMixer) {
          if (this.movingWeight > 0.05) {
            // Slower, graceful stroll (0.72 speed instead of 1.0)
            this.walkActionHusaina?.setEffectiveWeight(this.movingWeight);
            this.husainaMixer.update(delta * 0.72 * this.movingWeight);
          } else {
            this.walkActionHusaina?.setEffectiveWeight(0.0);
            this.husainaMixer.update(delta * 0.1);
          }
        }
      }

      // Ground contact shadow
      if (this.shadowMesh) {
        this.shadowMesh.visible = true;
        this.shadowMesh.position.set(pathX + sway, 0.02, currentZ);
      }

      // Floating name tag anchor positions above heads
      this.husainaHeadPos.set(pathX - 0.48 + sway, 1.82 + bob, currentZ);
      this.shabbirHeadPos.set(pathX + 0.48 + sway, 2.05 + bob, currentZ);
    }

    this.updateScreenCoordinates();
  }

  updateScreenCoordinates() {
    if (this.isSeated) {
      this.screenCoords.shabbir.visible = false;
      this.screenCoords.husaina.visible = false;
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const project = (vec3) => {
      const p = vec3.clone();
      p.project(this.camera);

      // Check if visible within camera frustum
      const isVisible = p.z < 1.0 && p.z > -1.0;
      const x = ((p.x + 1) * width) / 2;
      const y = ((-p.y + 1) * height) / 2;

      return { x, y, visible: isVisible };
    };

    this.screenCoords.shabbir = project(this.shabbirHeadPos);
    this.screenCoords.husaina = project(this.husainaHeadPos);
  }

  getScreenCoords() {
    return this.screenCoords;
  }
}
