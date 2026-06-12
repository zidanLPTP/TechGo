import fs from 'fs';
import path from 'path';

const glbPath = path.resolve('public/assets/models/australia.glb');
if (!fs.existsSync(glbPath)) {
  console.error('Berkas glb tidak ditemukan di path: ' + glbPath);
  process.exit(1);
}

const buffer = fs.readFileSync(glbPath);

const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);

console.log(`GLB Info: Magic=${magic}, Version=${version}, Length=${length} bytes`);

const chunkLength = buffer.readUInt32LE(12);
const chunkType = buffer.readUInt32LE(16);

if (chunkType !== 0x4E4F534A) { // 'JSON'
  console.error('Chunk pertama bukan JSON!');
  process.exit(1);
}

const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonStr);

console.log('\n--- Struktur Node GLTF ---');
gltf.nodes.forEach((node, idx) => {
  console.log(`Node #${idx}: Name="${node.name || 'unnamed'}"`);
  if (node.translation) console.log(`  Translation: [${node.translation}]`);
  if (node.rotation) console.log(`  Rotation (Quaternion): [${node.rotation}]`);
  if (node.scale) console.log(`  Scale: [${node.scale}]`);
  if (node.matrix) console.log(`  Matrix: [${node.matrix}]`);
  if (node.children) console.log(`  Children: [${node.children}]`);
});
