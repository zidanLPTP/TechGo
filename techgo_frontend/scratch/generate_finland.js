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

// --- Material PBR Khas Katedral Helsinki ---
const whiteMat = new THREE.MeshStandardMaterial({color: 0xf3f5f6, roughness: 0.7, metalness: 0.1}); // Marmer putih bersih
const domeMat  = new THREE.MeshStandardMaterial({color: 0x3d9e80, roughness: 0.6, metalness: 0.15}); // Kubah hijau tembaga
const goldMat  = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.85, roughness: 0.2}); // Salib emas di puncak

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas Tanah/Pondasi Bulat) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'FinlandLandmark';

// --- Pembuat Katedral Helsinki Low-Poly ---
function makeHelsinkiCathedral() {
  const cathedral = new THREE.Group();
  cathedral.name = 'HelsinkiCathedral';

  // 1. BANGUNAN UTAMA KATEDRAL (Greek Cross Layout - Silang Simetris)
  const mainHeight = 2.0;
  const blockGeo = new THREE.BoxGeometry(2.4, mainHeight, 2.4);
  const mainBlock = new THREE.Mesh(blockGeo, whiteMat);
  mainBlock.name = 'MainCathedralBlock';
  mainBlock.position.y = mainHeight / 2; // Dasar di y=0
  cathedral.add(mainBlock);

  // Blok proyeksi sayap silang (depan-belakang-kiri-kanan)
  const wingGeo = new THREE.BoxGeometry(2.8, mainHeight * 0.9, 1.8);
  
  const wingNS = new THREE.Mesh(wingGeo, whiteMat);
  wingNS.position.y = (mainHeight * 0.9) / 2;
  cathedral.add(wingNS);

  const wingEW = new THREE.Mesh(wingGeo, whiteMat);
  wingEW.rotation.y = Math.PI / 2;
  wingEW.position.y = (mainHeight * 0.9) / 2;
  cathedral.add(wingEW);

  // 2. KOLOM & PORTICO DEPAN (Neoclassical Columns - Geometri bersama untuk optimasi)
  const colHeight = 1.4;
  const colGeo = new THREE.CylinderGeometry(0.08, 0.08, colHeight, 6);
  
  // Fungsi penambah barisan kolom
  function addColumnRow(xOffset, zOffset, isRotated) {
    const rowGroup = new THREE.Group();
    const spacing = 0.28;
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue; // Hilangkan tiang tengah agar ada ruang pintu
      const col = new THREE.Mesh(colGeo, whiteMat);
      col.position.x = i * spacing;
      col.position.y = colHeight / 2;
      rowGroup.add(col);
    }
    
    // Atap Segitiga Portico (Pediment)
    const pedimentGeo = new THREE.ConeGeometry(0.9, 0.35, 4);
    pedimentGeo.rotateY(Math.PI / 4); // Sejajarkan sisi datar
    const pediment = new THREE.Mesh(pedimentGeo, whiteMat);
    pediment.position.y = colHeight + 0.1;
    pediment.scale.set(1.4, 1.0, 0.6);
    rowGroup.add(pediment);

    rowGroup.position.set(xOffset, 0.1, zOffset);
    if (isRotated) rowGroup.rotation.y = Math.PI / 2;
    cathedral.add(rowGroup);
  }

  // Tambahkan barisan kolom di ke-4 sisi
  addColumnRow(0, 1.32, false);  // Sisi Utara (Depan)
  addColumnRow(0, -1.32, false); // Sisi Selatan (Belakang)
  addColumnRow(1.32, 0, true);   // Sisi Timur (Kanan)
  addColumnRow(-1.32, 0, true);  // Sisi Barat (Kiri)

  // Tangga Depan Katedral
  const stepWidth = 1.6;
  const stepHeight = 0.08;
  const numSteps = 4;
  for (let i = 0; i < numSteps; i++) {
    const stepDepth = 1.2 - (i * 0.2);
    const step = new THREE.Mesh(new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth), whiteMat);
    step.position.set(0, (i * stepHeight) + stepHeight/2, 1.3 + (i * 0.1));
    cathedral.add(step);
  }

  // 3. KUBAH UTAMA TENGAH (Central Dome)
  const drumGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.7, 8);
  const mainDrum = new THREE.Mesh(drumGeo, whiteMat);
  mainDrum.position.y = mainHeight + 0.35; // y = 2.0 + 0.35 = 2.35
  cathedral.add(mainDrum);

  const domeGeo = new THREE.SphereGeometry(0.7, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const mainDome = new THREE.Mesh(domeGeo, domeMat);
  mainDome.position.y = mainHeight + 0.7; // y = 2.7
  cathedral.add(mainDome);

  // Salib emas di atas kubah utama
  const crossTipGeo = new THREE.SphereGeometry(0.08, 4, 4);
  const mainCross = new THREE.Mesh(crossTipGeo, goldMat);
  mainCross.position.y = mainHeight + 1.45; // y = 3.45
  cathedral.add(mainCross);

  // 4. EMPAT KUBAH SUDUT (Corner Domes - Geometri bersama untuk optimasi)
  const cDrumGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.5, 6);
  const cDomeGeo = new THREE.SphereGeometry(0.24, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const cCrossGeo = new THREE.SphereGeometry(0.04, 4, 4);

  function addCornerDome(cx, cz) {
    const cornerGroup = new THREE.Group();
    
    const drum = new THREE.Mesh(cDrumGeo, whiteMat);
    drum.position.y = 0.25;
    cornerGroup.add(drum);
    
    const dome = new THREE.Mesh(cDomeGeo, domeMat);
    dome.position.y = 0.5;
    cornerGroup.add(dome);

    const cross = new THREE.Mesh(cCrossGeo, goldMat);
    cross.position.y = 0.75;
    cornerGroup.add(cross);

    cornerGroup.position.set(cx, mainHeight - 0.1, cz);
    cathedral.add(cornerGroup);
  }

  // Letakkan 4 kubah kecil di setiap sudut blok silang
  addCornerDome(0.85, 0.85);
  addCornerDome(-0.85, 0.85);
  addCornerDome(0.85, -0.85);
  addCornerDome(-0.85, -0.85);

  return cathedral;
}
landmarkGroup.add(makeHelsinkiCathedral());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Finlandia (Katedral Helsinki)...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/finland.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Finlandia diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Finlandia:', err);
}
