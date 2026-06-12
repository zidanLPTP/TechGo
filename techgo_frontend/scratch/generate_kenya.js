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

// --- Material PBR Khas Sabana (Tanpa Alas) ---
const trunkMat      = new THREE.MeshStandardMaterial({color: 0x5a3e1b, roughness: 0.9, metalness: 0.05}); // Kayu Akasia
const acaciaLeafMat = new THREE.MeshStandardMaterial({color: 0x3d703b, roughness: 0.85, metalness: 0.05}); // Daun Akasia
const giraffeYellowMat = new THREE.MeshStandardMaterial({color: 0xe6b842, roughness: 0.7, metalness: 0.05}); // Badan Jerapah
const giraffeBrownMat  = new THREE.MeshStandardMaterial({color: 0x8c5b23, roughness: 0.75, metalness: 0.05}); // Bintik Jerapah
const elephantGreyMat  = new THREE.MeshStandardMaterial({color: 0x8a939e, roughness: 0.75, metalness: 0.05}); // Kulit Gajah
const elephantTuskMat  = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.2, metalness: 0.1});   // Gading Gajah
const darkEyeMat       = new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.5, metalness: 0.1});   // Mata Hewan

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas Tanah) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'KenyaLandmark';

// --- 1. Pembuat Pohon Akasia Sabana ---
function makeAcaciaTree(x, z, rotationY) {
  const tree = new THREE.Group();
  tree.name = 'AcaciaTree';

  // Batang Utama
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 3.2, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.6;
  tree.add(trunk);

  // Cabang Cabang Atas (Low-poly split)
  const branch1Geo = new THREE.CylinderGeometry(0.2, 0.28, 1.8, 6);
  const branch1 = new THREE.Mesh(branch1Geo, trunkMat);
  branch1.position.set(0.4, 2.9, 0.4);
  branch1.rotation.set(0.4, 0, -0.4);
  tree.add(branch1);

  const branch2Geo = new THREE.CylinderGeometry(0.18, 0.26, 1.8, 6);
  const branch2 = new THREE.Mesh(branch2Geo, trunkMat);
  branch2.position.set(-0.4, 2.9, -0.4);
  branch2.rotation.set(-0.4, 0, 0.4);
  tree.add(branch2);

  // Daun Payung Akasia (Flat Umbrella Canopies)
  // Payung Tengah Besar
  const canopyCenter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 3.6), acaciaLeafMat);
  canopyCenter.position.set(0, 3.8, 0);
  tree.add(canopyCenter);

  // Payung Kiri Samping
  const canopyLeft = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 2.2), acaciaLeafMat);
  canopyLeft.position.set(1.0, 3.5, 0.8);
  tree.add(canopyLeft);

  // Payung Kanan Samping
  const canopyRight = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.28, 2.0), acaciaLeafMat);
  canopyRight.position.set(-1.0, 3.5, -0.8);
  tree.add(canopyRight);

  tree.position.set(x, 0, z);
  tree.rotation.y = rotationY;
  landmarkGroup.add(tree);
}
makeAcaciaTree(-3.5, -0.5, 0.4);

// --- 2. Pembuat Jerapah Lucu ---
function makeGiraffe(x, z, rotationY) {
  const giraffe = new THREE.Group();
  giraffe.name = 'Giraffe';

  // Badan
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 2.6), giraffeYellowMat);
  body.name = 'Body';
  body.position.y = 2.9;
  giraffe.add(body);

  // Kaki (4 unit)
  const legGeo = new THREE.BoxGeometry(0.25, 2.3, 0.25);
  const legs = [
    { lx: -0.5, lz: 0.95 },
    { lx: 0.5, lz: 0.95 },
    { lx: -0.5, lz: -0.95 },
    { lx: 0.5, lz: -0.95 }
  ];
  legs.forEach((l, i) => {
    const leg = new THREE.Mesh(legGeo, giraffeYellowMat);
    leg.name = 'Leg_' + i;
    leg.position.set(l.lx, 1.15, l.lz);
    giraffe.add(leg);
  });

  // Leher (Panjang menjulang)
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.8, 0.5), giraffeYellowMat);
  neck.name = 'Neck';
  neck.position.set(0, 4.3, 0.95);
  neck.rotation.x = -0.22;
  giraffe.add(neck);

  // Kepala
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.0), giraffeYellowMat);
  head.name = 'Head';
  head.position.set(0, 5.65, 1.4);
  giraffe.add(head);

  // Telinga & Tanduk kecil (Ossicones)
  const hornL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.08), giraffeBrownMat);
  hornL.position.set(-0.16, 5.9, 1.25);
  const hornR = new THREE.Mesh(hornL.geometry, giraffeBrownMat);
  hornR.position.set(0.16, 5.9, 1.25);
  giraffe.add(hornL);
  giraffe.add(hornR);

  // Bintik Bintik 3D (Spots)
  const spots = [
    { sx: 0.71, sy: 3.1, sz: 0.5, w: 0.1, h: 0.4, d: 0.4 },
    { sx: 0.71, sy: 2.7, sz: -0.6, w: 0.1, h: 0.3, d: 0.3 },
    { sx: -0.71, sy: 3.2, sz: -0.2, w: 0.1, h: 0.35, d: 0.35 },
    { sx: -0.71, sy: 2.8, sz: 0.7, w: 0.1, h: 0.3, d: 0.3 },
    { sx: 0.24, sy: 4.8, sz: 1.15, w: 0.1, h: 0.3, d: 0.3 },
    { sx: -0.24, sy: 4.2, sz: 1.0, w: 0.1, h: 0.25, d: 0.25 }
  ];
  spots.forEach((s, i) => {
    const spot = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), giraffeBrownMat);
    spot.name = 'Spot_' + i;
    spot.position.set(s.sx, s.sy, s.sz);
    giraffe.add(spot);
  });

  // Mata Hitam Imut
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
  const eyeL = new THREE.Mesh(eyeGeo, darkEyeMat);
  eyeL.position.set(-0.26, 5.7, 1.6);
  const eyeR = new THREE.Mesh(eyeGeo, darkEyeMat);
  eyeR.position.set(0.26, 5.7, 1.6);
  giraffe.add(eyeL);
  giraffe.add(eyeR);

  giraffe.position.set(x, 0, z);
  giraffe.rotation.y = rotationY;
  landmarkGroup.add(giraffe);
}
makeGiraffe(1.8, 1.0, -0.6);

