import type { InspectionRecord } from '../types';

export const inspections: InspectionRecord[] = [
  {
    id: 'insp-01',
    waterPointId: 'wp-01',
    villageId: 'v-01',
    inspector: '张海涛',
    inspectedAt: '2026-07-23T07:30:00',
    items: ['水泵运行声音', '加氯装置药量', '厂区围栏', '出厂水表读数'],
    result: '正常',
  },
  {
    id: 'insp-02',
    waterPointId: 'wp-02',
    villageId: 'v-01',
    inspector: '张海涛',
    inspectedAt: '2026-07-23T07:50:00',
    items: ['水池液位', '池体渗漏情况', '盖板锁具'],
    result: '正常',
  },
  {
    id: 'insp-03',
    waterPointId: 'wp-03',
    villageId: 'v-02',
    inspector: '陈美玲',
    inspectedAt: '2026-07-22T08:10:00',
    items: ['余氯监测仪读数', '送水泵运行状态', '水站门锁'],
    result: '异常',
    issueDescription: '余氯在线监测仪读数持续偏低,怀疑加氯装置药量不足,已上报。',
  },
  {
    id: 'insp-04',
    waterPointId: 'wp-04',
    villageId: 'v-03',
    inspector: '王建国',
    inspectedAt: '2026-07-22T09:00:00',
    items: ['机井潜水泵', '井台防护', '周边环境卫生'],
    result: '正常',
  },
  {
    id: 'insp-05',
    waterPointId: 'wp-05',
    villageId: 'v-03',
    inspector: '王建国',
    inspectedAt: '2026-07-21T09:10:00',
    items: ['引水管道', '沉淀池清洁度', '监测设备通电情况'],
    result: '异常',
    issueDescription: '暴雨后引水浑浊度明显上升,监测设备离线,已现场排查并上报。',
  },
  {
    id: 'insp-06',
    waterPointId: 'wp-01',
    villageId: 'v-01',
    inspector: '张海涛',
    inspectedAt: '2026-07-16T07:40:00',
    items: ['水泵运行声音', '加氯装置药量', '厂区围栏'],
    result: '正常',
  },
];

export function getInspectionsByWaterPoint(waterPointId: string): InspectionRecord[] {
  return inspections.filter((i) => i.waterPointId === waterPointId);
}
