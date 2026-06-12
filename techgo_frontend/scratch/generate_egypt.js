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

// --- Material PBR Kualitas Premium ---
const stoneMat  = new THREE.MeshStandardMaterial({color: 0xdbb065, roughness: 0.8, metalness: 0.05});
const darkMat   = new THREE.MeshStandardMaterial({color: 0xb58943, roughness: 0.85, metalness: 0.05});
const bodyMat   = new THREE.MeshStandardMaterial({color: 0xd2a75c, roughness: 0.75, metalness: 0.05});
const baseMat   = new THREE.MeshStandardMaterial({color: 0x9f7938, roughness: 0.9, metalness: 0.05});

// Material khusus aksen detail
const goldMat   = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.85, roughness: 0.15}); // Capstone Emas
const creamMat  = new THREE.MeshStandardMaterial({color: 0xf3eee2, roughness: 0.7, metalness: 0.05});  // Casing kapur Khafre
const blueMat   = new THREE.MeshStandardMaterial({color: 0x1e3f8a, roughness: 0.6, metalness: 0.1});   // Garis Nemes Biru
const redStoneMat = new THREE.MeshStandardMaterial({color: 0xa84a32, roughness: 0.75, metalness: 0.05}); // Prasasti Mimpi
const sandDuneMat = new THREE.MeshStandardMaterial({color: 0xe5ba73, roughness: 0.9, metalness: 0.02});  // Gundukan pasir
const trunkMat  = new THREE.MeshStandardMaterial({color: 0x765230, roughness: 0.9, metalness: 0.05});  // Batang palem
const greenMat  = new THREE.MeshStandardMaterial({color: 0x367c4b, roughness: 0.8, metalness: 0.05});  // Daun palem

// --- Group Utama Landmark (Target Ekspor GLB) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'EgyptLandmark';

// --- Pembuat 3 Piramida Agung ---
function makePyramid(wx, wy, x, z, type) {
  const pGroup = new THREE.Group();
  pGroup.name = 'PyramidGroup_' + type;

  // Tubuh utama piramida
  const g = new THREE.CylinderGeometry(0, (wx/2)*THREE.MathUtils.DEG2RAD * 81, wy, 4, 1); // Penyesuaian radius
  // DEG2RAD * 81 bernilai ~1.4137 yang setara Math.SQRT2 (~1.414) untuk menjaga kecocokan matematis silinder 4-sisi
  const radiusCorrection = (wx / 2) * Math.SQRT2;
  const cylinderGeo = new THREE.CylinderGeometry(0, radiusCorrection, wy, 4, 1);
  cylinderGeo.rotateY(Math.PI / 4);

  const mesh = new THREE.Mesh(cylinderGeo, stoneMat);
  mesh.name = 'PyramidBody';
  mesh.position.set(0, wy/2, 0);
  pGroup.add(mesh);
  // Detail Puncak khas masing-masing piramida
  if (type === 'khufu') {
    // Capstone emas murni (Pyramidion)
    const capH = wy * 0.15;
    const capG = new THREE.CylinderGeometry(0, (wx/2)*Math.SQRT2*0.15, capH, 4, 1);
    capG.rotateY(Math.PI/4);
    const cap = new THREE.Mesh(capG, goldMat);
    cap.name = 'PyramidionGold';
    cap.position.set(0, wy - capH/2, 0);
    pGroup.add(cap);
  } else if (type === 'khafre') {
    // Sisa selubung batu kapur putih di puncak
    const capH = wy * 0.32;
    const capG = new THREE.CylinderGeometry(0, (wx/2)*Math.SQRT2*0.32, capH, 4, 1);
    capG.rotateY(Math.PI/4);
    const cap = new THREE.Mesh(capG, creamMat);
    cap.name = 'LimestoneCasing';
    cap.position.set(0, wy - capH/2, 0);
    pGroup.add(cap);
  } else if (type === 'menkaure') {
    // Capstone emas kecil
    const capH = wy * 0.11;
    const capG = new THREE.CylinderGeometry(0, (wx/2)*Math.SQRT2*0.11, capH, 4, 1);
    capG.rotateY(Math.PI/4);
    const cap = new THREE.Mesh(capG, goldMat);
    cap.name = 'PyramidionGoldSmall';
    cap.position.set(0, wy - capH/2, 0);
    pGroup.add(cap);
  }

  pGroup.position.set(x, 0, z);
  landmarkGroup.add(pGroup);
}

// Khufu (Besar), Khafre (Sedang), Menkaure (Kecil)
makePyramid(7.2, 9.2,   0,   0, 'khufu');
makePyramid(5.6, 7.3,  -9,  -2.5, 'khafre');
makePyramid(4.5, 5.8,   9,  -3.5, 'menkaure');

