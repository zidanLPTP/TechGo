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

// --- Material PBR Namsan Tower ---
const baseMat   = new THREE.MeshStandardMaterial({color: 0xe2e8f0, roughness: 0.65, metalness: 0.1}); // Gedung dasar abu-abu
const towerMat  = new THREE.MeshStandardMaterial({color: 0xf8fafc, roughness: 0.5, metalness: 0.15}); // Tiang putih bersih
const silverMat = new THREE.MeshStandardMaterial({color: 0xcbd5e1, metalness: 0.8, roughness: 0.2}); // Logam perak dek observasi
const glassMat  = new THREE.MeshStandardMaterial({color: 0x1e293b, roughness: 0.1, metalness: 0.9}); // Kaca jendela gelap
const orangeMat = new THREE.MeshStandardMaterial({color: 0xe11d48, roughness: 0.5}); // Antena merah/oranye
const whiteMat  = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.5}); // Antena putih

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'SouthKoreaLandmark';

// --- Pembuat Namsan Tower Low-Poly ---
function makeNamsanTower() {
  const tower = new THREE.Group();
  tower.name = 'NamsanTower';

  // 1. Gedung Dasar Heksagonal (Annex/Lobby)
  const baseHeight = 1.8;
  const baseBuilding = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, baseHeight, 8), baseMat);
  baseBuilding.name = 'BaseAnnex';
  baseBuilding.position.y = baseHeight / 2; // Bottom di y=0
  tower.add(baseBuilding);

  // Detail tangga/lobby masuk depan
  const lobbyEntrance = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.4), baseMat);
  lobbyEntrance.name = 'EntranceLobby';
  lobbyEntrance.position.set(0, 0.45, 1.1);
  tower.add(lobbyEntrance);

  // 2. Kolom Tiang Utama (Tapered Shaft)
  const shaftHeight = 7.0;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.45, shaftHeight, 8), towerMat);
  shaft.name = 'TowerShaft';
  shaft.position.y = baseHeight + shaftHeight / 2; // y = 1.8 + 3.5 = 5.3
  tower.add(shaft);

  // 3. Dek Observasi Bawah (Lower ring)
  const lowerDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.9, 0.4, 12), silverMat);
  lowerDeck.name = 'LowerDeck';
  lowerDeck.position.y = 7.3;
  tower.add(lowerDeck);

  // 4. Dek Observasi Utama (Main Observatory - Silver & Glass layers)
  const obsGroup = new THREE.Group();
  obsGroup.name = 'ObservatoryGroup';
  obsGroup.position.y = 7.85; // y = 7.85

  // Ring perak bawah
  const obsBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.23, 1.2, 0.12, 12), silverMat);
  obsBottom.position.y = -0.29;
  obsGroup.add(obsBottom);

  // Ring kaca jendela tengah
  const obsGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.27, 1.24, 0.46, 12), glassMat);
  obsGroup.add(obsGlass);

  // Ring perak atas (atap dek observasi)
  const obsTop = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.27, 0.12, 12), silverMat);
  obsTop.position.y = 0.29;
  obsGroup.add(obsTop);

  tower.add(obsGroup);

  // 5. Tiang Silinder Atas (Upper Small Shaft)
  const upperShaftHeight = 1.0;
  const upperShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, upperShaftHeight, 8), towerMat);
  upperShaft.name = 'UpperShaft';
  upperShaft.position.y = 8.2 + upperShaftHeight/2; // y = 8.7
  tower.add(upperShaft);

  // 6. Tiang Antena Bergaris Merah-Putih (Spire Antenna)
  const antennaGroup = new THREE.Group();
  antennaGroup.name = 'AntennaGroup';
  antennaGroup.position.y = 9.2; // Mulai di y = 9.2

  const segHeight = 0.6;
  const segGeo = new THREE.CylinderGeometry(0.08, 0.08, segHeight, 6);

  const segmentsData = [
    { name: 'RedSeg1', y: 0.3, mat: orangeMat },
    { name: 'WhiteSeg1', y: 0.9, mat: whiteMat },
    { name: 'RedSeg2', y: 1.5, mat: orangeMat },
    { name: 'WhiteSeg2', y: 2.1, mat: whiteMat },
    { name: 'RedSeg3', y: 2.7, mat: orangeMat }
  ];

  segmentsData.forEach((segData) => {
    const seg = new THREE.Mesh(segGeo, segData.mat);
    seg.name = segData.name;
    seg.position.y = segData.y;
    antennaGroup.add(seg);
  });

  // Jarum needle paling atas
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 1.0, 4), silverMat);
  needle.name = 'AntennaNeedle';
  needle.position.y = 3.5;
  antennaGroup.add(needle);

  tower.add(antennaGroup);

  return tower;
}
landmarkGroup.add(makeNamsanTower());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Korea Selatan...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/south_korea.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Korea Selatan diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Korea Selatan:', err);
}
