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

// --- Material PBR Khas Big Ben ---
const brickMat    = new THREE.MeshStandardMaterial({color: 0xdfcfb7, roughness: 0.75, metalness: 0.05}); // Batu tan/krem pasir
const darkMat     = new THREE.MeshStandardMaterial({color: 0x334155, roughness: 0.5, metalness: 0.2}); // Logam gelap/atap slate
const clockFaceMat= new THREE.MeshStandardMaterial({color: 0xfaf8f5, roughness: 0.85}); // Kaca putih jam
const goldMat     = new THREE.MeshStandardMaterial({color: 0xffd700, metalness: 0.85, roughness: 0.2}); // Detail emas
const handsMat    = new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.5}); // Jarum jam hitam

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'UKLandmark';

// --- Pembuat Menara Big Ben Low-Poly ---
function makeBigBen() {
  const tower = new THREE.Group();
  tower.name = 'BigBen';

  // 1. Badan Menara Utama
  const bodyHeight = 7.0;
  const bodyGeo = new THREE.BoxGeometry(1.6, bodyHeight, 1.6);
  const bodyMesh = new THREE.Mesh(bodyGeo, brickMat);
  bodyMesh.position.y = bodyHeight / 2; // Bottom di y=0
  bodyMesh.name = 'TowerBody';
  tower.add(bodyMesh);

  // 2. Pilar Sudut / Corner Buttresses (Gothic Ribbed Style)
  const buttressGeo = new THREE.BoxGeometry(0.14, bodyHeight, 0.14);
  const offset = 0.8;
  const corners = [
    {x: -offset, z: -offset},
    {x: offset, z: -offset},
    {x: -offset, z: offset},
    {x: offset, z: offset}
  ];
  corners.forEach((c, idx) => {
    const buttress = new THREE.Mesh(buttressGeo, brickMat);
    buttress.name = 'Buttress_' + idx;
    buttress.position.set(c.x, bodyHeight / 2, c.z);
    tower.add(buttress);
  });

  // 3. Ornamen Horizontal Sabuk Menara (Molding Belt)
  const beltGeo = new THREE.BoxGeometry(1.72, 0.15, 1.72);
  const beltHeights = [2.0, 4.5, 6.2];
  beltHeights.forEach((h, idx) => {
    const belt = new THREE.Mesh(beltGeo, brickMat);
    belt.name = 'Belt_' + idx;
    belt.position.set(0, h, 0);
    tower.add(belt);
  });

  // 4. Balkon Dasar Jam (Corbel/Balcony Base)
  const baseJam = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 1.9), brickMat);
  baseJam.name = 'ClockBalconyBase';
  baseJam.position.set(0, 7.125, 0);
  tower.add(baseJam);

  // 5. Ruang Kamar Jam (Clock Chamber)
  const clockChamberHeight = 1.6;
  const clockChamber = new THREE.Mesh(new THREE.BoxGeometry(1.75, clockChamberHeight, 1.75), brickMat);
  clockChamber.name = 'ClockChamber';
  clockChamber.position.set(0, 7.125 + 0.8, 0); // y = 7.925
  tower.add(clockChamber);

  // 6. Piringan Jam di 4 Sisi (Clock Faces)
  const dialRadius = 0.52;
  const dialGeo = new THREE.CylinderGeometry(dialRadius, dialRadius, 0.05, 12);
  dialGeo.rotateX(Math.PI / 2); // Menghadap ke depan/belakang

  const clockFacesData = [
    { name: 'FaceNorth', x: 0, y: 7.925, z: 0.88, rotY: 0 },
    { name: 'FaceSouth', x: 0, y: 7.925, z: -0.88, rotY: Math.PI },
    { name: 'FaceEast', x: 0.88, y: 7.925, z: 0, rotY: Math.PI / 2 },
    { name: 'FaceWest', x: -0.88, y: 7.925, z: 0, rotY: -Math.PI / 2 }
  ];

  clockFacesData.forEach((data) => {
    const faceGroup = new THREE.Group();
    faceGroup.name = data.name + 'Group';
    faceGroup.position.set(data.x, data.y, data.z);
    faceGroup.rotation.y = data.rotY;

    // Piringan Putih Jam
    const dial = new THREE.Mesh(dialGeo, clockFaceMat);
    dial.name = data.name;
    faceGroup.add(dial);

    // Bingkai Jam Emas
    const ringGeo = new THREE.CylinderGeometry(dialRadius + 0.06, dialRadius + 0.04, 0.06, 12, 1, true);
    ringGeo.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.name = data.name + 'Ring';
    faceGroup.add(ring);

    // Jarum Jam (Jam 3:00)
    // Jarum Pendek (Jam)
    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.02), handsMat);
    hourHand.name = data.name + 'HourHand';
    hourHand.position.set(0.125, 0, 0.04);
    faceGroup.add(hourHand);

    // Jarum Panjang (Menit)
    const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.02), handsMat);
    minuteHand.name = data.name + 'MinHand';
    minuteHand.position.set(0, 0.19, 0.04);
    faceGroup.add(minuteHand);

    tower.add(faceGroup);
  });

  // 7. Balkon Atas Jam (Upper Balcony)
  const upperBalcony = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 1.8), brickMat);
  upperBalcony.name = 'UpperBalcony';
  upperBalcony.position.set(0, 8.8, 0); // 7.925 + 0.8 + 0.075
  tower.add(upperBalcony);

  // 8. Ruang Lonceng (Belfry / Bell Chamber)
  const belfryGroup = new THREE.Group();
  belfryGroup.name = 'Belfry';
  belfryGroup.position.set(0, 9.475, 0); // 8.8 + 0.075 + 0.6

  // Tengah
  const belfryCore = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.9), darkMat);
  belfryCore.name = 'BelfryCore';
  belfryGroup.add(belfryCore);

  // Pilar sudut belfry
  const colGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
  const colOffset = 0.6;
  const colCoords = [
    {x: -colOffset, z: -colOffset},
    {x: colOffset, z: -colOffset},
    {x: -colOffset, z: colOffset},
    {x: colOffset, z: colOffset}
  ];
  colCoords.forEach((c, idx) => {
    const col = new THREE.Mesh(colGeo, brickMat);
    col.name = 'BelfryColumn_' + idx;
    col.position.set(c.x, 0, c.z);
    belfryGroup.add(col);
  });
  tower.add(belfryGroup);

  // 9. Atap Piramida Utama (Spire Roof)
  const spireHeight = 2.5;
  const spireGeo = new THREE.ConeGeometry(1.08, spireHeight, 4);
  spireGeo.rotateY(Math.PI / 4); // Sejajarkan sisi piramida dengan sisi menara persegi
  const spire = new THREE.Mesh(spireGeo, darkMat);
  spire.name = 'MainSpire';
  spire.position.set(0, 9.475 + 0.6 + spireHeight/2, 0); // 9.475 + 0.6 + 1.25 = 11.325
  tower.add(spire);

  // 10. 4 Spira Sudut Kecil (Pinnacles)
  const pinHeight = 0.9;
  const pinGeo = new THREE.ConeGeometry(0.15, pinHeight, 4);
  pinGeo.rotateY(Math.PI / 4);
  const pinOffset = 0.6;
  const pinCoords = [
    {x: -pinOffset, z: -pinOffset},
    {x: pinOffset, z: -pinOffset},
    {x: -pinOffset, z: pinOffset},
    {x: pinOffset, z: pinOffset}
  ];
  pinCoords.forEach((c, idx) => {
    const pin = new THREE.Mesh(pinGeo, brickMat);
    pin.name = 'Pinnacle_' + idx;
    pin.position.set(c.x, 10.075 + pinHeight/2, c.z); // 9.475 + 0.6
    tower.add(pin);
  });

  // 11. Ujung Tiang Penunjuk Arah Mata Angin Emas (Finial)
  const finialGroup = new THREE.Group();
  finialGroup.name = 'Finial';
  finialGroup.position.set(0, 11.325 + spireHeight/2, 0); // y = 12.575

  // Tiang logam
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), goldMat);
  pole.name = 'FinialPole';
  pole.position.y = 0.4;
  finialGroup.add(pole);

  // Bola Emas
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), goldMat);
  ball.name = 'FinialBall';
  ball.position.y = 0.8;
  finialGroup.add(ball);

  tower.add(finialGroup);

  return tower;
}
landmarkGroup.add(makeBigBen());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D UK...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/united_kingdom.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D UK diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D UK:', err);
}
