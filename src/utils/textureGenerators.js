import * as THREE from 'three';

// Generate polished marble museum floor texture
export function createMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base off-white marble
  ctx.fillStyle = '#eae6e1';
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft cloudy variations
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = 100 + Math.random() * 250;
    const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
    grad.addColorStop(0, 'rgba(215, 208, 200, 0.35)');
    grad.addColorStop(1, 'rgba(245, 242, 238, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Delicate grey / gold marble veins
  ctx.lineWidth = 1.2;
  for (let v = 0; v < 12; v++) {
    ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(160, 150, 140, 0.18)' : 'rgba(195, 170, 130, 0.15)';
    ctx.beginPath();
    let cx = Math.random() * 1024;
    let cy = Math.random() * 1024;
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 18; s++) {
      cx += (Math.random() - 0.5) * 120;
      cy += (Math.random() - 0.3) * 120;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Subtle tile grid lines (large 2m x 2m gallery marble slabs)
  ctx.strokeStyle = 'rgba(140, 130, 120, 0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 1024, 1024);
  ctx.beginPath();
  ctx.moveTo(512, 0); ctx.lineTo(512, 1024);
  ctx.moveTo(0, 512); ctx.lineTo(1024, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 16);
  return texture;
}

// Generate museum plaster wall texture
export function createWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm gallery off-white
  ctx.fillStyle = '#f8f6f3';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-stipple noise for tactile matte paint look
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 4);
  return texture;
}

// Generate dark ceiling texture with architectural panel grid
export function createCeilingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Modern dark charcoal ceiling
  ctx.fillStyle = '#16181b';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle acoustic panel lines
  ctx.strokeStyle = '#22262b';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  // Subtle texture
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 16);
  return texture;
}

// Generate luxury dark wood wall texture for Cinema Lounge
export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich walnut brown
  ctx.fillStyle = '#1e1410';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical wood slatted panels
  const slatWidth = 32;
  for (let x = 0; x < 512; x += slatWidth) {
    const grad = ctx.createLinearGradient(x, 0, x + slatWidth, 0);
    grad.addColorStop(0, '#2d1e18');
    grad.addColorStop(0.2, '#38251e');
    grad.addColorStop(0.8, '#261914');
    grad.addColorStop(1, '#150d0a');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, 0, slatWidth - 4, 512);

    // Slat groove
    ctx.fillStyle = '#0a0604';
    ctx.fillRect(x + slatWidth - 2, 0, 2, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}
