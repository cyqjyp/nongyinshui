import type { RepairOrder } from '../types';

export const repairs: RepairOrder[] = [
  {
    id: 'rep-01',
    villageId: 'v-03',
    waterPointId: 'wp-05',
    source: '电话反映',
    reporterContact: '村民-李大爷 138****2201',
    description: '家中自来水浑浊发黄,已持续一天。',
    reportedAt: '2026-07-22T18:20:00',
    handler: '王建国',
    status: '处理中',
    dispatchedAt: '2026-07-22T19:00:00',
  },
  {
    id: 'rep-02',
    villageId: 'v-02',
    waterPointId: 'wp-03',
    source: '现场反映',
    description: '石桥村3组管道接口渗水,路面湿滑。',
    reportedAt: '2026-07-21T10:05:00',
    handler: '陈美玲',
    status: '已完成',
    dispatchedAt: '2026-07-21T10:30:00',
    resolvedAt: '2026-07-21T15:40:00',
    resolution: '更换管道接口密封圈,已修复。',
  },
  {
    id: 'rep-03',
    villageId: 'v-01',
    source: '电话反映',
    reporterContact: '村民-赵女士 139****7788',
    description: '晚高峰时段水压偏小。',
    reportedAt: '2026-07-20T19:00:00',
    handler: '张海涛',
    status: '已回访',
    dispatchedAt: '2026-07-20T19:30:00',
    resolvedAt: '2026-07-21T09:00:00',
    resolution: '排查为用水高峰正常现象,已向村民解释说明。',
    visitedAt: '2026-07-21T14:00:00',
    visitResult: '村民确认水压已恢复正常,对处理结果满意。',
    visitConfirmed: true,
  },
  {
    id: 'rep-04',
    villageId: 'v-03',
    waterPointId: 'wp-04',
    source: '现场反映',
    description: '机井房照明灯损坏,夜间巡检不便。',
    reportedAt: '2026-07-19T08:30:00',
    status: '待派单',
  },
];

export function getRepairsByVillage(villageId: string): RepairOrder[] {
  return repairs.filter((r) => r.villageId === villageId);
}
