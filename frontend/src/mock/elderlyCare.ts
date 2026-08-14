import type {
  ElderlyPerson,
  ElderlyCareRecord,
  ElderlyWaterAlert,
  ElderlyCareOverview,
} from '../types';

export const elderlyPersons: ElderlyPerson[] = [
  {
    id: 'elderly-01',
    name: '王秀英',
    age: 78,
    gender: '女',
    villageId: 'v-01',
    address: '青溪村1组12号',
    contactName: '王建国',
    contactPhone: '138-5782-3301',
    supplyMode: '集中供水',
    healthStatus: '半自理',
    meterNumber: 'WM-2024-003',
    waterPointId: 'wp-01',
    remark: '子女在外地务工，独自居住',
    createdAt: '2026-01-15',
  },
  {
    id: 'elderly-02',
    name: '李德福',
    age: 82,
    gender: '男',
    villageId: 'v-01',
    address: '青溪村2组8号',
    contactName: '李明',
    contactPhone: '139-6688-2201',
    supplyMode: '集中供水',
    healthStatus: '自理',
    meterNumber: 'WM-2024-007',
    waterPointId: 'wp-01',
    createdAt: '2026-01-15',
  },
  {
    id: 'elderly-03',
    name: '赵桂兰',
    age: 75,
    gender: '女',
    villageId: 'v-02',
    address: '石桥村3组15号',
    contactName: '赵强',
    contactPhone: '137-9901-5566',
    supplyMode: '集中供水',
    healthStatus: '需照料',
    meterNumber: 'WM-2024-012',
    waterPointId: 'wp-03',
    remark: '行动不便，需定期上门查看',
    createdAt: '2026-02-01',
  },
  {
    id: 'elderly-04',
    name: '陈守义',
    age: 80,
    gender: '男',
    villageId: 'v-02',
    address: '石桥村1组22号',
    contactName: '陈芳',
    contactPhone: '136-7722-8899',
    supplyMode: '集中供水',
    healthStatus: '半自理',
    meterNumber: 'WM-2024-015',
    waterPointId: 'wp-03',
    createdAt: '2026-02-01',
  },
  {
    id: 'elderly-05',
    name: '刘桂珍',
    age: 76,
    gender: '女',
    villageId: 'v-03',
    address: '梅岭村2组5号',
    contactName: '刘伟',
    contactPhone: '135-4433-6677',
    supplyMode: '分散供水',
    healthStatus: '自理',
    meterNumber: 'WM-2024-020',
    waterPointId: 'wp-04',
    createdAt: '2026-03-01',
  },
  {
    id: 'elderly-06',
    name: '张福寿',
    age: 85,
    gender: '男',
    villageId: 'v-03',
    address: '梅岭村1组18号',
    contactName: '张丽',
    contactPhone: '158-2211-3344',
    supplyMode: '分散供水',
    healthStatus: '需照料',
    meterNumber: 'WM-2024-023',
    waterPointId: 'wp-05',
    remark: '高龄老人，重点关注',
    createdAt: '2026-03-01',
  },
];

export const elderlyCareRecords: ElderlyCareRecord[] = [
  {
    id: 'cr-01',
    elderlyId: 'elderly-01',
    careDate: '2026-08-04',
    careMethod: '上门走访',
    caregiver: '张海涛',
    waterStatus: '正常',
    healthStatus: '良好',
    remark: '老人精神状态良好，用水正常',
  },
  {
    id: 'cr-02',
    elderlyId: 'elderly-02',
    careDate: '2026-08-03',
    careMethod: '上门走访',
    caregiver: '张海涛',
    waterStatus: '正常',
    healthStatus: '良好',
  },
  {
    id: 'cr-03',
    elderlyId: 'elderly-03',
    careDate: '2026-07-28',
    careMethod: '上门走访',
    caregiver: '陈美玲',
    waterStatus: '异常',
    healthStatus: '需关注',
    measures: '水龙头出水偏小，已联系水管员排查',
    remark: '老人反映近两天水压不足',
  },
  {
    id: 'cr-04',
    elderlyId: 'elderly-04',
    careDate: '2026-08-01',
    careMethod: '上门走访',
    caregiver: '陈美玲',
    waterStatus: '正常',
    healthStatus: '良好',
  },
  {
    id: 'cr-05',
    elderlyId: 'elderly-05',
    careDate: '2026-08-05',
    careMethod: '上门走访',
    caregiver: '王建国',
    waterStatus: '正常',
    healthStatus: '良好',
  },
  {
    id: 'cr-06',
    elderlyId: 'elderly-06',
    careDate: '2026-07-25',
    careMethod: '上门走访',
    caregiver: '王建国',
    waterStatus: '正常',
    healthStatus: '需关注',
    remark: '老人近期感冒，已提醒注意保暖',
  },
];

export const elderlyWaterAlerts: ElderlyWaterAlert[] = [
  {
    id: 'alert-01',
    elderlyId: 'elderly-06',
    alertType: '长期0用水',
    triggeredAt: '2026-08-06 08:00:00',
    description: '张福寿老人家水表连续3天读数为0，可能存在异常情况',
    notifiedPersons: ['张丽（亲属）', '王建国（村干部）'],
    handled: false,
  },
  {
    id: 'alert-02',
    elderlyId: 'elderly-03',
    alertType: '长期高用水',
    triggeredAt: '2026-08-05 14:30:00',
    description: '赵桂兰老人家水表近3天用水量持续偏高，可能存在管道漏水',
    notifiedPersons: ['赵强（亲属）', '陈美玲（村干部）'],
    handled: true,
  },
];

export function getElderlyCareOverview(): ElderlyCareOverview {
  const total = elderlyPersons.length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyCared = elderlyCareRecords.filter((r) => new Date(r.careDate) >= sevenDaysAgo).length;
  const pendingCare = elderlyPersons.filter((p) => {
    const lastRecord = elderlyCareRecords
      .filter((r) => r.elderlyId === p.id)
      .sort((a, b) => new Date(b.careDate).getTime() - new Date(a.careDate).getTime())[0];
    if (!lastRecord) return true;
    return new Date(lastRecord.careDate) < sevenDaysAgo;
  }).length;

  const waterAbnormal = elderlyWaterAlerts.filter((a) => !a.handled).length;

  return {
    totalElderly: total,
    careCoverage: Math.round(((total - pendingCare) / total) * 100),
    weeklyCared,
    pendingCare,
    waterAbnormal,
  };
}

export function getElderlyPersonsByVillage(villageId?: string): ElderlyPerson[] {
  if (!villageId) return elderlyPersons;
  return elderlyPersons.filter((p) => p.villageId === villageId);
}

export function getElderlyPersonById(id: string): ElderlyPerson | undefined {
  return elderlyPersons.find((p) => p.id === id);
}

export function getCareRecordsByElderly(elderlyId: string): ElderlyCareRecord[] {
  return elderlyCareRecords
    .filter((r) => r.elderlyId === elderlyId)
    .sort((a, b) => new Date(b.careDate).getTime() - new Date(a.careDate).getTime());
}

export function getWaterAlertsByElderly(elderlyId: string): ElderlyWaterAlert[] {
  return elderlyWaterAlerts.filter((a) => a.elderlyId === elderlyId);
}

export function getUnhandledAlerts(): ElderlyWaterAlert[] {
  return elderlyWaterAlerts.filter((a) => !a.handled);
}
