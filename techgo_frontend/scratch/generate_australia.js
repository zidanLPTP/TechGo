import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Polyfill FileReader untuk lingkungan Node.js
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

// --- Material PBR Khas Gedung Opera Sydney (Dioptimalkan) ---
const podiumMat = new THREE.MeshStandardMaterial({color: 0x767b83, roughness: 0.7, metalness: 0.1}); 
const shellMat  = new THREE.MeshStandardMaterial({
  color: 0xfaf8f2, 
  roughness: 0.25, 
  metalness: 0.05,
  side: THREE.DoubleSide // KRITIKAL: Agar bagian dalam cangkang tidak terlihat bolong/transparan
}); 
const glassMat  = new THREE.MeshStandardMaterial({
  color: 0x2b4c6f, 
  roughness: 0.1, 
  metalness: 0.8,
  transparent: true,
  opacity: 0.75
}); 
const ribsMat = new THREE.MeshStandardMaterial({color: 0x555a62, roughness: 0.6, metalness: 0.2});

const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'AustraliaLandmark';

function makeSydneyOperaHouse() {
  const opera = new THREE.Group();
  opera.name = 'SydneyOperaHouse';

  // 1. PODIUM BERTINGKAT (Dibuat Lebih Masif)
  const lvl1 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.2, 4.2), podiumMat);
  lvl1.position.y = 0.1;
  opera.add(lvl1);

  const lvl2 = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.2, 3.8), podiumMat);
  lvl2.position.y = 0.3;
  opera.add(lvl2);

  // Tangga Utama Besar (Ikonik di bagian depan/X+)
  const stepCount = 5;
  for (let i = 0; i < stepCount; i++) {
    const w = 2.0;
    const h = 0.08;
    const d = 0.15;
    const step = new THREE.Mesh(new THREE.BoxGeometry(d, h * (stepCount - i), w), podiumMat);
    step.position.set(2.45 + (i * d), (h * (stepCount - i)) / 2, 0);
    opera.add(step);
  }

  // 2. STRUKTUR DINDING/FONDASI UTAMA HALL (Penutup Kekosongan Bawah)
  // Ini adalah trik utama seperti model Finlandia agar bangunan terlihat berbobot
  const concertHallBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 1.3), podiumMat);
  concertHallBase.position.set(-0.2, 0.7, 0.65);
  opera.add(concertHallBase);

  const theatreBase = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.6, 1.2), podiumMat);
  theatreBase.position.set(-0.1, 0.7, -0.65);
  opera.add(theatreBase);

  // 3. PABRIKASI CANGKANG DENGAN DINDING KACA BERISI (Sails + Glass Walls)
  function createSolidSail(radius, height, px, py, pz, rotY, scaleZ) {
    const sailGroup = new THREE.Group();

    // Cangkang Utama (Layar)
    const shellGeo = new THREE.ConeGeometry(radius, height, 4, 1, true, 0, Math.PI / 1.5);
    shellGeo.rotateX(Math.PI / 2); // Rebahkan cone agar melengkung ke depan
    shellGeo.rotateZ(Math.PI / 2);
    
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.scale.set(1, 1, scaleZ); // Atur ketebalan lateral layar
    sailGroup.add(shell);

    // DINDING KACA PENGISI (Membuat cangkang terasa padat/berisi dari depan)
    const glassGeo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 0.05, 16, 1, false, 0, Math.PI / 1.5);
    glassGeo.rotateX(Math.PI / 2);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 0, -0.02);
    glass.scale.set(1, 1, scaleZ);
    sailGroup.add(glass);

    // Struktur Tulang Kaca (Mullions/Ribs) untuk detail Neoklasik/Modern
    const ribGeo = new THREE.BoxGeometry(radius * 1.8, 0.04, 0.06);
    const rib = new THREE.Mesh(ribGeo, ribsMat);
    rib.position.set(0, -radius * 0.2, 0.01);
    sailGroup.add(rib);

    // Transformasi posisi grup komponen layar
    sailGroup.position.set(px, py, pz);
    sailGroup.rotation.y = rotY;

    return sailGroup;
  }

  // A. CONCERT HALL SAILS (Z+ Side) - Susunan Layar Utama Besar
  const ch1 = createSolidSail(1.1, 1.8, -0.9, 1.2, 0.65, -0.1, 0.6);
  const ch2 = createSolidSail(0.9, 1.4, -0.2, 1.2, 0.65, -0.1, 0.55);
  const ch3 = createSolidSail(0.7, 1.0, 0.4, 1.1, 0.65, -0.1, 0.5);
  const ch4 = createSolidSail(0.5, 0.7, 0.9, 0.9, 0.65, -0.1, 0.45);
  opera.add(ch1, ch2, ch3, ch4);

  // B. THEATRE SAILS (Z- Side) - Susunan Layar Kedua Sedang
  const th1 = createSolidSail(1.0, 1.6, -0.8, 1.15, -0.65, 0.1, 0.55);
  const th2 = createSolidSail(0.8, 1.3, -0.1, 1.15, -0.65, 0.1, 0.5);
  const th3 = createSolidSail(0.6, 0.9, 0.4, 1.05, -0.65, 0.1, 0.45);
  const th4 = createSolidSail(0.4, 0.6, 0.8, 0.85, -0.65, 0.1, 0.4);
  opera.add(th1, th2, th3, th4);

  // C. BENNELONG RESTAURANT SAILS (Sisi Kecil di ujung belakang samping)
  const res1 = createSolidSail(0.5, 0.7, 0.2, 0.8, -1.3, 0.3, 0.4);
  const res2 = createSolidSail(0.4, 0.5, 0.6, 0.75, -1.25, 0.3, 0.35);
  opera.add(res1, res2);

  // --- NORMALISASI ELEMENT AGAR BERDIRI SEMPURNA DI Y = 0 ---
  const box = new THREE.Box3().setFromObject(opera);
  const minY = box.min.y;
  opera.children.forEach(child => {
    child.position.y -= minY;
  });

  // Optimasi ukuran file biner GLB
  opera.traverse(child => {
    if (child.isMesh && child.geometry) {
      child.geometry.deleteAttribute('uv');
    }
  });

  return opera;
}

landmarkGroup.add(makeSydneyOperaHouse());

// --- Ekspor Proses GLB ---
const exporter = new GLTFExporter();
try {
  console.log('Memproses pembuatan model 3D Sydney Opera House yang berbobot...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/australia.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Australia diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D:', err);
}