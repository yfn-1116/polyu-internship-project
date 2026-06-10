const mockVitals = [
  { label: '年龄', value: '75 岁' },
  { label: 'BMI', value: '24.2' },
  { label: '血压', value: '142/86' },
  { label: '空腹血糖', value: '7.1 mmol/L' },
]

const mockHistory = ['高血压病史', '2 型糖尿病风险', '近期晨起头晕']

export default function PatientDataPanel() {
  return (
    <aside className="min-h-0 rounded-[24px] border border-[#CFE3F5] bg-white/72 p-4 shadow-xl shadow-[#1E88E5]/8 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1E88E5]">Patient</p>
          <h2 className="mt-1 text-lg font-bold text-[#102A43]">患者信息</h2>
        </div>
        <span className="rounded-full bg-[#EAF7FF] px-3 py-1 text-xs font-bold text-[#1E88E5]">Mock</span>
      </div>

      <div className="flex h-full flex-col gap-4 overflow-y-auto custom-scrollbar pb-2">
        <section className="rounded-2xl border border-[#D9EAF7] bg-white/88 p-4 shadow-md">
          <p className="text-xs font-bold text-[#1E88E5] tracking-wide">智慧医疗数字人</p>
          <h3 className="mt-2 text-2xl font-bold text-[#102A43]">张天建</h3>
          <p className="mt-1 text-sm font-semibold text-[#627D98]">男 / 75 岁</p>
          <p className="mt-3 rounded-full bg-[#F5FAFF] px-3 py-2 text-sm font-semibold text-[#486581]">
            慢病管理档案 · mock 数据
          </p>
        </section>

        <section className="rounded-2xl border border-[#D9EAF7] bg-white/88 p-4 shadow-md">
          <h3 className="text-base font-bold text-[#102A43]">体征与身体数值</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {mockVitals.map((item) => (
              <div key={item.label} className="rounded-xl border border-[#D9EAF7] bg-[#F5FAFF] p-3">
                <p className="text-xs font-semibold text-[#627D98]">{item.label}</p>
                <p className="mt-1 text-base font-bold text-[#102A43]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#D9EAF7] bg-white/88 p-4 shadow-md">
          <h3 className="text-base font-bold text-[#102A43]">重点健康背景</h3>
          <div className="mt-3 flex flex-col gap-2">
            {mockHistory.map((item) => (
              <span key={item} className="rounded-xl bg-[#EAF7FF] px-3 py-2 text-sm font-bold text-[#243B53]">
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}
