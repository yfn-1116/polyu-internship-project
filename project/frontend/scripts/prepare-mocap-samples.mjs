import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(process.cwd(), '..', '..');
const mocapOutputBase = path.join(repoRoot, 'outputs', 'mocap_all');

// 13 emotions, prefer v1, fallback to v2
const emotions = [
  'Afraid', 'Angry', 'Annoyed', 'Bored', 'Excited',
  'Happy', 'Miserable', 'Neutral', 'Pleased', 'Relaxed',
  'Sad', 'Satisfied', 'Tired',
];

for (const emotion of emotions) {
  let version = 'v1';
  let sourceDir = path.join(mocapOutputBase, `mocap_${emotion}_${version}`);
  if (!fs.existsSync(sourceDir)) {
    version = 'v2';
    sourceDir = path.join(mocapOutputBase, `mocap_${emotion}_${version}`);
  }
  if (!fs.existsSync(sourceDir)) {
    console.warn(`skipping ${emotion}: no v1 or v2 output found`);
    continue;
  }

  const sampleName = `sample-mocap-${emotion.toLowerCase()}`;
  const publicDir = path.join(process.cwd(), 'public', sampleName);

  const facesObj = path.join(sourceDir, 'faces.obj');
  const verticesBin = path.join(sourceDir, 'vertices.bin');
  const animMeta = path.join(sourceDir, 'animation_meta.json');

  if (!fs.existsSync(facesObj) || !fs.existsSync(verticesBin)) {
    throw new Error(`missing MoCap output for ${emotion}: ${sourceDir}`);
  }

  fs.mkdirSync(publicDir, { recursive: true });
  fs.copyFileSync(facesObj, path.join(publicDir, 'faces.obj'));
  fs.copyFileSync(verticesBin, path.join(publicDir, 'vertices.bin'));
  fs.copyFileSync(animMeta, path.join(publicDir, 'animation_meta.json'));

  const meta = JSON.parse(fs.readFileSync(animMeta, 'utf8'));
  const manifest = {
    task_id: `job_mocap_${emotion}_${version}`,
    body_input_source: 'mocap-npz',
    result: {
      task_id: `job_mocap_${emotion}_${version}`,
      model_type: 'smplx',
      status: 'success',
      output_paths: {
        mesh: `/${sampleName}/faces.obj`,
        manifest: `/${sampleName}/manifest.json`,
      },
      errors: [],
      animation: meta,
    },
  };

  fs.writeFileSync(
    path.join(publicDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`prepared MoCap ${emotion} ${version}: ${meta.frame_count} frames, ${meta.duration_seconds}s`);
}
