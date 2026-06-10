import type { AvatarState } from '../../types/digitalHuman'
import StatusBadge from '../ui/StatusBadge'
import StageSubtitle from '../interaction/StageSubtitle'
import VoiceDock from '../interaction/VoiceDock'
import BodyModelPanel from './BodyModelPanel'
import SMPLXMotionModel from '../avatar/SMPLXMotionModel'
import AvatarLights from '../avatar/AvatarLights'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { defaultMotionAction, type MotionAction } from '../../data/motionActions'

interface MainStageProps {
  state: AvatarState
  subtitle: string
  inputText: string
  isRecording: boolean
  isProcessing: boolean
  showInput: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onInputChange: (value: string) => void
  onSubmit: () => void
  onRecordToggle: () => void
  onShowInput: () => void
  onQuestion: (text: string) => void
}

export default function MainStage(props: MainStageProps) {
  const [selectedMotionAction, setSelectedMotionAction] = useState(defaultMotionAction)
  const [motionPlaying, setMotionPlaying] = useState(true)
  const [motionSpeed, setMotionSpeed] = useState(1)
  const [motionRotationY, setMotionRotationY] = useState(0)
  const [motionResetToken, setMotionResetToken] = useState(0)
  const [motionFrameInfo, setMotionFrameInfo] = useState({ frame: 0, total: 0 })

  function handleMotionActionChange(action: MotionAction) {
    setSelectedMotionAction(action)
    setMotionResetToken((value) => value + 1)
    setMotionPlaying(true)
  }

  return (
    <main className="relative min-w-0 flex-1 overflow-hidden rounded-[28px] border border-[#CFE3F5] bg-white/42 shadow-2xl shadow-[#1E88E5]/10 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(79,195,247,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.52),rgba(234,247,255,0.38))]" />
      <div className="pointer-events-none absolute inset-x-10 top-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1E88E5]">SMPL-X Patient Model</p>
          <p className="mt-1 text-sm font-semibold text-[#627D98]">病人体态建模缓存 / 本地 3D 渲染</p>
        </div>
        <StatusBadge state={props.state} />
      </div>

      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0.86, 5.05], fov: 29, near: 0.1, far: 100 }} style={{ background: 'transparent' }} shadows>
          <AvatarLights />
          <SMPLXMotionModel
            basePath={selectedMotionAction.basePath}
            playing={motionPlaying}
            speed={motionSpeed}
            rotationY={motionRotationY}
            targetHeight={1.26}
            resetToken={motionResetToken}
            onFrame={(frame, total) => setMotionFrameInfo({ frame, total })}
          />
          <mesh position={[0, 0.02, -0.34]}>
            <circleGeometry args={[0.82, 96]} />
            <meshBasicMaterial color="#4FC3F7" transparent opacity={0.13} side={2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
            <ringGeometry args={[0.34, 0.52, 96]} />
            <meshBasicMaterial color="#1E88E5" transparent opacity={0.2} side={2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.951, 0]}>
            <circleGeometry args={[0.34, 96]} />
            <meshBasicMaterial color="#EAF7FF" transparent opacity={0.72} side={2} />
          </mesh>
          <gridHelper args={[3, 14, '#d9eaf7', '#f3f9fe']} position={[0, -0.96, 0]} />
        </Canvas>
      </div>

      <BodyModelPanel
        state={props.state}
        selectedAction={selectedMotionAction}
        playing={motionPlaying}
        speed={motionSpeed}
        rotationY={motionRotationY}
        frameInfo={motionFrameInfo}
        onActionChange={handleMotionActionChange}
        onPlayingChange={setMotionPlaying}
        onSpeedChange={setMotionSpeed}
        onRotationChange={setMotionRotationY}
        onReplay={() => { setMotionResetToken((v) => v + 1); setMotionPlaying(true) }}
      />

      <div className="pointer-events-none absolute inset-x-8 bottom-[148px] z-10">
        <StageSubtitle state={props.state} subtitle={props.subtitle} />
      </div>

      <div className="absolute inset-x-8 bottom-7 z-20 flex justify-center">
        <VoiceDock {...props} />
      </div>
    </main>
  )
}
