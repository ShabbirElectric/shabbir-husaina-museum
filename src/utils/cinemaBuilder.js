import * as THREE from 'three';

/**
 * Builds the romantic sitting lounge sofa and giant cinema screen
 */
export function buildCinemaLounge({ scene, videoElement }) {
  const cinemaGroup = new THREE.Group();
  cinemaGroup.name = "CinemaLounge";

  // 1. Luxury Modern Sitting Sofa / Bench at Z = -76
  const sofaGroup = new THREE.Group();
  sofaGroup.position.set(0, 0, -76);

  // Sofa Base Plinth / Wood Frame
  const baseGeo = new THREE.BoxGeometry(3.6, 0.25, 1.4);
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x221711,
    roughness: 0.4,
    metalness: 0.1
  });
  const baseMesh = new THREE.Mesh(baseGeo, woodMat);
  baseMesh.position.y = 0.25;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  sofaGroup.add(baseMesh);

  // Sofa Legs (4 tapered brass/dark legs)
  const legGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.25, 12);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x9e8048, metalness: 0.8, roughness: 0.3 });
  const legPositions = [
    [-1.6, 0.125, -0.55],
    [1.6, 0.125, -0.55],
    [-1.6, 0.125, 0.55],
    [1.6, 0.125, 0.55]
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    sofaGroup.add(leg);
  });

  // Plush Seat Cushions (warm elegant charcoal velvet)
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x2b292c,
    roughness: 0.85,
    metalness: 0.05
  });

  // Left seat (Shabbir) & Right seat (Husaina)
  const seatGeo = new THREE.BoxGeometry(1.65, 0.35, 1.25);
  const leftSeat = new THREE.Mesh(seatGeo, cushionMat);
  leftSeat.position.set(-0.85, 0.52, 0.0);
  leftSeat.castShadow = true;
  leftSeat.receiveShadow = true;
  sofaGroup.add(leftSeat);

  const rightSeat = new THREE.Mesh(seatGeo, cushionMat);
  rightSeat.position.set(0.85, 0.52, 0.0);
  rightSeat.castShadow = true;
  rightSeat.receiveShadow = true;
  sofaGroup.add(rightSeat);

  // Backrest Cushions - Sleek luxury Italian low-back cinema sofa
  // Height 0.38m, center Y = 0.68 (reaches up to Y = 0.87, perfectly supporting lower back while keeping characters fully visible)
  const backGeo = new THREE.BoxGeometry(3.5, 0.38, 0.28);
  const backMesh = new THREE.Mesh(backGeo, cushionMat);
  backMesh.position.set(0, 0.68, 0.48);
  backMesh.castShadow = true;
  sofaGroup.add(backMesh);

  // Armrests
  const armGeo = new THREE.BoxGeometry(0.25, 0.38, 1.35);
  const leftArm = new THREE.Mesh(armGeo, cushionMat);
  leftArm.position.set(-1.75, 0.58, 0.0);
  leftArm.castShadow = true;
  sofaGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, cushionMat);
  rightArm.position.set(1.75, 0.58, 0.0);
  rightArm.castShadow = true;
  sofaGroup.add(rightArm);

  // Romantic throw pillows
  const pillowGeo = new THREE.BoxGeometry(0.42, 0.38, 0.14);
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xb58852, roughness: 0.7 });
  const leftPillow = new THREE.Mesh(pillowGeo, pillowMat);
  leftPillow.position.set(-1.45, 0.72, 0.2);
  leftPillow.rotation.y = Math.PI / 6;
  leftPillow.rotation.z = -Math.PI / 12;
  sofaGroup.add(leftPillow);

  const rightPillow = new THREE.Mesh(pillowGeo, pillowMat);
  rightPillow.position.set(1.45, 0.72, 0.2);
  rightPillow.rotation.y = -Math.PI / 6;
  rightPillow.rotation.z = Math.PI / 12;
  sofaGroup.add(rightPillow);

  // Cozy throw blanket draped over the armrest
  const blanketGeo = new THREE.BoxGeometry(0.32, 0.04, 0.75);
  const blanketMat = new THREE.MeshStandardMaterial({ color: 0x8a6d4b, roughness: 0.85 });
  const blanket = new THREE.Mesh(blanketGeo, blanketMat);
  blanket.position.set(1.68, 0.72, -0.05);
  sofaGroup.add(blanket);

  cinemaGroup.add(sofaGroup);

  // 2. Modern Coffee Table in front of Sofa (Z = -79.5)
  const tableGroup = new THREE.Group();
  tableGroup.position.set(0, 0, -79.5);
  const tableTopGeo = new THREE.BoxGeometry(2.2, 0.1, 0.9);
  const tableTopMat = new THREE.MeshStandardMaterial({
    color: 0x1a120c,
    roughness: 0.2,
    metalness: 0.2
  });
  const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
  tableTop.position.y = 0.45;
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  tableGroup.add(tableTop);

  // Table Legs
  const tLegPositions = [
    [-0.95, 0.225, -0.35],
    [0.95, 0.225, -0.35],
    [-0.95, 0.225, 0.35],
    [0.95, 0.225, 0.35]
  ];
  tLegPositions.forEach(([tx, ty, tz]) => {
    const tLeg = new THREE.Mesh(legGeo, legMat);
    tLeg.position.set(tx, ty, tz);
    tableGroup.add(tLeg);
  });

  // Soft glowing candle on the table
  const candleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16);
  const candleMat = new THREE.MeshStandardMaterial({ color: 0xfff0dd, roughness: 0.2 });
  const candle = new THREE.Mesh(candleGeo, candleMat);
  candle.position.set(0, 0.56, 0);
  tableGroup.add(candle);

  const candleLight = new THREE.PointLight(0xffaa55, 3, 5, 2);
  candleLight.position.set(0, 0.7, 0);
  tableGroup.add(candleLight);

  cinemaGroup.add(tableGroup);

  // 3. GIANT CINEMA SCREEN AT Z = -88
  const screenZ = -88;
  const screenHeight = 4.4;
  const screenWidth = 7.8; // Widescreen frame with portrait theater content and ambient reactive wings

  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, 2.7, screenZ);

  // Initial romantic poster texture while video loads or waits
  const posterLoader = new THREE.TextureLoader();
  const posterTexture = posterLoader.load('/assets/videos/cinema_poster.jpg');
  posterTexture.colorSpace = THREE.SRGBColorSpace;

  // Video Texture from the uploaded HTML5 video element
  const videoTexture = new THREE.VideoTexture(videoElement);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.generateMipmaps = false;

  // Video Display Mesh: Vertical 9:16 aspect ratio (1080x1920)
  // Height = 4.0, Width = 4.0 * (9 / 16) = 2.25
  const videoDisplayHeight = 4.0;
  const videoDisplayWidth = videoDisplayHeight * (9 / 16);

  const videoGeo = new THREE.PlaneGeometry(videoDisplayWidth, videoDisplayHeight);
  const videoMat = new THREE.MeshBasicMaterial({
    map: posterTexture, // Always display the authentic poster with romantic quote initially!
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -2.0,
    polygonOffsetUnits: -4.0,
    depthTest: true,
    depthWrite: true
  });

  // Switch to videoTexture when video begins playing
  videoElement.addEventListener('playing', () => {
    videoMat.map = videoTexture;
    videoMat.needsUpdate = true;
  });
  videoElement.addEventListener('timeupdate', () => {
    if (videoElement.currentTime > 0.05 && videoMat.map !== videoTexture) {
      videoMat.map = videoTexture;
      videoMat.needsUpdate = true;
    }
  });
  const videoMesh = new THREE.Mesh(videoGeo, videoMat);
  videoMesh.position.z = 0.08; // Placed comfortably in front of frame & backing to completely prevent z-fighting
  videoMesh.name = "CinemaVideoScreen";
  videoMesh.castShadow = false;
  videoMesh.receiveShadow = false;
  screenGroup.add(videoMesh);

  // Screen Bezel / Frame - sits behind the video screen (front face at z = 0.0)
  const screenFrameGeo = new THREE.BoxGeometry(screenWidth, screenHeight, 0.08);
  const screenFrameMat = new THREE.MeshStandardMaterial({
    color: 0x08090a,
    roughness: 0.3,
    metalness: 0.7
  });
  const screenFrame = new THREE.Mesh(screenFrameGeo, screenFrameMat);
  screenFrame.position.z = -0.04;
  screenFrame.castShadow = false;
  screenFrame.receiveShadow = false;
  screenGroup.add(screenFrame);

  // Inner Theatre Backing (Black velvet surround) - sits at z = 0.02 (well behind videoMesh at 0.08)
  const backingGeo = new THREE.PlaneGeometry(screenWidth - 0.2, screenHeight - 0.2);
  const backingMat = new THREE.MeshStandardMaterial({
    color: 0x040405,
    roughness: 0.95
  });
  const screenBacking = new THREE.Mesh(backingGeo, backingMat);
  screenBacking.position.z = 0.02;
  screenBacking.castShadow = false;
  screenBacking.receiveShadow = false;
  screenGroup.add(screenBacking);

  // Ambient Theatre Glow behind the screen
  const ambientScreenLight = new THREE.PointLight(0xff6b8b, 8, 14, 1.2);
  ambientScreenLight.position.set(0, 0, 0.4);
  screenGroup.add(ambientScreenLight);

  // Soft spotlights aiming at the sitting couple from the lounge ceiling
  const loungeLight = new THREE.SpotLight(0xffeedd, 6, 12, Math.PI / 4, 0.8, 1.5);
  loungeLight.position.set(0, 5.0, -74);
  loungeLight.target = sofaGroup;
  loungeLight.castShadow = true;
  cinemaGroup.add(loungeLight);

  cinemaGroup.add(screenGroup);
  scene.add(cinemaGroup);

  return {
    cinemaGroup,
    sofaGroup,
    videoMesh,
    videoTexture,
    ambientScreenLight,
    sofaPosition: { x: 0, y: 0, z: -76 }
  };
}
