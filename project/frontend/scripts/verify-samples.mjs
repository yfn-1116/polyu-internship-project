import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sampleName = fs.existsSync(path.join(root, 'public', 'sample-thuman', 'manifest.json'))
  ? 'sample-thuman'
  : 'sample-human';
const manifestPath = path.join(root, 'public', sampleName, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  throw new Error(`missing manifest: ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const meshPath = manifest.result?.output_paths?.mesh;

if (typeof meshPath !== 'string') {
  throw new Error('manifest.result.output_paths.mesh must be a string');
}

const fileSystemMeshPath = path.join(root, 'public', meshPath.replace(/^\//, ''));

if (!fs.existsSync(fileSystemMeshPath)) {
  throw new Error(`missing mesh: ${fileSystemMeshPath}`);
}

const meshText = fs.readFileSync(fileSystemMeshPath, 'utf8');
const vertexCount = meshText.split('\n').filter((line) => line.startsWith('v ')).length;
const faceCount = meshText.split('\n').filter((line) => line.startsWith('f ')).length;

if (vertexCount < 20) {
  throw new Error(`expected at least 20 vertices, got ${vertexCount}`);
}

if (faceCount < 20) {
  throw new Error(`expected at least 20 faces, got ${faceCount}`);
}

console.log(`${sampleName} verified: ${vertexCount} vertices, ${faceCount} faces`);
