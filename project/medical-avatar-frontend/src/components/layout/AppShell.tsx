import type { ReactNode } from 'react'

interface AppShellProps {
  header: ReactNode
  children: ReactNode
  subtitleBar: ReactNode
  voiceControl: ReactNode
}

export default function AppShell({ header, children, subtitleBar, voiceControl }: AppShellProps) {
  return (
    <div className="medical-gradient h-full flex flex-col">
      {header}
      {children}
      <div className="shrink-0 border-t border-[#E0ECF8]/60">
        {subtitleBar}
        {voiceControl}
      </div>
    </div>
  )
}
