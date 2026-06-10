import type { MedicalResponse } from '../types/digitalHuman'

const mockDB: Record<string, MedicalResponse> = {
  dizziness: {
    answer: `根据您的描述，头晕可能与以下几种情况有关：

**1. 体位性低血压**
老年人血管调节能力下降，晨起从卧位到立位时血压骤降。如正在服用降压药，晨起药效叠加可能加重这一现象。

**2. 血糖波动**
需排除夜间低血糖后早晨反跳性高血糖（Somogyi效应），建议监测晨起血糖。

**3. 颈动脉相关脑供血不足**
如已有颈动脉斑块，结合高血压、高血脂，不能完全排除TIA风险。`,
    subtitle: '头晕可能与神经系统、耳鼻喉系统、血压、贫血、睡眠等因素有关。建议先到全科或神经内科进行初步评估。',
    avatarState: 'speaking',
    gesture: 'explain',
    riskLevel: 'medium',
    suggestedDepartments: ['全科', '神经内科', '耳鼻喉科'],
    knowledgeSources: ['医院导诊知识库', '常见症状科普库', '老年头晕诊疗指南'],
    cards: [
      { title: '建议科室', content: '全科 / 神经内科 / 耳鼻喉科' },
      { title: '就诊准备', content: '携带血压记录本（早晚各测1次×1周）、近期化验单、目前所有药品（药盒）' },
      { title: '风险提示', content: '如伴随剧烈头痛、胸痛、意识障碍、肢体无力等情况，请立即前往急诊。' },
    ],
  },
  checkup: {
    answer: `体检前需要注意以下事项：

**1. 空腹要求**
一般体检需空腹 8-12 小时。前一晚 20:00 后禁食，可少量饮水。糖尿病患者请咨询医生是否需要暂停降糖药。

**2. 药物管理**
高血压患者体检当天早晨可用少量水送服降压药，不要擅自停药。降糖药和胰岛素通常需要暂停，具体请咨询医生。

**3. 饮食准备**
体检前 3 天清淡饮食，避免高脂、高蛋白、饮酒，以免影响肝功能、血脂等指标。`,
    subtitle: '体检前需空腹8-12小时，清淡饮食3天，高血压患者可少量水送服降压药，糖尿病患者请提前咨询医生。',
    avatarState: 'speaking',
    gesture: 'explain',
    riskLevel: 'low',
    suggestedDepartments: ['体检中心', '全科'],
    knowledgeSources: ['体检指南', '慢性病患者体检注意事项'],
    cards: [
      { title: '空腹时间', content: '8-12小时，前一晚20:00后禁食' },
      { title: '药物注意', content: '降压药可用少量水送服；降糖药/胰岛素通常暂停' },
      { title: '饮食准备', content: '前3天清淡饮食，避免高脂、饮酒' },
    ],
  },
  diabetes: {
    answer: `糖尿病患者日常管理需要注意以下几个方面：

**1. 血糖监测**
每天至少监测空腹和餐后2小时血糖各1次，每3个月检查一次糖化血红蛋白（HbA1c），目标值因人而异，一般控制在7.0%以下。

**2. 饮食管理**
定时定量进餐，粗细搭配。控制碳水化合物摄入，优先选择低GI食物。每日食盐不超过5g，食用油不超过25g。避免含糖饮料和加工食品。

**3. 运动建议**
每周至少150分钟中等强度有氧运动（如快走、游泳），每周2-3次抗阻训练。运动前后监测血糖，避免低血糖。`,
    subtitle: '糖尿病患者应每日监测血糖、定时定量进餐、每周150分钟有氧运动、每3个月检查HbA1c。',
    avatarState: 'speaking',
    gesture: 'explain',
    riskLevel: 'medium',
    suggestedDepartments: ['内分泌科', '营养科'],
    knowledgeSources: ['中国2型糖尿病防治指南', '糖尿病自我管理手册'],
    cards: [
      { title: '血糖目标', content: '空腹 <7.0 mmol/L；餐后2h <10.0 mmol/L；HbA1c <7.0%' },
      { title: '饮食要点', content: '定时定量、粗细搭配、低GI食物、每日食盐<5g' },
      { title: '运动建议', content: '每周150分钟有氧 + 2-3次抗阻训练' },
      { title: '并发症筛查', content: '每年检查眼底、肾功能、足部、心电图' },
    ],
  },
  rehab: {
    answer: `以下是适合在家进行的安全康复动作。请跟随数字人演示。

⚠️ 所有动作应在不引起剧痛的前提下进行。如出现锐痛或不适，立即停止。

**动作一：坐姿颈部侧屈（拉伸斜方肌）**
1. 坐直，双肩放松
2. 缓慢向左侧倾斜头部，左手轻扶头部
3. 保持15-20秒，感受右侧拉伸
4. 回到中立位，换另一侧
5. 每侧3次

**动作二：肩部环绕**
1. 坐直或站立
2. 双肩向上→向后→向下→向前缓慢画圈
3. 10次后反方向
4. 每方向2组`,
    subtitle: '请跟随数字人进行肩颈康复动作：1.坐姿颈部侧屈 2.肩部环绕。如出现疼痛或不适，请立即停止并咨询医生。',
    avatarState: 'rehab',
    gesture: 'rehab',
    riskLevel: 'low',
    suggestedDepartments: ['康复科', '骨科'],
    knowledgeSources: ['骨关节炎康复指南', '颈肩康复训练手册'],
    cards: [
      { title: '动作步骤', content: '1. 保持身体直立\n2. 缓慢侧倾头部\n3. 保持15-20秒\n4. 回到中立位\n5. 换另一侧' },
      { title: '注意事项', content: '动作轻柔缓慢，不要用力过猛。如出现疼痛、眩晕或不适，应立即停止并咨询医生。' },
      { title: '训练频率', content: '每天2-3次，每次10-15分钟' },
    ],
  },
  fallback: {
    answer: `感谢您的提问。作为AI医疗助手，我可以为您提供以下帮助：

1. 常见症状的科室导诊建议
2. 体检前注意事项
3. 慢性病日常管理建议
4. 康复动作演示指导

请注意，我的建议仅供参考，不能替代执业医师的诊断。如有紧急情况，请立即拨打120或前往最近医院急诊科。`,
    subtitle: '我是您的AI医疗助手，可以帮您解答常见健康问题。请注意我的建议仅供参考，不能替代医生诊断。',
    avatarState: 'speaking',
    gesture: 'explain',
    riskLevel: 'low',
    suggestedDepartments: ['全科'],
    knowledgeSources: ['AI医疗助手知识库'],
    cards: [
      { title: '服务范围', content: '科室导诊 / 体检咨询 / 慢病管理 / 康复指导' },
      { title: '免责声明', content: '本回答仅用于健康科普与导诊参考，不能替代医生诊断。如有不适请及时就医。' },
    ],
  },
}

export function getMockResponse(question: string): MedicalResponse {
  const q = question.toLowerCase()
  if (q.includes('头晕') || q.includes('挂什么科') || q.includes('挂号')) return mockDB.dizziness
  if (q.includes('体检') || q.includes('检查前')) return mockDB.checkup
  if (q.includes('糖尿') || q.includes('血糖')) return mockDB.diabetes
  if (q.includes('康复') || q.includes('肩颈') || q.includes('膝盖') || q.includes('动作')) return mockDB.rehab
  return mockDB.fallback
}
