import type { ReactNode } from 'react'
import type { AvatarState } from '../../types/digitalHuman'
import MedicalPanel from '../medical/MedicalPanel'
import PatientDataPanel from './PatientDataPanel'
import MainStage from './MainStage'

interface DigitalHumanWorkspaceProps {
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
  header: ReactNode
}

export default function DigitalHumanWorkspace(props: DigitalHumanWorkspaceProps) {
  return (
    <div className="medical-gradient h-screen w-screen overflow-hidden p-5 text-[#102A43]">
      <div className="flex h-full flex-col gap-4">
        {props.header}
        <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_400px] gap-4 max-[1180px]:grid-cols-[260px_minmax(0,1fr)]">
          <PatientDataPanel />
          <MainStage
            state={props.state}
            subtitle={props.subtitle}
            inputText={props.inputText}
            isRecording={props.isRecording}
            isProcessing={props.isProcessing}
            showInput={props.showInput}
            inputRef={props.inputRef}
            onInputChange={props.onInputChange}
            onSubmit={props.onSubmit}
            onRecordToggle={props.onRecordToggle}
            onShowInput={props.onShowInput}
            onQuestion={props.onQuestion}
          />
          <MedicalPanel />
        </div>
      </div>
    </div>
  )
}