// --- Patung Agung Sphinx ---
function makeSphinx(){
  const g = new THREE.Group();
  g.name = 'Sphinx';

  // Badan utama
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.7, 7.8), bodyMat);
  body.name = 'SphinxBody';
  body.position.set(0, 0.85, 0);
  g.add(body);

  // Leher
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.0, 8), bodyMat);
  neck.name = 'SphinxNeck';
  neck.position.set(0, 2.1, 3.1);
  g.add(neck);

  // Kepala
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.4, 1.3), bodyMat);
  head.name = 'SphinxHead';
  head.position.set(0, 2.9, 3.1);
  g.add(head);

  // Hidung
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.4), bodyMat);
  nose.name = 'SphinxNose';
  nose.position.set(0, 2.85, 3.75);
  g.add(nose);

  // Janggut Firaun
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.15), darkMat);
  beard.name = 'SphinxBeard';
  beard.position.set(0, 2.1, 3.4);
  g.add(beard);

  // Cakar kiri & kanan
  const pawGeo = new THREE.BoxGeometry(0.9, 0.5, 2.2);
  const pawL = new THREE.Mesh(pawGeo, bodyMat);
  pawL.name = 'PawL';
  pawL.position.set(-1.15, 0.25, 4.0);

  const pawR = new THREE.Mesh(pawGeo, bodyMat);
  pawR.name = 'PawR';
  pawR.position.set(1.15, 0.25, 4.0);
  g.add(pawL);
  g.add(pawR);

  // Ekor Melingkar
  const tailSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 2.2), bodyMat);
  tailSeg1.name = 'SphinxTail1';
  tailSeg1.position.set(1.7, 0.2, -2.6);
  g.add(tailSeg1);

  const tailSeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 1.4), bodyMat);
  tailSeg2.name = 'SphinxTail2';
  tailSeg2.position.set(1.4, 0.2, -3.6);
  tailSeg2.rotation.y = 0.5;
  g.add(tailSeg2);

  // Hiasan Kepala Nemes
  const nemesL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.7, 0.7), blueMat);
  nemesL.name = 'NemesWingL';
  nemesL.position.set(-0.75, 2.3, 3.1);
  nemesL.rotation.z = 0.08;
  g.add(nemesL);

  const nemesR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.7, 0.7), blueMat);
  nemesR.name = 'NemesWingR';
  nemesR.position.set(0.75, 2.3, 3.1);
  nemesR.rotation.z = -0.08;
  g.add(nemesR);

  const nemesTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.4), goldMat);
  nemesTop.name = 'NemesTop';
  nemesTop.position.set(0, 3.65, 3.05);
  g.add(nemesTop);

  const nemesBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.4), blueMat);
  nemesBack.name = 'NemesBack';
  nemesBack.position.set(0, 2.05, 2.2);
  g.add(nemesBack);

  // Prasasti Mimpi
  const stele = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.6), redStoneMat);
  stele.name = 'DreamStele';
  stele.position.set(0, 0.55, 4.4);
  g.add(stele);

  g.position.set(0, 0, 9.5);
  return g;
}
landmarkGroup.add(makeSphinx());

// --- Pembuat Pohon Palem/Kurma Bergaya Low-Poly ---
function makePalmTree(x, z, rotationY) {
  const palm = new THREE.Group();
  palm.name = 'PalmTree';

  const trunkGroup = new THREE.Group();
  trunkGroup.name = 'Trunk';

  const segs = [
    { r1: 0.25, r2: 0.28, h: 1.2, px: 0, py: 0.6, pz: 0, rz: 0 },
    { r1: 0.21, r2: 0.25, h: 1.2, px: -0.06, py: 1.7, pz: 0.05, rz: 0.08 },
    { r1: 0.17, r2: 0.21, h: 1.2, px: -0.18, py: 2.75, pz: 0.15, rz: 0.16 },
    { r1: 0.14, r2: 0.17, h: 1.2, px: -0.38, py: 3.75, pz: 0.3, rz: 0.24 }
  ];

  segs.forEach(s => {
    const g = new THREE.CylinderGeometry(s.r1, s.r2, s.h, 6);
    const m = new THREE.Mesh(g, trunkMat);
    m.position.set(s.px, s.py, s.pz);
    m.rotation.z = s.rz;
    trunkGroup.add(m);
  });
  palm.add(trunkGroup);

  const leafGroup = new THREE.Group();
  leafGroup.name = 'Leaves';
  leafGroup.position.set(-0.58, 4.3, 0.45);

  for (let i = 0; i < 5; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = i * (Math.PI * 2 / 5);

    const leafMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 1.8), greenMat);
    leafMesh.position.set(0, -0.2, 0.8);
    leafMesh.rotation.x = -0.3;
    pivot.add(leafMesh);
    leafGroup.add(pivot);
  }
  palm.add(leafGroup);

  palm.position.set(x, 0, z);
  palm.rotation.y = rotationY;
  landmarkGroup.add(palm);
}

makePalmTree(11.5, 4.5, 0.5);
makePalmTree(-11.0, 5.5, -0.8);

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/egypt.glb');
  
  // Pastikan folder tujuan ada
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Mesir diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D:', err);
}
