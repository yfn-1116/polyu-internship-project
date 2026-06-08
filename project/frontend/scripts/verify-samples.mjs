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

const mocapSamples = ['sample-mocap-happy', 'sample-mocap-angry', 'sample-mocap-sad', 'sample-mocap-neutral'];

for (const sampleName of mocapSamples) {
  const manifestPath = path.join(root, 'public', sampleName, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`missing MoCap manifest: ${manifestPath}`);
  }

  const facesObjPath = path.join(root, 'public', sampleName, 'faces.obj');
  const verticesBinPath = path.join(root, 'public', sampleName, 'vertices.bin');
  const metaPath = path.join(root, 'public', sampleName, 'animation_meta.json');

  if (!fs.existsSync(facesObjPath)) throw new Error(`missing ${sampleName}/faces.obj`);
  if (!fs.existsSync(verticesBinPath)) throw new Error(`missing ${sampleName}/vertices.bin`);
  if (!fs.existsSync(metaPath)) throw new Error(`missing ${sampleName}/animation_meta.json`);

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const binSize = fs.statSync(verticesBinPath).size;
  const expectedSize = meta.frame_count * meta.vertices_count * 3 * 4;

  if (binSize !== expectedSize) {
    throw new Error(`${sampleName}: vertices.bin size mismatch: ${binSize} != ${expectedSize}`);
  }

  console.log(`${sampleName} verified: ${meta.frame_count} frames, ${meta.duration_seconds}s, ${meta.emotion}`);
}
