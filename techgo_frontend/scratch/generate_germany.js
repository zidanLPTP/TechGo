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

// --- Material PBR Khas Neuschwanstein ---
const wallMat = new THREE.MeshStandardMaterial({color: 0xf3f4f6, roughness: 0.7, metalness: 0.05}); // Dinding putih kastil
const roofMat = new THREE.MeshStandardMaterial({color: 0x315685, roughness: 0.55, metalness: 0.2}); // Genteng biru slate romantis
const goldMat = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.85, roughness: 0.2}); // Ujung spira emas
const gateMat = new THREE.MeshStandardMaterial({color: 0xe2e8f0, roughness: 0.65}); // Dinding gatehouse berwarna abu-krem
const darkMat = new THREE.MeshStandardMaterial({color: 0x1f2937, roughness: 0.6}); // Jendela/pintu gelap

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'GermanyLandmark';

// --- Pembuat Kastil Neuschwanstein Low-Poly ---
function makeNeuschwanstein() {
  const castle = new THREE.Group();
  castle.name = 'Neuschwanstein';

  // 1. BANGUNAN UTAMA (Palace Hall / Main Block)
  const palace = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.4, 1.4), wallMat);
  palace.name = 'MainPalace';
  palace.position.set(0, 1.7, 0); // Bottom di y=0
  castle.add(palace);

  // Atap Gabel Bangunan Utama (Dua lempengan atap miring)
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 1.05), roofMat);
  roofL.name = 'Roof_Left';
  roofL.position.set(0, 3.75, 0.52);
  roofL.rotation.x = 0.78; // Miring 45 derajat
  castle.add(roofL);

  const roofR = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 1.05), roofMat);
  roofR.name = 'Roof_Right';
  roofR.position.set(0, 3.75, -0.52);
  roofR.rotation.x = -0.78;
  castle.add(roofR);

  // 2. MENARA SILINDER UTAMA (Main Keep Tower - Tinggi Ramping)
  const keepHeight = 6.4;
  const keep = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, keepHeight, 8), wallMat);
  keep.name = 'MainKeep';
  keep.position.set(1.0, keepHeight / 2, 0.5); // x=1.0, z=0.5, y=3.2
  castle.add(keep);

  // Atap Kerucut Menara Utama
  const keepConeHeight = 2.2;
  const keepCone = new THREE.Mesh(new THREE.ConeGeometry(0.65, keepConeHeight, 8), roofMat);
  keepCone.name = 'KeepRoof';
  keepCone.position.set(1.0, keepHeight + keepConeHeight/2, 0.5); // y = 6.4 + 1.1 = 7.5
  castle.add(keepCone);

  // Tiang Emas Puncak Menara Utama
  const keepSpike = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), goldMat);
  keepSpike.name = 'KeepSpike';
  keepSpike.position.set(1.0, keepHeight + keepConeHeight + 0.25, 0.5);
  castle.add(keepSpike);

  // 3. MENARA SILINDER KEDUA (Secondary Tower - Sedikit Lebih Rendah)
  const subHeight = 5.2;
  const subTower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, subHeight, 8), wallMat);
  subTower.name = 'SecondaryTower';
  subTower.position.set(-1.0, subHeight / 2, -0.5); // x=-1.0, z=-0.5, y=2.6
  castle.add(subTower);

  // Atap Kerucut Menara Kedua
  const subConeHeight = 1.8;
  const subCone = new THREE.Mesh(new THREE.ConeGeometry(0.48, subConeHeight, 8), roofMat);
  subCone.name = 'SecondaryTowerRoof';
  subCone.position.set(-1.0, subHeight + subConeHeight/2, -0.5); // y = 5.2 + 0.9 = 6.1
  castle.add(subCone);

  // 4. TURRET KECIL GANTUNG DI SUDUT ATAP (Corner Spire Turrets)
  const turretHeight = 1.25;
  const turretGeo = new THREE.CylinderGeometry(0.16, 0.16, turretHeight, 6);
  const turretConeGeo = new THREE.ConeGeometry(0.22, 0.65, 6);

  const turretsCoords = [
    {x: -1.0, y: 3.5, z: 0.6}, // Depan Kiri
    {x: 0.2, y: 3.5, z: 0.6}  // Depan Kanan (Dekat Menara Utama)
  ];

  turretsCoords.forEach((tc, idx) => {
    const turret = new THREE.Mesh(turretGeo, wallMat);
    turret.name = 'Turret_' + idx;
    turret.position.set(tc.x, tc.y, tc.z);
    castle.add(turret);

    const turretCone = new THREE.Mesh(turretConeGeo, roofMat);
    turretCone.name = 'TurretRoof_' + idx;
    turretCone.position.set(tc.x, tc.y + turretHeight/2 + 0.325, tc.z);
    castle.add(turretCone);
  });

  // 5. RUMAH GERBANG MASUK (Gatehouse - Struktur Lebih Rendah di Sisi Kiri)
  const gateHouse = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 1.2), gateMat);
  gateHouse.name = 'Gatehouse';
  gateHouse.position.set(-1.3, 0.9, 0.2); // y=0.9
  castle.add(gateHouse);

  // Pintu Gerbang Melengkung Gelap
  const gateDoor = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 0.6), darkMat);
  gateDoor.name = 'GateDoor';
  gateDoor.position.set(-1.81, 0.5, 0.2);
  castle.add(gateDoor);

  // Atap Gabel Rumah Gerbang
  const gateRoofL = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.8), roofMat);
  gateRoofL.name = 'GateRoofLeft';
  gateRoofL.position.set(-1.3, 1.95, 0.45);
  gateRoofL.rotation.x = 0.6;
  castle.add(gateRoofL);

  const gateRoofR = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.06, 0.8), roofMat);
  gateRoofR.name = 'GateRoofRight';
  gateRoofR.position.set(-1.3, 1.95, -0.05);
  gateRoofR.rotation.x = -0.6;
  castle.add(gateRoofR);

  // 6. DETAIL JENDELA KOTAK GELAP (Windows)
  const winGeo = new THREE.BoxGeometry(0.05, 0.35, 0.2);
  const windowsCoords = [
    {x: 0, y: 2.2, z: 0.71},
    {x: -0.6, y: 2.2, z: 0.71},
    {x: 0, y: 1.2, z: 0.71},
    {x: -0.6, y: 1.2, z: 0.71},
    // Sisi Belakang (z = -0.71)
    {x: 0.5, y: 2.2, z: -0.71},
    {x: -0.2, y: 2.2, z: -0.71},
    {x: 0.5, y: 1.2, z: -0.71},
    {x: -0.2, y: 1.2, z: -0.71}
  ];

  windowsCoords.forEach((wc, idx) => {
    const windowMesh = new THREE.Mesh(winGeo, darkMat);
    windowMesh.name = 'Window_' + idx;
    windowMesh.position.set(wc.x, wc.y, wc.z);
    castle.add(windowMesh);
  });

  return castle;
}
landmarkGroup.add(makeNeuschwanstein());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Jerman...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/germany.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Jerman diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Jerman:', err);
}