// --- 3. Pembuat Gajah Afrika Imut ---
function makeElephant(x, z, rotationY) {
  const elephant = new THREE.Group();
  elephant.name = 'Elephant';

  // Badan
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 2.8), elephantGreyMat);
  body.name = 'Body';
  body.position.y = 2.0;
  elephant.add(body);

  // Kaki Gajah (4 unit)
  const legGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
  const legs = [
    { lx: -0.7, lz: 0.9 },
    { lx: 0.7, lz: 0.9 },
    { lx: -0.7, lz: -0.9 },
    { lx: 0.7, lz: -0.9 }
  ];
  legs.forEach((l, i) => {
    const leg = new THREE.Mesh(legGeo, elephantGreyMat);
    leg.name = 'Leg_' + i;
    leg.position.set(l.lx, 0.6, l.lz);
    elephant.add(leg);
  });

  // Kepala Gajah
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.1), elephantGreyMat);
  head.name = 'Head';
  head.position.set(0, 2.5, 1.35);
  elephant.add(head);

  // Telinga Lebar (2 unit)
  const earGeo = new THREE.BoxGeometry(0.12, 1.3, 1.0);
  const earL = new THREE.Mesh(earGeo, elephantGreyMat);
  earL.name = 'EarL';
  earL.position.set(-0.7, 2.5, 1.2);
  earL.rotation.y = 0.4;
  
  const earR = new THREE.Mesh(earGeo, elephantGreyMat);
  earR.name = 'EarR';
  earR.position.set(0.7, 2.5, 1.2);
  earR.rotation.y = -0.4;
  elephant.add(earL);
  elephant.add(earR);

  // Belalai (Trunk)
  const trunk1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.7), elephantGreyMat);
  trunk1.position.set(0, 2.1, 1.85);
  trunk1.rotation.x = -0.3;
  elephant.add(trunk1);

  const trunk2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), elephantGreyMat);
  trunk2.position.set(0, 1.55, 2.15);
  trunk2.rotation.x = 0.2;
  elephant.add(trunk2);

  // Gading Putih
  const tuskGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.6, 6);
  tuskGeo.rotateX(Math.PI/2 - 0.2);
  const tuskL = new THREE.Mesh(tuskGeo, elephantTuskMat);
  tuskL.position.set(-0.35, 1.9, 1.7);
  const tuskR = new THREE.Mesh(tuskGeo, elephantTuskMat);
  tuskR.position.set(0.35, 1.9, 1.7);
  elephant.add(tuskL);
  elephant.add(tuskR);

  // Mata Gajah
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
  const eyeL = new THREE.Mesh(eyeGeo, darkEyeMat);
  eyeL.position.set(-0.66, 2.6, 1.7);
  const eyeR = new THREE.Mesh(eyeGeo, darkEyeMat);
  eyeR.position.set(0.66, 2.6, 1.7);
  elephant.add(eyeL);
  elephant.add(eyeR);

  elephant.position.set(x, 0, z);
  elephant.rotation.y = rotationY;
  landmarkGroup.add(elephant);
}
makeElephant(-1.0, 3.2, 0.5);

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Kenya...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/kenya.glb');
  
  // Pastikan folder tujuan ada
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Kenya diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Kenya:', err);
}
