import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const requiredSamples = [
  ['sample-thuman', 1000, 1000],
  ['sample-smplx-default', 1000, 1000],
  ['sample-smplx-slim', 1000, 1000],
  ['sample-smplx-broad', 1000, 1000],
  ['sample-smplx-tall', 1000, 1000],
];

for (const [sampleName, minVertices, minFaces] of requiredSamples) {
  const manifestPath = path.join(root, 'public', sampleName, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`missing manifest: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const meshPath = manifest.result?.output_paths?.mesh;

  if (typeof meshPath !== 'string') {
    throw new Error(`${sampleName}: manifest.result.output_paths.mesh must be a string`);
  }

  const fileSystemMeshPath = path.join(root, 'public', meshPath.replace(/^\//, ''));

  if (!fs.existsSync(fileSystemMeshPath)) {
    throw new Error(`missing mesh: ${fileSystemMeshPath}`);
  }

  const meshText = fs.readFileSync(fileSystemMeshPath, 'utf8');
  const vertexCount = meshText.split('\n').filter((line) => line.startsWith('v ')).length;
  const faceCount = meshText.split('\n').filter((line) => line.startsWith('f ')).length;

  if (vertexCount < minVertices) {
    throw new Error(`${sampleName}: expected at least ${minVertices} vertices, got ${vertexCount}`);
  }

  if (faceCount < minFaces) {
    throw new Error(`${sampleName}: expected at least ${minFaces} faces, got ${faceCount}`);
  }

  console.log(`${sampleName} verified: ${vertexCount} vertices, ${faceCount} faces`);
}
