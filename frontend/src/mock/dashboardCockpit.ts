export const dashboardQualityPassRates = [75, 75, 100, 75, 75, 50, 50];

export const dashboardWaterVolumes = [728, 742, 735, 761, 749, 753, 756];

// 固定趋势仅统计具有有限压力读数的演示监测点，末日数据与当前有效点位分类一致。
export const dashboardPressureSeries = {
  normal: [3, 3, 3, 3, 2, 3, 3],
  low: [0, 1, 1, 0, 1, 1, 0],
  high: [1, 0, 0, 1, 1, 0, 1],
};
