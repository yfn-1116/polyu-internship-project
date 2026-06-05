import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const variants = ['neutral', 'male', 'female'];

for (const gender of variants) {
  const outputDir = path.join(repoRoot, 'outputs', `smplx_default_${gender}`);
  const sourceObj = path.join(outputDir, 'body.obj');
  const sampleName = `sample-smplx-${gender}`;
  const publicSampleDir = path.join(process.cwd(), 'public', sampleName);

  if (!fs.existsSync(sourceObj)) {
    throw new Error(`missing SMPL-X OBJ: ${sourceObj}`);
  }

  fs.mkdirSync(publicSampleDir, { recursive: true });
  fs.copyFileSync(sourceObj, path.join(publicSampleDir, 'body.obj'));

  const manifest = {
    task_id: `job_smplx_default_${gender}`,
    body_input_source: 'smplx-default',
    result: {
      task_id: `job_smplx_default_${gender}`,
      model_type: `smplx-${gender}`,
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

  console.log(`prepared SMPL-X ${gender} sample at ${publicSampleDir}`);
}
