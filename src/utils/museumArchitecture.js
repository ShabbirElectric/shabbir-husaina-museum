import * as THREE from 'three';
import {
  createMarbleTexture,
  createWallTexture,
  createCeilingTexture,
  createWoodTexture
} from './textureGenerators.js';
import { buildStatueMonument } from './statueBuilder.js';

/**
 * Builds the complete 3D realistic museum architecture
 */
export function buildMuseumArchitecture({ scene, textureLoader }) {
  const museum = new THREE.Group();
  museum.name = "MuseumArchitecture";

  // Textures
  const marbleTex = createMarbleTexture();
  const wallTex = createWallTexture();
  const ceilingTex = createCeilingTexture();
  const woodTex = createWoodTexture();

  // Materials
  const floorMat = new THREE.MeshStandardMaterial({
    map: marbleTex,
    roughness: 0.15, // Polished reflection
    metalness: 0.08
  });

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTex,
    roughness: 0.85,
    metalness: 0.02
  });

  const ceilingMat = new THREE.MeshStandardMaterial({
    map: ceilingTex,
    roughness: 0.9,
    metalness: 0.1
  });

  const cinemaWoodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.45,
    metalness: 0.1
  });

  const baseboardMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.3,
    metalness: 0.4
  });

  // 1. FLOOR (Z: 32 down to -94, Width: 14)
  const floorLength = 126;
  const floorWidth = 14;
  const floorGeo = new THREE.PlaneGeometry(floorWidth, floorLength);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0, -31);
  floorMesh.receiveShadow = true;
  museum.add(floorMesh);

  // 2. CEILING (Y = 5.2)
  const ceilingGeo = new THREE.PlaneGeometry(floorWidth, floorLength);
  const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.position.set(0, 5.2, -31);
  museum.add(ceilingMesh);

  // 3. MAIN OUTER WALLS (Left & Right)
  const wallHeight = 5.2;

  // Left Wall (X = -7)
  const lWallGeo = new THREE.PlaneGeometry(floorLength, wallHeight);
  const leftWall = new THREE.Mesh(lWallGeo, wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-7, wallHeight / 2, -31);
  leftWall.receiveShadow = true;
  museum.add(leftWall);

  // Right Wall (X = +7)
  const rWallGeo = new THREE.PlaneGeometry(floorLength, wallHeight);
  const rightWall = new THREE.Mesh(rWallGeo, wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(7, wallHeight / 2, -31);
  rightWall.receiveShadow = true;
  museum.add(rightWall);

  // 4. BASEBOARDS (Skirting along the floor)
  const bbHeight = 0.15;
  const bbDepth = 0.05;
  const bbGeo = new THREE.BoxGeometry(bbDepth, bbHeight, floorLength);

  const leftBb = new THREE.Mesh(bbGeo, baseboardMat);
  leftBb.position.set(-6.97, bbHeight / 2, -31);
  museum.add(leftBb);

  const rightBb = new THREE.Mesh(bbGeo, baseboardMat);
  rightBb.position.set(6.97, bbHeight / 2, -31);
  museum.add(rightBb);

  // 5. ENTRANCE BACK WALL (Z = 32)
  const entWallGeo = new THREE.PlaneGeometry(floorWidth, wallHeight);
  const entWall = new THREE.Mesh(entWallGeo, wallMat);
  entWall.position.set(0, wallHeight / 2, 32);
  entWall.rotation.y = Math.PI;
  entWall.receiveShadow = true;
  museum.add(entWall);

  // 6. CINEMA BACK WALL (Z = -92) - Luxury Acoustic Wood Slat Wall
  const cinWallGeo = new THREE.PlaneGeometry(floorWidth, wallHeight);
  const cinWall = new THREE.Mesh(cinWallGeo, cinemaWoodMat);
  cinWall.position.set(0, wallHeight / 2, -92);
  cinWall.receiveShadow = true;
  museum.add(cinWall);

  // 7. ARCHITECTURAL PORTALS & DIVIDER WALLS
  // Helper to build room portal archway
  const createArchwayDivider = (zPos, openingWidth = 5.6) => {
    const dividerGroup = new THREE.Group();
    dividerGroup.position.set(0, 0, zPos);

    const sideWidth = (floorWidth - openingWidth) / 2;

    // Left wall wing
    const leftWingGeo = new THREE.BoxGeometry(sideWidth, wallHeight, 0.4);
    const leftWing = new THREE.Mesh(leftWingGeo, wallMat);
    leftWing.position.set(-floorWidth / 2 + sideWidth / 2, wallHeight / 2, 0);
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    dividerGroup.add(leftWing);

    // Right wall wing
    const rightWingGeo = new THREE.BoxGeometry(sideWidth, wallHeight, 0.4);
    const rightWing = new THREE.Mesh(rightWingGeo, wallMat);
    rightWing.position.set(floorWidth / 2 - sideWidth / 2, wallHeight / 2, 0);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    dividerGroup.add(rightWing);

    // Top lintel / header over arch
    const headerHeight = 1.1;
    const headerGeo = new THREE.BoxGeometry(openingWidth, headerHeight, 0.4);
    const header = new THREE.Mesh(headerGeo, wallMat);
    header.position.set(0, wallHeight - headerHeight / 2, 0);
    header.castShadow = true;
    header.receiveShadow = true;
    dividerGroup.add(header);

    // Arch trim / accent moulding (Gold / dark trim)
    const trimGeo = new THREE.BoxGeometry(openingWidth + 0.1, 0.08, 0.44);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x222225, metalness: 0.6, roughness: 0.3 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, wallHeight - headerHeight, 0);
    dividerGroup.add(trim);

    return dividerGroup;
  };

  // Divider 1: Entrance to Room 1 (Z = 18) - Grand open archway
  museum.add(createArchwayDivider(18, 7.8));

  // Divider 2: Room 1 to Room 2 (Z = -9) - Spacious archway with unobstructed wall sightlines
  museum.add(createArchwayDivider(-9, 7.8));

  // Divider 3: Feature Art Divider Wall in Room 2 (Z = -24)
  // Slim, elegant center art display partition with generous side walkways
  const centerPartitionGroup = new THREE.Group();
  centerPartitionGroup.position.set(0, 0, -24);
  const centerPartGeo = new THREE.BoxGeometry(3.6, wallHeight, 0.45);
  const centerPart = new THREE.Mesh(centerPartGeo, wallMat);
  centerPart.position.set(0, wallHeight / 2, 0);
  centerPart.castShadow = true;
  centerPart.receiveShadow = true;
  centerPartitionGroup.add(centerPart);
  museum.add(centerPartitionGroup);

  // Divider 4: Room 2 to Room 3 (Z = -30) - Wide clear archway
  museum.add(createArchwayDivider(-30, 7.8));

  // Divider 5: Room 3 to Cinema Lounge (Z = -65) - Velvet Portal Entry with wide opening
  const cinemaDivider = createArchwayDivider(-65, 6.8);
  // Add luxury dark velvet drapery accents positioned safely to the sides
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0x1a0f12, roughness: 0.85 });
  const lCurtainGeo = new THREE.CylinderGeometry(0.35, 0.45, wallHeight - 1.0, 16);
  const lCurtain = new THREE.Mesh(lCurtainGeo, curtainMat);
  lCurtain.position.set(-3.3, (wallHeight - 1.0) / 2, 0);
  cinemaDivider.add(lCurtain);

  const rCurtainGeo = new THREE.CylinderGeometry(0.35, 0.45, wallHeight - 1.0, 16);
  const rCurtain = new THREE.Mesh(rCurtainGeo, curtainMat);
  rCurtain.position.set(3.3, (wallHeight - 1.0) / 2, 0);
  cinemaDivider.add(rCurtain);

  museum.add(cinemaDivider);

  // 8. CEILING LIGHT TRACKS (Two continuous dark rails running down the hall)
  const trackGeo = new THREE.BoxGeometry(0.1, 0.08, floorLength);
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x111113, metalness: 0.8, roughness: 0.2 });

  const leftTrack = new THREE.Mesh(trackGeo, trackMat);
  leftTrack.position.set(-4.5, 5.14, -31);
  museum.add(leftTrack);

  const rightTrack = new THREE.Mesh(trackGeo, trackMat);
  rightTrack.position.set(4.5, 5.14, -31);
  museum.add(rightTrack);

  // Add cylinder track spot fixtures periodically along rails
  const fixtureGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.2, 12);
  const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x1f1f22, metalness: 0.7 });
  for (let tz = 25; tz > -85; tz -= 4) {
    const lFix = new THREE.Mesh(fixtureGeo, fixtureMat);
    lFix.position.set(-4.5, 5.0, tz);
    lFix.rotation.z = Math.PI / 6;
    museum.add(lFix);

    const rFix = new THREE.Mesh(fixtureGeo, fixtureMat);
    rFix.position.set(4.5, 5.0, tz);
    rFix.rotation.z = -Math.PI / 6;
    museum.add(rFix);
  }

  // 9. GRAND ENTRANCE ARCHITECTURAL CROWN AT Z = 24
  const crownGroup = new THREE.Group();
  crownGroup.position.set(0, 4.8, 24);

  const crownGeo = new THREE.BoxGeometry(6.4, 0.22, 0.5);
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0x242428,
    roughness: 0.3,
    metalness: 0.5
  });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crownGroup.add(crown);

  // Gold accent trim band
  const goldTrimGeo = new THREE.BoxGeometry(6.5, 0.06, 0.54);
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.8
  });
  const goldTrim = new THREE.Mesh(goldTrimGeo, goldTrimMat);
  goldTrim.position.y = -0.12;
  crownGroup.add(goldTrim);

  museum.add(crownGroup);

  // 10. GRAND CENTERPIECE STATUE OF SHABBIR & HUSAINA
  // Located prominently in Room 1 / Centerpiece Rotunda at Z = 4.0
  let statueMonument = null;
  if (textureLoader) {
    statueMonument = buildStatueMonument({ scene, textureLoader });
  }

  // 11. GENERAL AMBIENT WARMTH & GALLERY DOWNLIGHTS
  const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.25);
  museum.add(ambientLight);

  // Gallery Downlights in each room for elegant architectural illumination
  const roomDownlightsData = [
    { x: 0, y: 4.9, z: 24, intensity: 18, dist: 16 },
    { x: 0, y: 4.9, z: 6,  intensity: 22, dist: 18 },
    { x: 0, y: 4.9, z: -18, intensity: 22, dist: 18 },
    { x: 0, y: 4.9, z: -46, intensity: 22, dist: 18 },
    { x: 0, y: 4.9, z: -76, intensity: 18, dist: 16 }
  ];

  const downlightMeshes = [];
  roomDownlightsData.forEach((dl) => {
    const light = new THREE.PointLight(0xfffaee, dl.intensity, dl.dist, 1.1);
    light.position.set(dl.x, dl.y, dl.z);
    museum.add(light);
    downlightMeshes.push(light);
  });

  // Main directional light for gentle couple contact shadows
  const mainFollowLight = new THREE.DirectionalLight(0xfff2e0, 1.2);
  mainFollowLight.position.set(2, 8, 20);
  mainFollowLight.target.position.set(0, 0, 0);
  mainFollowLight.castShadow = true;
  mainFollowLight.shadow.mapSize.width = 1024;
  mainFollowLight.shadow.mapSize.height = 1024;
  mainFollowLight.shadow.camera.near = 0.5;
  mainFollowLight.shadow.camera.far = 40;
  mainFollowLight.shadow.bias = -0.0005;
  museum.add(mainFollowLight);
  museum.add(mainFollowLight.target);

  scene.add(museum);
  return {
    museum,
    ambientLight,
    roomDownlights: downlightMeshes,
    mainFollowLight,
    statueMonument
  };
}
