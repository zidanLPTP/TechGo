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

// --- Material PBR Monas ---
const marbleMat = new THREE.MeshStandardMaterial({color: 0xf3f4f6, roughness: 0.25, metalness: 0.1}); // Marmer putih bersih
const goldMat   = new THREE.MeshStandardMaterial({
  color: 0xffa500,
  metalness: 0.85,
  roughness: 0.15
}); // Lidah api emas berkilau

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'IndonesiaLandmark';

// --- Pembuat Monas Low-Poly ---
function makeMonas() {
  const monas = new THREE.Group();
  monas.name = 'Monas';

  // 1. Pelat Landasan Dasar Cawan (Square Platform)
  const basePlatform = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 3.5), marbleMat);
  basePlatform.name = 'BasePlatform';
  basePlatform.position.y = 0.4; // Bottom di y=0
  monas.add(basePlatform);

  // 2. Cawan Miring (Cup - Menggunakan silinder bersegi-4 yang diputar 45 derajat)
  const cawanGeo = new THREE.CylinderGeometry(1.5, 2.6, 0.8, 4, 1);
  cawanGeo.rotateY(Math.PI / 4); // Putar agar sejajar dengan platform kotak
  const cawan = new THREE.Mesh(cawanGeo, marbleMat);
  cawan.name = 'CawanMiring';
  cawan.position.y = 1.2; // 0.8 + 0.4
  monas.add(cawan);

  // 3. Tugu Utama (Obelisk - Tiang Ramping Segi Empat)
  const tuguHeight = 6.8;
  const tuguGeo = new THREE.CylinderGeometry(0.32, 0.46, tuguHeight, 4);
  tuguGeo.rotateY(Math.PI / 4);
  const tugu = new THREE.Mesh(tuguGeo, marbleMat);
  tugu.name = 'TuguObelisk';
  tugu.position.y = 1.6 + tuguHeight / 2; // y = 1.6 + 3.4 = 5.0
  monas.add(tugu);

  // 4. Pelepah Penopang Api di Puncak Tugu
  const pelepahGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.12, 4);
  pelepahGeo.rotateY(Math.PI / 4);
  const pelepah = new THREE.Mesh(pelepahGeo, marbleMat);
  pelepah.name = 'PelepahApi';
  pelepah.position.y = 8.46;
  monas.add(pelepah);

  // 5. Lidah Api Emas Kemerdekaan (Low-poly flame assembly)
  const flameGroup = new THREE.Group();
  flameGroup.name = 'FlameGroup';
  flameGroup.position.y = 8.52; // Atas pelepah

  // Api Tengah Utama
  const mainFlame = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9, 6), goldMat);
  mainFlame.name = 'MainFlame';
  mainFlame.position.y = 0.45;
  flameGroup.add(mainFlame);

  // Kelopak Api Samping (Petals - 4 cone kecil melingkar miring keluar)
  const petalGeo = new THREE.ConeGeometry(0.11, 0.48, 5);
  const petalAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const petalOffset = 0.12;

  petalAngles.forEach((angle, idx) => {
    const petal = new THREE.Mesh(petalGeo, goldMat);
    petal.name = 'FlamePetal_' + idx;
    petal.position.set(
      Math.sin(angle) * petalOffset,
      0.28,
      Math.cos(angle) * petalOffset
    );
    petal.rotation.set(
      Math.cos(angle) * 0.35,
      angle,
      -Math.sin(angle) * 0.35
    );
    flameGroup.add(petal);
  });

  monas.add(flameGroup);

  return monas;
}
landmarkGroup.add(makeMonas());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Indonesia...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/indonesia.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Indonesia diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Indonesia:', err);
}
