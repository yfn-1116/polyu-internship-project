import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const sampleSourceDir = path.join(
  repoRoot,
  'data',
  'datasets',
  'raw',
  'thuman2',
  'THuman2.0-Dataset',
  'data_sample',
  '0525',
);
const sourceObj = path.join(sampleSourceDir, '0525.obj');
const sourceMaterial = path.join(sampleSourceDir, 'material0.mtl');
const sourceTexture = path.join(sampleSourceDir, 'material0.jpeg');
const publicSampleDir = path.join(process.cwd(), 'public', 'sample-thuman');

if (!fs.existsSync(sourceObj)) {
  throw new Error(`missing THuman sample OBJ: ${sourceObj}`);
}

fs.mkdirSync(publicSampleDir, { recursive: true });
fs.copyFileSync(sourceObj, path.join(publicSampleDir, 'body.obj'));

if (fs.existsSync(sourceMaterial)) {
  fs.copyFileSync(sourceMaterial, path.join(publicSampleDir, 'material0.mtl'));
}

if (fs.existsSync(sourceTexture)) {
  fs.copyFileSync(sourceTexture, path.join(publicSampleDir, 'material0.jpeg'));
}

const manifest = {
  task_id: 'job_thuman_sample_0525',
  body_input_source: 'dataset-obj',
  result: {
    task_id: 'job_thuman_sample_0525',
    model_type: 'dataset-obj-passthrough',
    status: 'success',
    output_paths: {
      mesh: '/sample-thuman/body.obj',
      manifest: '/sample-thuman/manifest.json',
    },
    errors: [],
  },
};

fs.writeFileSync(
  path.join(publicSampleDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`prepared THuman sample at ${publicSampleDir}`);
