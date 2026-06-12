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

// --- Material PBR Batu Soapstone Abu-Abu ---
const stoneMat = new THREE.MeshStandardMaterial({color: 0xd6dcd6, roughness: 0.8, metalness: 0.05}); // Soapstone abu-krem kehijauan
const hairMat  = new THREE.MeshStandardMaterial({color: 0x475569, roughness: 0.7}); // Rambut abu-abu tua
const goldMat  = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.85, roughness: 0.2}); // Halo emas

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'BrazilLandmark';

// --- Pembuat Patung Kristus Penebus Low-Poly Detail ---
function makeChristRedeemer() {
  const christ = new THREE.Group();
  christ.name = 'ChristRedeemer';

  // 1. JUBAH BAGIAN BAWAH (Robe Bottom - Silinder Bersegi 8 Tapered)
  const bodyHeight = 3.8;
  const lowerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.92, bodyHeight, 8), stoneMat);
  lowerBody.name = 'LowerBody';
  lowerBody.position.y = bodyHeight / 2; // Bottom di y=0
  christ.add(lowerBody);

  // Lipatan Jubah Vertikal (Folds - Loop berkeliling untuk detail pleats) - Gunakan satu geometri bersama
  const numFolds = 8;
  const foldGeo = new THREE.CylinderGeometry(0.06, 0.07, bodyHeight, 4);
  for (let i = 0; i < numFolds; i++) {
    const angle = (i / numFolds) * Math.PI * 2;
    const foldRadius = 0.8;
    const fold = new THREE.Mesh(foldGeo, stoneMat);
    fold.name = 'RobeFold_' + i;
    fold.position.set(Math.sin(angle) * foldRadius, bodyHeight / 2, Math.cos(angle) * foldRadius);
    fold.rotation.y = angle;
    christ.add(fold);
  }

  // 2. DADA & MANTEL (Chest & Shawl)
  const chestHeight = 1.3;
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.72, chestHeight, 8), stoneMat);
  chest.name = 'Chest';
  chest.position.set(0, bodyHeight + chestHeight / 2, 0); // y = 3.8 + 0.65 = 4.45
  christ.add(chest);

  // Geometri lengan & kain jubah menggantung bersama
  const armLength = 2.4;
  const armGeometry = new THREE.CylinderGeometry(0.2, 0.35, armLength, 6);
  const drapeGeometry = new THREE.BoxGeometry(1.8, 0.65, 0.25);
  const handGeometry = new THREE.BoxGeometry(0.26, 0.1, 0.26);

  // 3. LENGAN KIRI TERBENTANG DENGAN SAKU JUBAH MENGGANTUNG (Left Arm & Sleeve)
  const leftArm = new THREE.Mesh(armGeometry, stoneMat);
  leftArm.name = 'LeftArm';
  leftArm.rotation.z = Math.PI / 2; // Horizontal
  leftArm.position.set(-1.8, 4.65, 0); // x = -1.8, y = 4.65
  christ.add(leftArm);

  // Kain jubah yang menggantung di bawah lengan kiri (draped sleeve)
  const leftDrape = new THREE.Mesh(drapeGeometry, stoneMat);
  leftDrape.name = 'LeftSleeveDrape';
  leftDrape.position.set(-1.7, 4.25, 0);
  leftDrape.rotation.z = -0.15; // Miring sedikit ke bawah
  christ.add(leftDrape);

  // Telapak Tangan Kiri
  const handL = new THREE.Mesh(handGeometry, stoneMat);
  handL.name = 'HandL';
  handL.position.set(-3.1, 4.65, 0);
  handL.rotation.y = 0.2;
  christ.add(handL);

  // 4. LENGAN KANAN TERBENTANG DENGAN SAKU JUBAH MENGGANTUNG (Right Arm & Sleeve)
  const rightArm = new THREE.Mesh(armGeometry, stoneMat);
  rightArm.name = 'RightArm';
  rightArm.rotation.z = -Math.PI / 2; // Horizontal
  rightArm.position.set(1.8, 4.65, 0); // x = 1.8, y = 4.65
  christ.add(rightArm);

  // Kain jubah yang menggantung di bawah lengan kanan (draped sleeve)
  const rightDrape = new THREE.Mesh(drapeGeometry, stoneMat);
  rightDrape.name = 'RightSleeveDrape';
  rightDrape.position.set(1.7, 4.25, 0);
  rightDrape.rotation.z = 0.15; // Miring sedikit ke bawah
  christ.add(rightDrape);

  // Telapak Tangan Kanan
  const handR = new THREE.Mesh(handGeometry, stoneMat);
  handR.name = 'HandR';
  handR.position.set(3.1, 4.65, 0);
  handR.rotation.y = -0.2;
  christ.add(handR);

  // 5. LEHER & KEPALA (Neck & Head)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.4, 8), stoneMat);
  neck.name = 'Neck';
  neck.position.set(0, 5.2, 0);
  christ.add(neck);

  const headGroup = new THREE.Group();
  headGroup.name = 'HeadGroup';
  headGroup.position.set(0, 5.7, 0); // y = 5.7

  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.58, 8), stoneMat);
  face.name = 'Face';
  headGroup.add(face);

  const crownSphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8, 0, Math.PI*2, 0, Math.PI/2), stoneMat);
  crownSphere.position.y = 0.29;
  headGroup.add(crownSphere);

  // Geometri rambut samping bersama
  const sideHairGeometry = new THREE.BoxGeometry(0.1, 0.55, 0.35);

  // Rambut samping yang membingkai wajah
  const hairL = new THREE.Mesh(sideHairGeometry, hairMat);
  hairL.position.set(-0.32, -0.05, -0.05);
  headGroup.add(hairL);

  const hairR = new THREE.Mesh(sideHairGeometry, hairMat);
  hairR.position.set(0.32, -0.05, -0.05);
  headGroup.add(hairR);

  // Rambut belakang
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.6, 0.15), hairMat);
  hairBack.position.set(0, -0.05, -0.3);
  headGroup.add(hairBack);

  // 6. HALO / CINCIN MAHKOTA EMAS (Golden Halo Torus)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.04, 6, 16), goldMat);
  halo.name = 'Halo';
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, 0.15, -0.28);
  headGroup.add(halo);

  christ.add(headGroup);

  return christ;
}
landmarkGroup.add(makeChristRedeemer());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Brazil...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/brazil.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Brazil diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Brazil:', err);
}
