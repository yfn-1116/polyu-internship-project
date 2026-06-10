import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

const requiredFiles = [
  'src/components/workspace/DigitalHumanWorkspace.tsx',
  'src/components/workspace/PatientDataPanel.tsx',
  'src/components/workspace/BodyModelPanel.tsx',
  'src/components/workspace/MainStage.tsx',
  'src/components/interaction/VoiceDock.tsx',
  'src/components/interaction/StageSubtitle.tsx',
  'src/components/avatar/SMPLXMotionModel.tsx',
  'src/data/motionActions.ts',
]

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) {
    throw new Error(`Missing required workspace module: ${file}`)
  }
}

const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8')
if (!app.includes('DigitalHumanWorkspace')) {
  throw new Error('App.tsx must delegate screen layout to DigitalHumanWorkspace')
}
if (!app.includes('onQuestion={handleQuestion}')) {
  throw new Error('App.tsx must pass the question flow into workspace interaction components')
}

const avatarStage = readFileSync(resolve(root, 'src/components/avatar/AvatarStage.tsx'), 'utf8')
if (!avatarStage.includes("modelMode?: 'doctor' | 'smplx'")) {
  throw new Error('AvatarStage must expose modelMode for doctor and SMPL-X presentation modes')
}

const avatarModel = readFileSync(resolve(root, 'src/components/avatar/AvatarModel.tsx'), 'utf8')
if (!avatarModel.includes('/models/medical_avatar.glb') || !avatarModel.includes('/models/medical_avatar.vrm')) {
  throw new Error('AvatarModel must support external GLB/VRM medical avatar model paths')
}

const motionActions = readFileSync(resolve(root, 'src/data/motionActions.ts'), 'utf8')
for (const action of ['neutral', 'happy', 'relaxed', 'tired', 'angry', 'sad']) {
  if (!motionActions.includes(`sample-mocap-${action}`)) {
    throw new Error(`Motion action manifest must expose sample-mocap-${action}`)
  }
}

const bodyModelPanel = readFileSync(resolve(root, 'src/components/workspace/BodyModelPanel.tsx'), 'utf8')
if (!bodyModelPanel.includes('onActionChange') || !bodyModelPanel.includes('motionActions.map')) {
  throw new Error('BodyModelPanel must render selectable SMPL-X motion actions')
}

const mainStage = readFileSync(resolve(root, 'src/components/workspace/MainStage.tsx'), 'utf8')
if (!mainStage.includes('selectedMotionAction') || !mainStage.includes('basePath={selectedMotionAction.basePath}')) {
  throw new Error('MainStage must wire selected motion action into SMPLXMotionModel basePath')
}

console.log('workspace architecture checks passed')
