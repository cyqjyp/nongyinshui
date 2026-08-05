import { useEffect, useMemo, useState } from 'react';
import { Select, DatePicker, Button, Table, Space, Empty } from 'antd';
import { FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import SectionTitle from '../../components/common/SectionTitle';
import { fetchVillages, fetchWaterPoints } from '../../services/waterPointService';
import { fetchLabRecords, fetchAlerts } from '../../services/waterQualityService';
import { fetchInspections } from '../../services/inspectionService';
import { exportToExcel, printAsPdf } from '../../services/reportService';
import type { AlertEvent, InspectionRecord, LabWaterQualityRecord, Village, WaterPoint } from '../../types';
import './Reports.css';

type ReportType = 'quality' | 'inspection' | 'alert';

const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'quality', label: '水质检测记录汇总' },
  { value: 'inspection', label: '巡检记录汇总' },
  { value: 'alert', label: '异常事件处理情况汇总' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('quality');
  const [villageId, setVillageId] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(90, 'day'), dayjs()]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [labRecords, setLabRecords] = useState<LabWaterQualityRecord[]>([]);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);

  useEffect(() => {
    fetchVillages().then(setVillages);
    fetchWaterPoints().then(setWaterPoints);
    fetchLabRecords().then(setLabRecords);
    fetchInspections().then(setInspections);
    fetchAlerts().then(setAlerts);
  }, []);

  const villageNameOf = (id: string) => villages.find((v) => v.id === id)?.name ?? id;
  const waterPointNameOf = (id?: string) => (id ? waterPoints.find((wp) => wp.id === id)?.name ?? id : '-');
  const waterPointVillage = (waterPointId: string) => waterPoints.find((wp) => wp.id === waterPointId)?.villageId;

  const filteredQuality = useMemo(
    () =>
      labRecords.filter((r) => {
        const inRange = dayjs(r.testDate).isAfter(range[0].subtract(1, 'day')) && dayjs(r.testDate).isBefore(range[1].add(1, 'day'));
        const inVillage = !villageId || waterPointVillage(r.waterPointId) === villageId;
        return inRange && inVillage;
      }),
    [labRecords, range, villageId, waterPoints],
  );

  const filteredInspections = useMemo(
    () =>
      inspections.filter((r) => {
        const inRange = dayjs(r.inspectedAt).isAfter(range[0].subtract(1, 'day')) && dayjs(r.inspectedAt).isBefore(range[1].add(1, 'day'));
        const inVillage = !villageId || r.villageId === villageId;
        return inRange && inVillage;
      }),
    [inspections, range, villageId],
  );

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((r) => {
        const inRange = dayjs(r.triggeredAt).isAfter(range[0].subtract(1, 'day')) && dayjs(r.triggeredAt).isBefore(range[1].add(1, 'day'));
        const inVillage = !villageId || r.villageId === villageId;
        return inRange && inVillage;
      }),
    [alerts, range, villageId],
  );

  const handleExportExcel = () => {
    const villageLabel = villageId ? villageNameOf(villageId) : '全部村庄';
    const rangeLabel = `${range[0].format('YYYYMMDD')}-${range[1].format('YYYYMMDD')}`;
    if (reportType === 'quality') {
      exportToExcel(
        filteredQuality.map((r) => ({
          检测日期: r.testDate,
          供水点: waterPointNameOf(r.waterPointId),
          检测机构: r.institution,
          '菌落总数(CFU/mL)': r.bacteriaCount,
          总大肠菌群: r.coliformDetected ? '检出' : '未检出',
          '浑浊度(NTU)': r.turbidity,
          '余氯(mg/L)': r.residualChlorine,
          pH: r.ph,
          结论: r.conclusion,
        })),
        '水质检测记录',
        `水质检测记录汇总_${villageLabel}_${rangeLabel}`,
      );
    } else if (reportType === 'inspection') {
      exportToExcel(
        filteredInspections.map((r) => ({
          巡检时间: r.inspectedAt,
          供水点: waterPointNameOf(r.waterPointId),
          巡检人: r.inspector,
          巡检项目: r.items.join('、'),
          巡检结果: r.result,
          问题描述: r.issueDescription ?? '',
        })),
        '巡检记录',
        `巡检记录汇总_${villageLabel}_${rangeLabel}`,
      );
    } else {
      exportToExcel(
        filteredAlerts.map((r) => ({
          触发时间: r.triggeredAt,
          供水点: waterPointNameOf(r.waterPointId),
          异常指标: r.indicator,
          数值: `${r.value}${r.unit}`,
          标准: r.threshold,
          级别: r.level === 'critical' ? '严重' : '一般',
          通知渠道: r.notifyChannels.join('+'),
          处置状态: r.status,
          处理人: r.handledBy ?? '',
          处理时间: r.handledAt ?? '',
        })),
        '异常事件处理情况',
        `异常事件处理情况汇总_${villageLabel}_${rangeLabel}`,
      );
    }
  };

  const renderTable = () => {
    if (reportType === 'quality') {
      if (filteredQuality.length === 0) return <Empty description="所选条件下暂无数据" />;
      return (
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={filteredQuality}
          columns={[
            { title: '检测日期', dataIndex: 'testDate' },
            { title: '供水点', dataIndex: 'waterPointId', render: waterPointNameOf },
            { title: '检测机构', dataIndex: 'institution' },
            { title: '菌落总数', dataIndex: 'bacteriaCount' },
            { title: '浑浊度', dataIndex: 'turbidity' },
            { title: '余氯', dataIndex: 'residualChlorine' },
            { title: 'pH', dataIndex: 'ph' },
            { title: '结论', dataIndex: 'conclusion' },
          ]}
        />
      );
    }
    if (reportType === 'inspection') {
      if (filteredInspections.length === 0) return <Empty description="所选条件下暂无数据" />;
      return (
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={filteredInspections}
          columns={[
            { title: '巡检时间', dataIndex: 'inspectedAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
            { title: '供水点', dataIndex: 'waterPointId', render: waterPointNameOf },
            { title: '巡检人', dataIndex: 'inspector' },
            { title: '结果', dataIndex: 'result' },
            { title: '问题描述', dataIndex: 'issueDescription', render: (v?: string) => v ?? '-' },
          ]}
        />
      );
    }
    if (filteredAlerts.length === 0) return <Empty description="所选条件下暂无数据" />;
    return (
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        dataSource={filteredAlerts}
        columns={[
          { title: '触发时间', dataIndex: 'triggeredAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
          { title: '供水点', dataIndex: 'waterPointId', render: waterPointNameOf },
          { title: '异常指标', dataIndex: 'indicator' },
          { title: '处置状态', dataIndex: 'status' },
          { title: '处理人', dataIndex: 'handledBy', render: (v?: string) => v ?? '-' },
        ]}
      />
    );
  };

  return (
    <div>
      <SectionTitle title="报表导出" />
      <div className="glass-card reports-toolbar">
        <Space wrap size="middle">
          <Select
            style={{ width: 220 }}
            value={reportType}
            options={REPORT_OPTIONS}
            onChange={setReportType}
          />
          <Select
            style={{ width: 180 }}
            value={villageId}
            allowClear
            placeholder="全部村庄"
            options={villages.map((v) => ({ value: v.id, label: v.name }))}
            onChange={setVillageId}
          />
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => v && v[0] && v[1] && setRange([v[0], v[1]])}
          />
          <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel}>
            导出 Excel
          </Button>
          <Button icon={<PrinterOutlined />} onClick={printAsPdf}>
            打印 / 导出 PDF
          </Button>
        </Space>
      </div>

      <div className="glass-card reports-preview" id="report-print-area">
        <div className="reports-preview-header">
          <span>报表预览</span>
          <span className="text-label-sm">
            {REPORT_OPTIONS.find((o) => o.value === reportType)?.label} · {villageId ? villageNameOf(villageId) : '全部村庄'} ·{' '}
            {range[0].format('YYYY-MM-DD')} ~ {range[1].format('YYYY-MM-DD')}
          </span>
        </div>
        {renderTable()}
      </div>
    </div>
  );
}
