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

// --- Material PBR Torii Gate ---
const redMat   = new THREE.MeshStandardMaterial({color: 0xef4444, roughness: 0.65, metalness: 0.05}); // Merah Vermilion kayu
const blackMat = new THREE.MeshStandardMaterial({color: 0x1e293b, roughness: 0.55, metalness: 0.15}); // Genteng hitam atas
const goldMat  = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.85, roughness: 0.2}); // Detail nama/oranye emas

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'JapanLandmark';

// --- Pembuat Gerbang Torii Low-Poly ---
function makeToriiGate() {
  const torii = new THREE.Group();
  torii.name = 'ToriiGate';

  // 1. DUA PILAR UTAMA (Hashira - Sedikit miring ke dalam)
  const pillarHeight = 5.0;
  const pillarGeo = new THREE.CylinderGeometry(0.24, 0.3, pillarHeight, 8);
  const tiltAngle = 0.07;

  // Pilar Kiri
  const leftPillar = new THREE.Mesh(pillarGeo, redMat);
  leftPillar.name = 'Pillar_Left';
  leftPillar.position.set(-1.6, pillarHeight / 2, 0);
  leftPillar.rotation.z = -tiltAngle;
  torii.add(leftPillar);

  // Pilar Kanan
  const rightPillar = new THREE.Mesh(pillarGeo, redMat);
  rightPillar.name = 'Pillar_Right';
  rightPillar.position.set(1.6, pillarHeight / 2, 0);
  rightPillar.rotation.z = tiltAngle;
  torii.add(rightPillar);

  // 2. PLINTH PENYANGGA HITAM (Daiishi - Batu pondasi pilar)
  const plinthGeo = new THREE.CylinderGeometry(0.33, 0.36, 0.4, 8);
  const plinthL = new THREE.Mesh(plinthGeo, blackMat);
  plinthL.name = 'Plinth_Left';
  plinthL.position.set(-1.68, 0.2, 0);
  torii.add(plinthL);

  const plinthR = new THREE.Mesh(plinthGeo, blackMat);
  plinthR.name = 'Plinth_Right';
  plinthR.position.set(1.68, 0.2, 0);
  torii.add(plinthR);

  // 3. BALOK PENGIKAT BAWAH (Nuki - Balok melintang horizontal tengah)
  const nuki = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.22, 0.24), redMat);
  nuki.name = 'NukiBeam';
  nuki.position.set(0, 3.8, 0);
  torii.add(nuki);

  // Pasak kunci di sisi luar tiang (Kusabi)
  const kusabiGeo = new THREE.BoxGeometry(0.12, 0.3, 0.32);
  const kusabiL = new THREE.Mesh(kusabiGeo, blackMat);
  kusabiL.name = 'Kusabi_Left';
  kusabiL.position.set(-1.8, 3.8, 0);
  torii.add(kusabiL);

  const kusabiR = new THREE.Mesh(kusabiGeo, blackMat);
  kusabiR.name = 'Kusabi_Right';
  kusabiR.position.set(1.8, 3.8, 0);
  torii.add(kusabiR);

  // 4. BALOK ATAS GANDA (Shimagi & Kasagi melengkung)
  const centerWidth = 3.5;
  const centralKasagi = new THREE.Mesh(new THREE.BoxGeometry(centerWidth, 0.32, 0.36), redMat);
  centralKasagi.name = 'CentralKasagi';
  centralKasagi.position.set(0, 4.88, 0);
  torii.add(centralKasagi);

  // Sayap Kiri Kasagi (Miring ke atas di ujung)
  const wingLength = 0.85;
  const wingAngle = 0.18; // kemiringan ke atas
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(wingLength, 0.32, 0.36), redMat);
  leftWing.name = 'LeftKasagiWing';
  leftWing.position.set(-centerWidth/2 - 0.4, 4.95, 0);
  leftWing.rotation.z = -wingAngle;
  torii.add(leftWing);

  // Sayap Kanan Kasagi
  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(wingLength, 0.32, 0.36), redMat);
  rightWing.name = 'RightKasagiWing';
  rightWing.position.set(centerWidth/2 + 0.4, 4.95, 0);
  rightWing.rotation.z = wingAngle;
  torii.add(rightWing);

  // 5. GENTENG ATAP HITAM PELINDUNG (Black Top Roof Cap)
  const centralRoof = new THREE.Mesh(new THREE.BoxGeometry(centerWidth + 0.1, 0.08, 0.42), blackMat);
  centralRoof.name = 'CentralRoof';
  centralRoof.position.set(0, 5.06, 0);
  torii.add(centralRoof);

  const roofWingL = new THREE.Mesh(new THREE.BoxGeometry(wingLength + 0.04, 0.08, 0.42), blackMat);
  roofWingL.name = 'RoofWing_Left';
  roofWingL.position.set(-centerWidth/2 - 0.42, 5.14, 0);
  roofWingL.rotation.z = -wingAngle;
  torii.add(roofWingL);

  const roofWingR = new THREE.Mesh(new THREE.BoxGeometry(wingLength + 0.04, 0.08, 0.42), blackMat);
  roofWingR.name = 'RoofWing_Right';
  roofWingR.position.set(centerWidth/2 + 0.42, 5.14, 0);
  roofWingR.rotation.z = wingAngle;
  torii.add(roofWingR);

  // 6. TIANG TENGAH PENYANGGA (Gakuzuka - Memegang Plakat Nama)
  const gakuzuka = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.74, 0.14), redMat);
  gakuzuka.name = 'Gakuzuka';
  gakuzuka.position.set(0, 4.4, 0);
  torii.add(gakuzuka);

  // Papan Nama Kuil Shinto (Gaku)
  const plaqueFrame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.18), blackMat);
  plaqueFrame.name = 'PlaqueFrame';
  plaqueFrame.position.set(0, 4.4, 0);
  torii.add(plaqueFrame);

  const plaqueGold = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.2), goldMat);
  plaqueGold.name = 'PlaqueGold';
  plaqueGold.position.set(0, 4.4, 0);
  torii.add(plaqueGold);

  return torii;
}
landmarkGroup.add(makeToriiGate());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Jepang...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/japan.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Jepang diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Jepang:', err);
}
