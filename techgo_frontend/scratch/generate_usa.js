import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Polyfill FileReader untuk lingkungan Node.js agar GLTFExporter dapat berjalan
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    }).catch(err => {
      if (this.onerror) this.onerror(err);
    });
  }
};

// --- Material PBR Khas Patung Liberty ---
const copperMat = new THREE.MeshStandardMaterial({color: 0x82c3a6, roughness: 0.65, metalness: 0.1});
const goldMat   = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.9, roughness: 0.15}); // Obor Emas

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'USALandmark';

// --- Pembuat Patung Liberty Low-Poly ---
function makeStatueOfLiberty() {
  const liberty = new THREE.Group();
  liberty.name = 'StatueOfLiberty';

  // 1. Toga / Robe bagian bawah (Tapered Cylinder)
  const lowerRobe = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 4.0, 8), copperMat);
  lowerRobe.name = 'LowerRobe';
  lowerRobe.position.y = 2.0;
  liberty.add(lowerRobe);

  // 2. Dada / Tubuh bagian atas
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.0), copperMat);
  chest.name = 'Chest';
  chest.position.set(0, 4.1, 0);
  liberty.add(chest);

  // 3. Kepala
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.75), copperMat);
  head.name = 'Head';
  head.position.set(0, 5.2, 0);
  liberty.add(head);

  // Hidung
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.15), copperMat);
  nose.name = 'Nose';
  nose.position.set(0, 5.2, 0.42);
  liberty.add(nose);

  // 4. Mahkota (Crown band & 7 duri tajam)
  const crownBand = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 0.85), copperMat);
  crownBand.name = 'CrownBand';
  crownBand.position.set(0, 5.65, 0);
  liberty.add(crownBand);

  // 7 Spikes Mahkota
  const spikeGeo = new THREE.CylinderGeometry(0, 0.05, 0.45, 4);
  spikeGeo.rotateX(Math.PI/2);
  
  const spikeAngles = [-1.3, -0.9, -0.45, 0, 0.45, 0.9, 1.3];
  spikeAngles.forEach((angle, idx) => {
    const spike = new THREE.Mesh(spikeGeo, copperMat);
    spike.name = 'CrownSpike_' + idx;
    spike.position.set(
      Math.sin(angle) * 0.45,
      5.75 + Math.cos(angle) * 0.1,
      Math.cos(angle) * 0.35
    );
    spike.rotation.set(-0.3, angle, 0);
    liberty.add(spike);
  });

  // 5. Lengan Kanan Mengangkat Obor
  const rightShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.35), copperMat);
  rightShoulder.name = 'RightShoulder';
  rightShoulder.position.set(0.7, 4.4, 0);
  rightShoulder.rotation.z = -0.5;
  liberty.add(rightShoulder);

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 0.3), copperMat);
  rightArm.name = 'RightArmUp';
  rightArm.position.set(0.95, 5.5, 0);
  liberty.add(rightArm);

  // Gagang Obor (Torch Handle)
  const torchHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.7, 6), copperMat);
  torchHandle.name = 'TorchHandle';
  torchHandle.position.set(0.95, 6.45, 0.1);
  torchHandle.rotation.x = 0.2;
  liberty.add(torchHandle);

  // Cawan Obor (Torch Cup)
  const torchCup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.3, 8), copperMat);
  torchCup.name = 'TorchCup';
  torchCup.position.set(0.95, 6.85, 0.18);
  liberty.add(torchCup);

  // Api Obor Emas (Golden Flame)
  const flameGroup = new THREE.Group();
  flameGroup.name = 'TorchFlame';
  flameGroup.position.set(0.95, 7.2, 0.25);

  const flameCenter = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), goldMat);
  flameCenter.rotation.set(0.4, 0.4, 0);
  flameGroup.add(flameCenter);

  const flameTip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), goldMat);
  flameTip.position.set(0.05, 0.3, -0.05);
  flameTip.rotation.y = 0.7;
  flameGroup.add(flameTip);
  liberty.add(flameGroup);

  // 6. Lengan Kiri Memegang Papan (Tablet)
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), copperMat);
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.7, 4.0, 0.2);
  leftArm.rotation.set(0.3, 0.1, 0.5);
  liberty.add(leftArm);

  // Papan Kemerdekaan (Tablet / Tabula Ansata)
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.2, 0.8), copperMat);
  tablet.name = 'Tablet';
  tablet.position.set(-0.95, 4.0, 0.65);
  tablet.rotation.set(0.5, 0.2, 0.4);
  liberty.add(tablet);

  return liberty;
}
landmarkGroup.add(makeStatueOfLiberty());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D USA...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/united_states.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D USA diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D USA:', err);
}
