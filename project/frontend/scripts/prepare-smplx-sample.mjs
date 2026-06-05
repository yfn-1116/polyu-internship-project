import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const outputDir = path.join(repoRoot, 'outputs', 'smplx_default_neutral');
const sourceObj = path.join(outputDir, 'body.obj');
const publicSampleDir = path.join(process.cwd(), 'public', 'sample-smplx');

if (!fs.existsSync(sourceObj)) {
  throw new Error(`missing SMPL-X OBJ: ${sourceObj}`);
}

fs.mkdirSync(publicSampleDir, { recursive: true });
fs.copyFileSync(sourceObj, path.join(publicSampleDir, 'body.obj'));

const manifest = {
  task_id: 'job_smplx_default_neutral',
  body_input_source: 'smplx-default',
  result: {
    task_id: 'job_smplx_default_neutral',
    model_type: 'smplx-neutral',
    status: 'success',
    output_paths: {
      mesh: '/sample-smplx/body.obj',
      manifest: '/sample-smplx/manifest.json',
    },
    errors: [],
  },
};

fs.writeFileSync(
  path.join(publicSampleDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`prepared SMPL-X sample at ${publicSampleDir}`);
