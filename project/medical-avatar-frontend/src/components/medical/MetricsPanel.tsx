/**
 * MetricsPanel — 体征数据面板（含异常告警）
 */

import { mockVitalSigns } from '../../data/mockMedicalData'

interface MetricDef {
  label: string
  value: string | number
  unit: string
  normal: string
  status: 'normal' | 'warning' | 'danger'
  hint: string
}

function getMetrics(): MetricDef[] {
  const hr = mockVitalSigns.heartRate
  const spo2 = mockVitalSigns.bloodOxygen
  const temp = mockVitalSigns.temperature
  const bp = mockVitalSigns.bloodPressure
  const rr = mockVitalSigns.respiratoryRate

  return [
    {
      label: '心率', value: hr, unit: 'bpm', normal: '60-100',
      status: hr > 100 ? 'danger' : hr > 90 ? 'warning' : 'normal',
      hint: hr > 90 ? '偏高，建议复查' : '正常',
    },
    {
      label: '血氧', value: spo2, unit: '%', normal: '95-100',
      status: spo2 < 92 ? 'danger' : spo2 < 95 ? 'warning' : 'normal',
      hint: spo2 < 95 ? '偏低，关注呼吸' : '正常',
    },
    {
      label: '体温', value: temp, unit: '℃', normal: '36.0-37.3',
      status: temp > 38 ? 'danger' : temp > 37.3 ? 'warning' : 'normal',
      hint: temp > 37.3 ? '低热' : '正常',
    },
    {
      label: '血压', value: bp, unit: 'mmHg', normal: '<140/90',
      status: 'warning', // 148/92 is high
      hint: '偏高（2级高血压）',
    },
    {
      label: '呼吸率', value: rr, unit: '次/分', normal: '12-20',
      status: rr > 24 ? 'danger' : rr > 20 ? 'warning' : 'normal',
      hint: rr > 20 ? '偏快' : '正常',
    },
  ]
}

const statusColors: Record<string, { dot: string; glow: string; bg: string; text: string }> = {
  normal:  { dot: '#00c897', glow: '0 0 6px #00c897', bg: '#00c897/10', text: '#00c897' },
  warning: { dot: '#f5a623', glow: '0 0 6px #f5a623', bg: '#f5a623/10', text: '#f5a623' },
  danger:  { dot: '#ff5252', glow: '0 0 6px #ff5252', bg: '#ff5252/10', text: '#ff5252' },
}

export default function MetricsPanel() {
  const metrics = getMetrics()
  const warningCount = metrics.filter((m) => m.status !== 'normal').length

  return (
    <div className="glass-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bcd4]">Vital Signs</p>
        {warningCount > 0 && (
          <span className="rounded-full bg-[#f5a623]/10 px-2 py-0.5 text-[10px] font-bold text-[#f5a623] border border-[#f5a623]/20">
            {warningCount} 项异常
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => {
          const c = statusColors[m.status]
          return (
            <div
              key={m.label}
              className="rounded-xl border border-[#1e2d45] bg-[#0d1520]/70 p-3 hover:border-[#00bcd4]/20 transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-[#5a6a7a] uppercase tracking-wider">{m.label}</p>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: c.dot, boxShadow: c.glow }}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#e8edf2]">{m.value}</span>
                <span className="text-[10px] text-[#5a6a7a]">{m.unit}</span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed" style={{ color: c.text }}>
                {m.hint}
              </p>
              <p className="text-[9px] text-[#3a4a5a] mt-0.5">参考: {m.normal}</p>
            </div>
          )
        })}
      </div>

      {/* 总体风险标签 */}
      {warningCount > 0 && (
        <div className="mt-3 rounded-xl bg-[#f5a623]/5 border border-[#f5a623]/15 p-2.5 flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <div>
            <p className="text-xs font-bold text-[#f5a623]">需要关注</p>
            <p className="text-[10px] text-[#8899aa]">
              {warningCount >= 3 ? '多项指标偏离正常范围，建议近期就诊复查。' : '部分指标偏离正常，请持续监测。'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
