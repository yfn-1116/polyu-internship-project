import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const variants = [
  ['default', 'SMPL-X Default'],
  ['slim', 'SMPL-X Slim'],
  ['broad', 'SMPL-X Broad'],
  ['tall', 'SMPL-X Tall'],
];

for (const [preset, label] of variants) {
  const outputDir = path.join(repoRoot, 'outputs', `smplx_preset_${preset}`);
  const sourceObj = path.join(outputDir, 'body.obj');
  const sampleName = `sample-smplx-${preset}`;
  const publicSampleDir = path.join(process.cwd(), 'public', sampleName);

  if (!fs.existsSync(sourceObj)) {
    throw new Error(`missing SMPL-X OBJ: ${sourceObj}`);
  }

  fs.mkdirSync(publicSampleDir, { recursive: true });
  fs.copyFileSync(sourceObj, path.join(publicSampleDir, 'body.obj'));

  const manifest = {
    task_id: `job_smplx_preset_${preset}`,
    body_input_source: 'smplx-default',
    result: {
      task_id: `job_smplx_preset_${preset}`,
      model_type: label,
      status: 'success',
      output_paths: {
        mesh: `/${sampleName}/body.obj`,
        manifest: `/${sampleName}/manifest.json`,
      },
      errors: [],
    },
  };

  fs.writeFileSync(
    path.join(publicSampleDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`prepared ${label} sample at ${publicSampleDir}`);
}
