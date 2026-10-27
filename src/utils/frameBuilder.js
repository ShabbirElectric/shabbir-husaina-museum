import * as THREE from 'three';

/**
 * Builds a realistic 3D framed photograph on a museum wall
 */
export function createPhotoFrame({
  photo,
  textureLoader,
  scene,
  onLoaded
}) {
  const group = new THREE.Group();
  group.position.set(photo.x, photo.y, photo.z);
  group.rotation.set(photo.rotation[0], photo.rotation[1], photo.rotation[2]);
  group.name = `Frame_${photo.id}`;

  // Dimensions based on aspect ratio
  const standardHeight = photo.isPedestal ? 2.2 : 2.0;
  const standardWidth = standardHeight * (photo.aspect || 0.7);

  const frameDepth = 0.08;
  const frameBorder = 0.12;
  const matBorder = 0.08;

  const totalWidth = standardWidth + (frameBorder + matBorder) * 2;
  const totalHeight = standardHeight + (frameBorder + matBorder) * 2;

  // 1. Outer Frame (Premium dark ebony or warm champagne gold)
  const isGold = photo.room === "Traditional Grace";
  const frameMat = new THREE.MeshStandardMaterial({
    color: isGold ? 0xc4a362 : 0x18181a,
    roughness: isGold ? 0.35 : 0.4,
    metalness: isGold ? 0.6 : 0.15,
  });

  // Build outer frame with 4 border bars for authentic bevel depth
  const frameGroup = new THREE.Group();

  // Top & Bottom bars
  const hBarGeo = new THREE.BoxGeometry(totalWidth, frameBorder, frameDepth);
  const topBar = new THREE.Mesh(hBarGeo, frameMat);
  topBar.position.y = (totalHeight - frameBorder) / 2;
  topBar.castShadow = true;
  frameGroup.add(topBar);

  const bottomBar = new THREE.Mesh(hBarGeo, frameMat);
  bottomBar.position.y = -(totalHeight - frameBorder) / 2;
  bottomBar.castShadow = true;
  frameGroup.add(bottomBar);

  // Left & Right bars
  const vBarGeo = new THREE.BoxGeometry(frameBorder, totalHeight - frameBorder * 2, frameDepth);
  const leftBar = new THREE.Mesh(vBarGeo, frameMat);
  leftBar.position.x = -(totalWidth - frameBorder) / 2;
  leftBar.castShadow = true;
  frameGroup.add(leftBar);

  const rightBar = new THREE.Mesh(vBarGeo, frameMat);
  rightBar.position.x = (totalWidth - frameBorder) / 2;
  rightBar.castShadow = true;
  frameGroup.add(rightBar);

  // Frame Backing
  const backGeo = new THREE.BoxGeometry(totalWidth - 0.02, totalHeight - 0.02, 0.02);
  const backMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  const backing = new THREE.Mesh(backGeo, backMat);
  backing.position.z = -frameDepth / 2;
  frameGroup.add(backing);

  group.add(frameGroup);

  // 2. Inner Mat (White Passe-Partout)
  const matGeo = new THREE.PlaneGeometry(
    totalWidth - frameBorder * 2,
    totalHeight - frameBorder * 2
  );
  const matMaterial = new THREE.MeshStandardMaterial({
    color: 0xfaf8f5,
    roughness: 0.95,
    metalness: 0.0
  });
  const matMesh = new THREE.Mesh(matGeo, matMaterial);
  matMesh.position.z = -frameDepth / 4;
  group.add(matMesh);

  // 3. Photograph Canvas Mesh
  const photoGeo = new THREE.PlaneGeometry(standardWidth, standardHeight);
  // Default placeholder material while loading
  const photoMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.02
  });
  const photoMesh = new THREE.Mesh(photoGeo, photoMat);
  photoMesh.position.z = -frameDepth / 6;
  photoMesh.name = `PhotoMesh_${photo.id}`;
  photoMesh.userData = {
    isPhoto: true,
    photoData: photo
  };
  group.add(photoMesh);

  // 4. Subtle protective glass layer (sheen)
  const glassGeo = new THREE.PlaneGeometry(
    totalWidth - frameBorder * 2,
    totalHeight - frameBorder * 2
  );
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08,
    roughness: 0.05,
    transmission: 0.85,
    ior: 1.5,
    reflectivity: 0.3
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.z = frameDepth / 6;
  glassMesh.userData = {
    isPhoto: true,
    photoData: photo
  };
  group.add(glassMesh);

  // Load actual texture
  textureLoader.load(
    photo.url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      photoMat.map = texture;
      photoMat.needsUpdate = true;
      if (onLoaded) onLoaded(photo.id);
    },
    undefined,
    (err) => {
      console.warn(`Failed loading photo texture for ${photo.fileName}`, err);
    }
  );

  // 5. Dedicated Wall Gallery Spotlight
  // Direct gallery illumination without consuming expensive shadow texture units
  const spotLight = new THREE.SpotLight(0xfff3e3, 22, 14, Math.PI / 4.5, 0.5, 1.0);
  const isLeft = photo.wall === 'left';
  const isRight = photo.wall === 'right';

  if (isLeft) {
    spotLight.position.set(photo.x + 2.2, photo.y + 2.2, photo.z);
  } else if (isRight) {
    spotLight.position.set(photo.x - 2.2, photo.y + 2.2, photo.z);
  } else {
    spotLight.position.set(photo.x, photo.y + 2.2, photo.z + 2.2);
  }

  spotLight.target = group;
  spotLight.castShadow = false; // Prevents MAX_TEXTURE_IMAGE_UNITS crash
  scene.add(spotLight);

  // 6. Realistic Drop Shadow Plane on Wall
  const shadowGeo = new THREE.PlaneGeometry(totalWidth * 1.08, totalHeight * 1.08);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.16
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.z = -frameDepth / 2 - 0.01;
  group.add(shadowMesh);

  // 7. Gallery Brass Plaque under frame
  const plaqueWidth = Math.min(1.0, totalWidth * 0.7);
  const plaqueGeo = new THREE.BoxGeometry(plaqueWidth, 0.15, 0.02);
  const plaqueMat = new THREE.MeshStandardMaterial({
    color: isGold ? 0xd8b568 : 0x222225,
    metalness: 0.7,
    roughness: 0.3
  });
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.set(0, -totalHeight / 2 - 0.18, 0);
  plaqueMesh.userData = { isPhoto: true, photoData: photo };
  group.add(plaqueMesh);

  // 8. If this is a centerpiece Pedestal (like in the Giftvera reference)
  if (photo.isPedestal) {
    const pedestalGroup = new THREE.Group();
    // Stand block
    const standGeo = new THREE.BoxGeometry(1.6, 1.0, 1.2);
    const standMat = new THREE.MeshStandardMaterial({
      color: 0xf0eeea,
      roughness: 0.4,
      metalness: 0.05
    });
    const standMesh = new THREE.Mesh(standGeo, standMat);
    standMesh.position.set(0, -photo.y + 0.5, 0);
    standMesh.castShadow = true;
    standMesh.receiveShadow = true;
    pedestalGroup.add(standMesh);

    // Black museum placard on pedestal
    const placardGeo = new THREE.BoxGeometry(1.4, 0.35, 0.04);
    const placardMat = new THREE.MeshStandardMaterial({
      color: 0x151618,
      roughness: 0.4
    });
    const placardMesh = new THREE.Mesh(placardGeo, placardMat);
    placardMesh.position.set(0, -photo.y + 0.9, 0.61);
    placardMesh.rotation.x = -Math.PI / 8;
    pedestalGroup.add(placardMesh);

    group.add(pedestalGroup);
  }

  scene.add(group);
  return group;
}
