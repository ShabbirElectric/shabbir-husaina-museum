import * as THREE from 'three';

/**
 * Builds the Grand Centerpiece Monument Statue for Shabbir & Husaina
 * in the center of the museum gallery (Room 1 / Grand Rotunda at Z = 3.5)
 */
export function buildStatueMonument({ scene, textureLoader }) {
  const statueGroup = new THREE.Group();
  statueGroup.position.set(0, 0, 3.5);
  statueGroup.name = "StatueMonument";

  // 1. Classical Multi-Tier Marble & Gold Plinth Base
  // Tier 1: Polished White Italian Marble Base Plinth (Octagonal / Cylinder)
  const baseGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.35, 32);
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xf5f3ee,
    roughness: 0.2,
    metalness: 0.08
  });
  const baseMesh = new THREE.Mesh(baseGeo, marbleMat);
  baseMesh.position.y = 0.175;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  statueGroup.add(baseMesh);

  // Tier 1 Gold Trim Ring
  const ring1Geo = new THREE.TorusGeometry(1.82, 0.03, 16, 48);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.85
  });
  const ring1 = new THREE.Mesh(ring1Geo, goldMat);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = 0.35;
  statueGroup.add(ring1);

  // Tier 2: Nero Marquina Black Marble Pedestal Core
  const pedestalGeo = new THREE.BoxGeometry(1.7, 0.85, 1.3);
  const blackMarbleMat = new THREE.MeshStandardMaterial({
    color: 0x161618,
    roughness: 0.25,
    metalness: 0.2
  });
  const pedestalMesh = new THREE.Mesh(pedestalGeo, blackMarbleMat);
  pedestalMesh.position.y = 0.35 + 0.85 / 2;
  pedestalMesh.castShadow = true;
  pedestalMesh.receiveShadow = true;
  statueGroup.add(pedestalMesh);

  // 4 Corner Gold Accents on the pedestal
  const cornerColGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 16);
  const cornerOffsets = [
    [-0.85, 0.35 + 0.85 / 2, -0.65],
    [0.85, 0.35 + 0.85 / 2, -0.65],
    [-0.85, 0.35 + 0.85 / 2, 0.65],
    [0.85, 0.35 + 0.85 / 2, 0.65]
  ];
  cornerOffsets.forEach(([cx, cy, cz]) => {
    const col = new THREE.Mesh(cornerColGeo, goldMat);
    col.position.set(cx, cy, cz);
    statueGroup.add(col);
  });

  // Tier 3: Polished Brass Pedestal Cap
  const capGeo = new THREE.BoxGeometry(1.85, 0.12, 1.45);
  const capMesh = new THREE.Mesh(capGeo, goldMat);
  capMesh.position.y = 0.35 + 0.85 + 0.06;
  capMesh.castShadow = true;
  statueGroup.add(capMesh);

  // 2. Grand Statue Plaque (Front Face)
  const plaqueGeo = new THREE.PlaneGeometry(1.2, 0.42);
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 1024;
  plaqueCanvas.height = 360;
  const pctx = plaqueCanvas.getContext('2d');
  
  // Luxury brushed gold plaque background
  pctx.fillStyle = '#0f1115';
  pctx.fillRect(0, 0, 1024, 360);
  pctx.strokeStyle = '#d4af37';
  pctx.lineWidth = 10;
  pctx.strokeRect(16, 16, 992, 328);

  // Inner border
  pctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  pctx.lineWidth = 3;
  pctx.strokeRect(32, 32, 960, 296);

  // Text
  pctx.fillStyle = '#d4af37';
  pctx.font = 'bold 36px "Cinzel", "Playfair Display", Georgia, serif';
  pctx.textAlign = 'center';
  pctx.letterSpacing = '6px';
  pctx.fillText('✦ SHABBIR ♥ HUSAINA ✦', 512, 120);

  pctx.fillStyle = '#f8fafc';
  pctx.font = 'italic 24px "Plus Jakarta Sans", sans-serif';
  pctx.fillText('A Sacred Monument of Eternal Love & Devotion', 512, 185);

  pctx.fillStyle = '#94a3b8';
  pctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  pctx.fillText('Private Memorial Exhibition • Museum Centerpiece', 512, 245);

  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
  plaqueTex.colorSpace = THREE.SRGBColorSpace;
  const plaqueMat = new THREE.MeshStandardMaterial({
    map: plaqueTex,
    roughness: 0.3,
    metalness: 0.5
  });
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.set(0, 0.35 + 0.85 / 2, 0.655);
  statueGroup.add(plaqueMesh);

  // 3. The Grand Couple Statue (Authentic Cutout of Shabbir & Husaina)
  const statueHeight = 2.45;
  const statueWidth = statueHeight * (577 / 1024); // 1.38m
  const statueTex = textureLoader.load('/assets/avatars/couple_sitting.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
  });

  const statueMat = new THREE.MeshStandardMaterial({
    map: statueTex,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const statueGeo = new THREE.PlaneGeometry(statueWidth, statueHeight);
  const statueMesh = new THREE.Mesh(statueGeo, statueMat);
  statueMesh.position.set(0, 0.35 + 0.85 + 0.12 + statueHeight / 2, 0.0);
  statueMesh.castShadow = true;
  statueMesh.name = "CenterpieceStatueMesh";
  statueGroup.add(statueMesh);

  // 4. Luxury Brass Stanchion Barrier Posts & Velvet Ropes around Monument
  const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.95, 16);
  const ballGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const postBaseGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.06, 24);

  const stanchionPositions = [
    [-1.6, 0, 1.4],
    [1.6, 0, 1.4],
    [-1.6, 0, -1.4],
    [1.6, 0, -1.4]
  ];

  stanchionPositions.forEach(([sx, sy, sz]) => {
    const postGroup = new THREE.Group();
    postGroup.position.set(sx, sy, sz);

    const base = new THREE.Mesh(postBaseGeo, goldMat);
    base.position.y = 0.03;
    postGroup.add(base);

    const post = new THREE.Mesh(postGeo, goldMat);
    post.position.y = 0.06 + 0.95 / 2;
    post.castShadow = true;
    postGroup.add(post);

    const ball = new THREE.Mesh(ballGeo, goldMat);
    ball.position.y = 0.06 + 0.95 + 0.06;
    postGroup.add(ball);

    statueGroup.add(postGroup);
  });

  // Velvet Ropes between front stanchions
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8b1527, roughness: 0.8 }); // Royal Crimson velvet
  const ropeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.6, 0.85, 1.4),
    new THREE.Vector3(-0.8, 0.62, 1.4),
    new THREE.Vector3(0.8, 0.62, 1.4),
    new THREE.Vector3(1.6, 0.85, 1.4)
  ]);
  const ropeGeo = new THREE.TubeGeometry(ropeCurve, 32, 0.025, 12, false);
  const frontRope = new THREE.Mesh(ropeGeo, ropeMat);
  statueGroup.add(frontRope);

  // 5. Dedicated Monument Uplights & Ceiling Spotlight
  // 4 embedded warm uplights in base
  const uplightPositions = [
    [-0.6, 0.35 + 0.85 + 0.15, 0.5],
    [0.6, 0.35 + 0.85 + 0.15, 0.5],
    [-0.6, 0.35 + 0.85 + 0.15, -0.5],
    [0.6, 0.35 + 0.85 + 0.15, -0.5]
  ];
  uplightPositions.forEach(([ux, uy, uz]) => {
    const uLight = new THREE.PointLight(0xffeedd, 8, 4, 1.5);
    uLight.position.set(ux, uy, uz);
    statueGroup.add(uLight);
  });

  // Dedicated overhead gallery spotlight focusing on the statue
  const spotLight = new THREE.SpotLight(0xfff5e6, 28, 14, Math.PI / 4, 0.3, 1.2);
  spotLight.position.set(0, 5.0, 4.0);
  spotLight.target = statueMesh;
  spotLight.castShadow = false;
  scene.add(spotLight);

  scene.add(statueGroup);
  return {
    statueGroup,
    statueMesh,
    spotLight
  };
}
