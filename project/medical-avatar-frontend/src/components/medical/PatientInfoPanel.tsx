/**
 * PatientInfoPanel — 患者信息面板（暗色科技风）
 */

import { mockPatient } from '../../data/mockMedicalData'

export default function PatientInfoPanel() {
  return (
    <div className="glass-card glass-card-glow">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bcd4]">Patient</p>
        <span className="rounded-full bg-[#00bcd4]/10 px-2 py-0.5 text-[10px] font-bold text-[#00bcd4] border border-[#00bcd4]/20">
          Demo
        </span>
      </div>

      <h3 className="text-xl font-bold text-[#e8edf2]">{mockPatient.name}</h3>
      <div className="mt-2 flex items-center gap-3 text-sm text-[#8899aa]">
        <span>{mockPatient.gender}</span>
        <span className="text-[#3a4a5a]">|</span>
        <span>{mockPatient.age} 岁</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: '#00c897', boxShadow: '0 0 6px #00c897' }}
        />
        <span className="text-xs font-semibold text-[#00c897]">{mockPatient.status}</span>
        <span className="ml-auto rounded-full bg-[#f5a623]/10 px-2 py-0.5 text-[10px] font-bold text-[#f5a623] border border-[#f5a623]/20">
          {mockPatient.riskLevel}
        </span>
      </div>
    </div>
  )
}
