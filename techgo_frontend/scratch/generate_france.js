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

// --- Material PBR Khas Menara Eiffel ---
const ironMat = new THREE.MeshStandardMaterial({color: 0x5a626f, roughness: 0.65, metalness: 0.55}); // Besi abu-abu baja hangat
const goldMat = new THREE.MeshStandardMaterial({color: 0xffea75, metalness: 0.8, roughness: 0.1}); // Mercusuar emas menyala

// --- Group Utama Landmark (Target Ekspor GLB - Murni Tanpa Alas) ---
const landmarkGroup = new THREE.Group();
landmarkGroup.name = 'FranceLandmark';

// --- Pembuat Menara Eiffel Low-Poly Detail ---
function makeEiffelTower() {
  const eiffel = new THREE.Group();
  eiffel.name = 'EiffelTower';

  // 1. KAKI-KAKI TIER 1 (Legs - 4 Kolom Miring ke Dalam)
  const legGeo = new THREE.BoxGeometry(0.35, 3.8, 0.35);
  const legAngleX = 0.28;
  const legAngleZ = 0.28;
  
  // Leg 1 (Utara-Timur)
  const leg1 = new THREE.Mesh(legGeo, ironMat);
  leg1.name = 'Leg_NE';
  leg1.position.set(1.05, 1.8, 1.05);
  leg1.rotation.set(-legAngleX, 0, legAngleZ);
  eiffel.add(leg1);

  // Leg 2 (Selatan-Timur)
  const leg2 = new THREE.Mesh(legGeo, ironMat);
  leg2.name = 'Leg_SE';
  leg2.position.set(1.05, 1.8, -1.05);
  leg2.rotation.set(legAngleX, 0, legAngleZ);
  eiffel.add(leg2);

  // Leg 3 (Utara-Barat)
  const leg3 = new THREE.Mesh(legGeo, ironMat);
  leg3.name = 'Leg_NW';
  leg3.position.set(-1.05, 1.8, 1.05);
  leg3.rotation.set(-legAngleX, 0, -legAngleZ);
  eiffel.add(leg3);

  // Leg 4 (Selatan-Barat)
  const leg4 = new THREE.Mesh(legGeo, ironMat);
  leg4.name = 'Leg_SW';
  leg4.position.set(-1.05, 1.8, -1.05);
  leg4.rotation.set(legAngleX, 0, -legAngleZ);
  eiffel.add(leg4);

  // --- DETAIL KISI BESI (X-BRACING) TIER 1 ---
  const braceGeo1 = new THREE.BoxGeometry(0.06, 3.8, 0.06);
  const rotAngle1 = 0.52; // kemiringan silang

  // Sisi Utara (North Face, z = 1.05)
  const bN1 = new THREE.Mesh(braceGeo1, ironMat);
  bN1.position.set(0, 1.7, 1.05);
  bN1.rotation.z = rotAngle1;
  eiffel.add(bN1);

  const bN2 = new THREE.Mesh(braceGeo1, ironMat);
  bN2.position.set(0, 1.7, 1.05);
  bN2.rotation.z = -rotAngle1;
  eiffel.add(bN2);

  // Sisi Selatan (South Face, z = -1.05)
  const bS1 = new THREE.Mesh(braceGeo1, ironMat);
  bS1.position.set(0, 1.7, -1.05);
  bS1.rotation.z = rotAngle1;
  eiffel.add(bS1);

  const bS2 = new THREE.Mesh(braceGeo1, ironMat);
  bS2.position.set(0, 1.7, -1.05);
  bS2.rotation.z = -rotAngle1;
  eiffel.add(bS2);

  // Sisi Timur (East Face, x = 1.05)
  const bE1 = new THREE.Mesh(braceGeo1, ironMat);
  bE1.position.set(1.05, 1.7, 0);
  bE1.rotation.x = rotAngle1;
  eiffel.add(bE1);

  const bE2 = new THREE.Mesh(braceGeo1, ironMat);
  bE2.position.set(1.05, 1.7, 0);
  bE2.rotation.x = -rotAngle1;
  eiffel.add(bE2);

  // Sisi Barat (West Face, x = -1.05)
  const bW1 = new THREE.Mesh(braceGeo1, ironMat);
  bW1.position.set(-1.05, 1.7, 0);
  bW1.rotation.x = rotAngle1;
  eiffel.add(bW1);

  const bW2 = new THREE.Mesh(braceGeo1, ironMat);
  bW2.position.set(-1.05, 1.7, 0);
  bW2.rotation.x = -rotAngle1;
  eiffel.add(bW2);

  // 2. LENGKUNGAN DEKORATIF (Decorative Arches)
  const archRadius = 0.95;
  const archGeo = new THREE.TorusGeometry(archRadius, 0.08, 4, 12, Math.PI);
  archGeo.rotateZ(Math.PI);

  // Lengkungan N, S, E, W
  const archN = new THREE.Mesh(archGeo, ironMat);
  archN.position.set(0, 1.8, 1.05);
  eiffel.add(archN);

  const archS = new THREE.Mesh(archGeo, ironMat);
  archS.position.set(0, 1.8, -1.05);
  eiffel.add(archS);

  const archE = new THREE.Mesh(archGeo, ironMat);
  archE.position.set(1.05, 1.8, 0);
  archE.rotation.y = Math.PI / 2;
  eiffel.add(archE);

  const archW = new THREE.Mesh(archGeo, ironMat);
  archW.position.set(-1.05, 1.8, 0);
  archW.rotation.y = Math.PI / 2;
  eiffel.add(archW);

  // 3. PLATFORM UTAMA TINGKAT 1 (First Platform)
  const plat1 = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 2.35), ironMat);
  plat1.name = 'Platform_1';
  plat1.position.set(0, 3.4, 0);
  eiffel.add(plat1);

  // Pagar keliling platform 1
  const rail1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 2.4), ironMat);
  rail1.position.set(0, 3.52, 0);
  eiffel.add(rail1);

  // 4. KOLOM TIER 2 (Middle Section Columns)
  const midLegGeo = new THREE.BoxGeometry(0.24, 3.1, 0.24);
  const midAngleX = 0.14;
  const midAngleZ = 0.14;

  // Col 1
  const col1 = new THREE.Mesh(midLegGeo, ironMat);
  col1.name = 'Col_NE';
  col1.position.set(0.62, 5.0, 0.62);
  col1.rotation.set(-midAngleX, 0, midAngleZ);
  eiffel.add(col1);

  // Col 2
  const col2 = new THREE.Mesh(midLegGeo, ironMat);
  col2.name = 'Col_SE';
  col2.position.set(0.62, 5.0, -0.62);
  col2.rotation.set(midAngleX, 0, midAngleZ);
  eiffel.add(col2);

  // Col 3
  const col3 = new THREE.Mesh(midLegGeo, ironMat);
  col3.name = 'Col_NW';
  col3.position.set(-0.62, 5.0, 0.62);
  col3.rotation.set(-midAngleX, 0, -midAngleZ);
  eiffel.add(col3);

  // Col 4
  const col4 = new THREE.Mesh(midLegGeo, ironMat);
  col4.name = 'Col_SW';
  col4.position.set(-0.62, 5.0, -0.62);
  col4.rotation.set(midAngleX, 0, -midAngleZ);
  eiffel.add(col4);

  // --- DETAIL KISI BESI (X-BRACING) TIER 2 ---
  const braceGeo2 = new THREE.BoxGeometry(0.04, 3.0, 0.04);
  const rotAngle2 = 0.35;

  // Sisi Utara (z = 0.62)
  const bN2_1 = new THREE.Mesh(braceGeo2, ironMat);
  bN2_1.position.set(0, 5.0, 0.62);
  bN2_1.rotation.z = rotAngle2;
  eiffel.add(bN2_1);

  const bN2_2 = new THREE.Mesh(braceGeo2, ironMat);
  bN2_2.position.set(0, 5.0, 0.62);
  bN2_2.rotation.z = -rotAngle2;
  eiffel.add(bN2_2);

  // Sisi Selatan (z = -0.62)
  const bS2_1 = new THREE.Mesh(braceGeo2, ironMat);
  bS2_1.position.set(0, 5.0, -0.62);
  bS2_1.rotation.z = rotAngle2;
  eiffel.add(bS2_1);

  const bS2_2 = new THREE.Mesh(braceGeo2, ironMat);
  bS2_2.position.set(0, 5.0, -0.62);
  bS2_2.rotation.z = -rotAngle2;
  eiffel.add(bS2_2);

  // Sisi Timur (x = 0.62)
  const bE2_1 = new THREE.Mesh(braceGeo2, ironMat);
  bE2_1.position.set(0.62, 5.0, 0);
  bE2_1.rotation.x = rotAngle2;
  eiffel.add(bE2_1);

  const bE2_2 = new THREE.Mesh(braceGeo2, ironMat);
  bE2_2.position.set(0.62, 5.0, 0);
  bE2_2.rotation.x = -rotAngle2;
  eiffel.add(bE2_2);

  // Sisi Barat (x = -0.62)
  const bW2_1 = new THREE.Mesh(braceGeo2, ironMat);
  bW2_1.position.set(-0.62, 5.0, 0);
  bW2_1.rotation.x = rotAngle2;
  eiffel.add(bW2_1);

  const bW2_2 = new THREE.Mesh(braceGeo2, ironMat);
  bW2_2.position.set(-0.62, 5.0, 0);
  bW2_2.rotation.x = -rotAngle2;
  eiffel.add(bW2_2);

  // 5. PLATFORM TINGKAT 2 (Second Platform)
  const plat2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 1.4), ironMat);
  plat2.name = 'Platform_2';
  plat2.position.set(0, 6.45, 0);
  eiffel.add(plat2);

  const rail2 = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.08, 1.44), ironMat);
  rail2.position.set(0, 6.55, 0);
  eiffel.add(rail2);

  // 6. MENARA ATAS TIER 3 (Upper Tapering Tower)
  const spireHeight = 4.8;
  const upperTowerGeo = new THREE.ConeGeometry(0.64, spireHeight, 4);
  upperTowerGeo.rotateY(Math.PI / 4); // Sejajarkan sisinya
  const upperTower = new THREE.Mesh(upperTowerGeo, ironMat);
  upperTower.name = 'UpperTower';
  upperTower.position.set(0, 6.54 + spireHeight/2, 0); // y = 8.94
  eiffel.add(upperTower);

  // Sabuk ornamen penopang tengah atas
  const ringMid = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.72), ironMat);
  ringMid.position.set(0, 8.8, 0);
  eiffel.add(ringMid);

  // 7. DEK OBSERVASI PUNCAK (Third Platform / Dome)
  const topDome = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.4, 8), ironMat);
  topDome.name = 'TopDome';
  topDome.position.set(0, 11.45, 0);
  eiffel.add(topDome);

  // Kubah kecil penutup
  const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8, 0, Math.PI*2, 0, Math.PI/2), ironMat);
  topCap.position.set(0, 11.65, 0);
  eiffel.add(topCap);

  // 8. JARUM ANTENA & SUAR MERDEKA (Antenna & Beacon)
  const antennaGeo = new THREE.CylinderGeometry(0.02, 0.06, 1.5, 4);
  const antenna = new THREE.Mesh(antennaGeo, ironMat);
  antenna.name = 'Antenna';
  antenna.position.set(0, 12.4, 0);
  eiffel.add(antenna);

  // Lampu suar mercusuar kuning emas paling atas
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), goldMat);
  beacon.name = 'BeaconLight';
  beacon.position.set(0, 13.195, 0);
  eiffel.add(beacon);

  return eiffel;
}
landmarkGroup.add(makeEiffelTower());

// --- Ekspor Model ke GLB via parseAsync ---
const exporter = new GLTFExporter();
try {
  console.log('Mulai memproses ekspor model 3D Prancis...');
  const glb = await exporter.parseAsync(landmarkGroup, { binary: true });
  const buffer = Buffer.from(glb);
  const destPath = path.resolve('techgo_frontend/public/assets/models/france.glb');
  
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  console.log('Sukses! Model biner 3D Prancis diekspor ke:', destPath);
  console.log('Ukuran berkas:', (buffer.length / 1024).toFixed(2), 'KB');
} catch (err) {
  console.error('Error saat ekspor model 3D Prancis:', err);
}
