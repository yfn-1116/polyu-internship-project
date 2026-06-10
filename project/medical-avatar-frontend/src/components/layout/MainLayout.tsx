import type { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <main className="flex-1 flex overflow-hidden">
      {children}
    </main>
  )
}
