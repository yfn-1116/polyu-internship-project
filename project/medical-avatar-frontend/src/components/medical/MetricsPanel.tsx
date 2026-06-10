/**
 * MetricsPanel — 体征数据面板（暗色科技风）
 */

import { mockVitalSigns } from '../../data/mockMedicalData'

const METRICS = [
  { label: '心率', value: `${mockVitalSigns.heartRate}`, unit: 'bpm', color: '#ff5252' },
  { label: '血氧', value: `${mockVitalSigns.bloodOxygen}`, unit: '%', color: '#00bcd4' },
  { label: '体温', value: `${mockVitalSigns.temperature}`, unit: '℃', color: '#f5a623' },
  { label: '血压', value: mockVitalSigns.bloodPressure, unit: 'mmHg', color: '#00c897' },
  { label: '呼吸率', value: `${mockVitalSigns.respiratoryRate}`, unit: '次/分', color: '#a78bfa' },
]

export default function MetricsPanel() {
  return (
    <div className="glass-card">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bcd4]">Vital Signs</p>
      <div className="grid grid-cols-2 gap-2">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-[#1e2d45] bg-[#0d1520]/70 p-3 hover:border-[#00bcd4]/30 transition-colors duration-200"
          >
            <p className="text-[10px] font-semibold text-[#5a6a7a] uppercase tracking-wider">{m.label}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#e8edf2]" style={{ color: m.color }}>
                {m.value}
              </span>
              <span className="text-[10px] text-[#5a6a7a]">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
