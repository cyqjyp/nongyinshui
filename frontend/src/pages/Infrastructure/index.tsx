import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, Table, Tag, Button, DatePicker, Input, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { ArrowLeftOutlined, EditOutlined, PlusOutlined, RightOutlined, DownOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import SectionTitle from '../../components/common/SectionTitle';
import StatusPill from '../../components/common/StatusPill';
import WaterPointFormModal from './WaterPointFormModal';
import VillageFormModal from './VillageFormModal';
import DeviceDetailModal from './DeviceDetailModal';
import { fetchVillages, fetchWaterPoints, fetchDevices } from '../../services/waterPointService';
import { alerts } from '../../mock/alerts';
import { labRecords } from '../../mock/waterQuality';
import { inspections } from '../../mock/inspections';
import { repairs } from '../../mock/repairs';
import { waterMeters } from '../../mock/waterMeters';
import type { Village, WaterPoint, Device } from '../../types';
import './Infrastructure.css';

export default function InfrastructurePage() {
  const { villageId } = useParams<{ villageId?: string }>();
  const navigate = useNavigate();
  const [villages, setVillages] = useState<Village[]>([]);
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [villageEditOpen, setVillageEditOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    fetchVillages().then(setVillages);
    fetchWaterPoints().then(setWaterPoints);
    fetchDevices().then(setDevices);
  }, []);

  const selectedVillage = villages.find((v) => v.id === villageId);
  const villageWaterPoints = useMemo(
    () => (villageId ? waterPoints.filter((wp) => wp.villageId === villageId) : []),
    [waterPoints, villageId],
  );
  const villageWaterPointIds = useMemo(() => new Set(villageWaterPoints.map((wp) => wp.id)), [villageWaterPoints]);
  const villageDevices = useMemo(
    () => devices.filter((d) => villageWaterPointIds.has(d.waterPointId)),
    [devices, villageWaterPointIds],
  );

  const waterPointNameOf = (id: string) => waterPoints.find((wp) => wp.id === id)?.name ?? id;
  const waterPointCountOf = (id: string) => waterPoints.filter((wp) => wp.villageId === id).length;

  // 近30天告警事件
  const recentAlerts = useMemo(() => {
    if (!villageId) return [];
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return alerts.filter(
      (a) => a.villageId === villageId && new Date(a.triggeredAt).getTime() >= thirtyDaysAgo,
    );
  }, [villageId]);

  // 村庄相关数据
  const villageLabRecords = useMemo(
    () => labRecords.filter((r) => villageWaterPointIds.has(r.waterPointId)),
    [labRecords, villageWaterPointIds],
  );

  const villageInspections = useMemo(
    () => inspections.filter((i) => i.villageId === villageId),
    [inspections, villageId],
  );

  const villageRepairs = useMemo(
    () => repairs.filter((r) => r.villageId === villageId),
    [repairs, villageId],
  );

  const villageWaterMeters = useMemo(
    () => waterMeters.filter((m) => m.villageId === villageId),
    [waterMeters, villageId],
  );

  // 水质记录筛选状态
  const [wqDateRange, setWqDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [wqConclusions, setWqConclusions] = useState<string[]>([]);
  const [wqWaterPoints, setWqWaterPoints] = useState<string[]>([]);
  const [wqInstitutions, setWqInstitutions] = useState<string[]>([]);
  // 下拉面板临时状态（点击确定后才应用到筛选）
  const [tempConclusions, setTempConclusions] = useState<string[]>([]);
  const [tempWaterPoints, setTempWaterPoints] = useState<string[]>([]);
  const [tempInstitutions, setTempInstitutions] = useState<string[]>([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // 获取当前村庄的供水点列表（用于筛选选项）
  const villageWaterPointOptions = useMemo(
    () => villageWaterPoints.map((wp) => ({ id: wp.id, name: wp.name })),
    [villageWaterPoints],
  );

  // 获取当前村庄水质记录中出现的检测机构（去重）
  const villageInstitutionOptions = useMemo(() => {
    const institutions = new Set(villageLabRecords.map((r) => r.institution).filter(Boolean));
    return Array.from(institutions);
  }, [villageLabRecords]);

  // 筛选后的水质记录
  const filteredLabRecords = useMemo(() => {
    return villageLabRecords.filter((record) => {
      // 日期范围筛选
      if (wqDateRange[0] && wqDateRange[1]) {
        const recordDate = new Date(record.testDate).getTime();
        const startDate = wqDateRange[0].valueOf();
        const endDate = wqDateRange[1].valueOf();
        if (recordDate < startDate || recordDate > endDate) return false;
      }

      // 结论筛选（多选，空表示全部）
      if (wqConclusions.length > 0 && !wqConclusions.includes(record.conclusion)) {
        return false;
      }

      // 供水点筛选（多选，空表示全部）
      if (wqWaterPoints.length > 0 && !wqWaterPoints.includes(record.waterPointId)) {
        return false;
      }

      // 检测机构筛选（多选，空表示全部）
      if (wqInstitutions.length > 0 && !wqInstitutions.includes(record.institution)) {
        return false;
      }

      return true;
    });
  }, [villageLabRecords, wqDateRange, wqConclusions, wqWaterPoints, wqInstitutions]);

  // 切换标签选中状态（临时状态）
  const toggleTempTag = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  // 确认筛选
  const confirmFilter = () => {
    setWqConclusions([...tempConclusions]);
    setWqWaterPoints([...tempWaterPoints]);
    setWqInstitutions([...tempInstitutions]);
    setFilterPanelOpen(false);
  };

  // 重置单个筛选条件
  const resetFilter = (type: string) => {
    if (type === 'conclusion') {
      setTempConclusions([]);
    } else if (type === 'waterPoint') {
      setTempWaterPoints([]);
    } else if (type === 'institution') {
      setTempInstitutions([]);
    }
  };

  // 重置全部筛选
  const resetAllFilters = () => {
    setWqDateRange([null, null]);
    setWqConclusions([]);
    setWqWaterPoints([]);
    setWqInstitutions([]);
    setTempConclusions([]);
    setTempWaterPoints([]);
    setTempInstitutions([]);
  };

  // 打开筛选面板时同步当前筛选状态到临时状态
  const openFilterPanel = () => {
    setTempConclusions([...wqConclusions]);
    setTempWaterPoints([...wqWaterPoints]);
    setTempInstitutions([...wqInstitutions]);
    setFilterPanelOpen(true);
  };

  // 点击外部关闭筛选面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.infra-wq-dropdown-wrapper')) {
        setFilterPanelOpen(false);
      }
    };
    if (filterPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterPanelOpen]);

  // 巡检工单筛选状态
  const [inspDateRange, setInspDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [inspWaterPoints, setInspWaterPoints] = useState<string[]>([]);
  const [inspResults, setInspResults] = useState<string[]>([]);
  const [tempInspWaterPoints, setTempInspWaterPoints] = useState<string[]>([]);
  const [tempInspResults, setTempInspResults] = useState<string[]>([]);
  const [inspFilterPanelOpen, setInspFilterPanelOpen] = useState(false);

  // 用户水表筛选状态
  const [meterSearchText, setMeterSearchText] = useState('');

  // 筛选后的巡检记录
  const filteredInspections = useMemo(() => {
    return villageInspections.filter((record) => {
      if (inspDateRange[0] && inspDateRange[1]) {
        const recordDate = new Date(record.inspectedAt).getTime();
        if (recordDate < inspDateRange[0].valueOf() || recordDate > inspDateRange[1].valueOf()) return false;
      }
      if (inspWaterPoints.length > 0 && !inspWaterPoints.includes(record.waterPointId)) return false;
      if (inspResults.length > 0 && !inspResults.includes(record.result)) return false;
      return true;
    });
  }, [villageInspections, inspDateRange, inspWaterPoints, inspResults]);

  const toggleInspTempTag = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const confirmInspFilter = () => {
    setInspWaterPoints([...tempInspWaterPoints]);
    setInspResults([...tempInspResults]);
    setInspFilterPanelOpen(false);
  };

  const resetInspFilter = (type: string) => {
    if (type === 'waterPoint') setTempInspWaterPoints([]);
    else if (type === 'result') setTempInspResults([]);
  };

  const resetAllInspFilters = () => {
    setInspDateRange([null, null]);
    setInspWaterPoints([]);
    setInspResults([]);
    setTempInspWaterPoints([]);
    setTempInspResults([]);
  };

  const openInspFilterPanel = () => {
    setTempInspWaterPoints([...inspWaterPoints]);
    setTempInspResults([...inspResults]);
    setInspFilterPanelOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.infra-insp-dropdown-wrapper')) {
        setInspFilterPanelOpen(false);
      }
    };
    if (inspFilterPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inspFilterPanelOpen]);

  // 筛选后的用户水表
  const filteredWaterMeters = useMemo(() => {
    if (!meterSearchText.trim()) return villageWaterMeters;
    const keyword = meterSearchText.trim().toLowerCase();
    return villageWaterMeters.filter(
      (m) =>
        m.meterNumber.toLowerCase().includes(keyword) ||
        m.householdName.toLowerCase().includes(keyword),
    );
  }, [villageWaterMeters, meterSearchText]);

  if (villageId && villages.length > 0 && !selectedVillage) {
    return (
      <div>
        <SectionTitle title="基础台账管理" />
        <div className="glass-card infra-card">
          <p className="infra-empty">未找到该村庄，请返回列表重新选择。</p>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/infrastructure')}>
            返回村庄列表
          </Button>
        </div>
      </div>
    );
  }

  if (selectedVillage) {
    return (
      <div className="infra-detail-page">
        <Button
          type="text"
          className="infra-back-btn"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/infrastructure')}
        >
          返回村庄列表
        </Button>

        <div className="infra-detail-layout">
          <aside className="glass-card infra-detail-sidebar">
            <div className="infra-sidebar-header">
              <h2 className="infra-village-title">{selectedVillage.name}</h2>
              <Button
                type="default"
                size="small"
                icon={<EditOutlined />}
                className="infra-edit-btn"
                onClick={() => setVillageEditOpen(true)}
              >
                编辑
              </Button>
            </div>
            <div className="infra-summary-list">
              <div className="infra-summary-item">
                <span className="text-label-sm">所属乡镇</span>
                <strong>{selectedVillage.township}</strong>
              </div>
              <div className="infra-summary-item">
                <span className="text-label-sm">人口</span>
                <strong>{selectedVillage.population.toLocaleString()} 人</strong>
              </div>
              <div className="infra-summary-item">
                <span className="text-label-sm">户数</span>
                <strong>{selectedVillage.households.toLocaleString()} 户</strong>
              </div>
              <div className="infra-summary-item">
                <span className="text-label-sm">供水点数量</span>
                <strong>{villageWaterPoints.length} 处</strong>
              </div>
              <div className="infra-summary-item">
                <span className="text-label-sm">设备数量</span>
                <strong>{villageDevices.length} 台</strong>
              </div>
              {selectedVillage.healthScore !== undefined && (
                <div className="infra-summary-item">
                  <span className="text-label-sm">村庄健康评分</span>
                  <strong className={`infra-health-score ${selectedVillage.healthScore >= 80 ? 'good' : selectedVillage.healthScore >= 60 ? 'medium' : 'poor'}`}>
                    {selectedVillage.healthScore} 分
                  </strong>
                </div>
              )}
              {selectedVillage.keyContact && (
                <div className="infra-summary-item">
                  <span className="text-label-sm">关键责任人</span>
                  <strong className="infra-contact-info">
                    <span>{selectedVillage.keyContact.name}</span>
                    <span className="infra-contact-role">{selectedVillage.keyContact.role}</span>
                    <span className="infra-contact-phone">{selectedVillage.keyContact.phone}</span>
                  </strong>
                </div>
              )}
              <div className="infra-summary-item">
                <span className="text-label-sm">近30天事件</span>
                <strong className={`infra-alert-count ${recentAlerts.length > 0 ? 'has-alerts' : 'no-alerts'}`}>
                  {recentAlerts.length > 0 ? `${recentAlerts.length} 条告警` : '无告警'}
                </strong>
              </div>
            </div>
          </aside>

          <div className="glass-card infra-card infra-detail-main">
            <Tabs
              defaultActiveKey="waterPoints"
              destroyOnHidden={false}
              items={[
              {
                key: 'waterPoints',
                label: '供水点台账',
                children: (
                  <>
                    <div className="infra-toolbar">
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                        新增供水点
                      </Button>
                    </div>
                    <Table
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={villageWaterPoints}
                      locale={{ emptyText: '该村暂无供水点' }}
                      columns={[
                        { title: '供水点名称', dataIndex: 'name' },
                        { title: '类型', dataIndex: 'type' },
                        { title: '水源类型', dataIndex: 'sourceType' },
                        { title: '供水方式', dataIndex: 'supplyMode' },
                        { title: '管护主体', dataIndex: 'managedBy' },
                        {
                          title: '覆盖人口',
                          dataIndex: 'coveredPopulation',
                          render: (v: number) => v.toLocaleString(),
                        },
                        { title: '设计规模(m³/日)', dataIndex: 'designCapacity' },
                        {
                          title: '运行状态',
                          dataIndex: 'status',
                          render: (status: WaterPoint['status']) => <StatusPill status={status} />,
                        },
                      ]}
                    />
                  </>
                ),
              },
              {
                key: 'devices',
                label: '设备资产台账',
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={villageDevices}
                    locale={{ emptyText: '该村暂无设备' }}
                    onRow={(record) => ({
                      onClick: () => setSelectedDevice(record),
                      className: 'infra-device-row',
                    })}
                    columns={[
                      {
                        title: '设备名称',
                        dataIndex: 'name',
                        render: (name: string) => <span className="infra-device-name">{name}</span>,
                      },
                      {
                        title: '所属供水点',
                        dataIndex: 'waterPointId',
                        render: waterPointNameOf,
                      },
                      { title: '设备类型', dataIndex: 'type' },
                      { title: '安装日期', dataIndex: 'installedAt' },
                      {
                        title: '在线状态',
                        dataIndex: 'online',
                        render: (v: boolean) => (v ? <Tag color="success">在线</Tag> : <Tag color="default">离线</Tag>),
                      },
                      {
                        title: '运行状态',
                        dataIndex: 'status',
                        render: (status: Device['status']) => <StatusPill status={status} />,
                      },
                    ]}
                  />
                ),
              },
              {
                key: 'waterQuality',
                label: '水质记录',
                children: (
                  <>
                    <div className="infra-wq-filter">
                      <div className="infra-wq-filter-row">
                        <span className="infra-wq-filter-label">检测日期：</span>
                        <DatePicker.RangePicker
                          value={wqDateRange}
                          onChange={(dates) => setWqDateRange(dates as [Dayjs | null, Dayjs | null])}
                          style={{ width: 260 }}
                          placeholder={['开始日期', '结束日期']}
                        />
                        <div className="infra-wq-dropdown-wrapper">
                          <Button
                            className={`infra-wq-filter-btn ${
                              wqConclusions.length > 0 || wqWaterPoints.length > 0 || wqInstitutions.length > 0
                                ? 'infra-wq-filter-btn-active'
                                : ''
                            }`}
                            onClick={openFilterPanel}
                          >
                            <FilterOutlined style={{ marginRight: 4 }} />
                            更多筛选
                            {wqConclusions.length + wqWaterPoints.length + wqInstitutions.length > 0 && (
                              <Tag color="cyan" style={{ marginLeft: 8, marginBottom: 0 }}>
                                {wqConclusions.length + wqWaterPoints.length + wqInstitutions.length}
                              </Tag>
                            )}
                            <DownOutlined style={{ marginLeft: 4, fontSize: 10 }} />
                          </Button>
                          {filterPanelOpen && (
                            <div className="infra-wq-dropdown-panel">
                              {/* 结论 */}
                              <div className="infra-wq-panel-section">
                                <div className="infra-wq-panel-section-header">
                                  <span>结论</span>
                                  {tempConclusions.length > 0 && (
                                    <span
                                      className="infra-wq-panel-reset"
                                      onClick={() => resetFilter('conclusion')}
                                    >
                                      重置
                                    </span>
                                  )}
                                </div>
                                <div className="infra-wq-dropdown-tags">
                                  {['合格', '不合格'].map((val) => (
                                    <span
                                      key={val}
                                      className={`infra-wq-tag ${tempConclusions.includes(val) ? 'infra-wq-tag-active' : ''}`}
                                      onClick={() => toggleTempTag(val, tempConclusions, setTempConclusions)}
                                    >
                                      {val}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {/* 供水点 */}
                              <div className="infra-wq-panel-section">
                                <div className="infra-wq-panel-section-header">
                                  <span>供水点</span>
                                  {tempWaterPoints.length > 0 && (
                                    <span
                                      className="infra-wq-panel-reset"
                                      onClick={() => resetFilter('waterPoint')}
                                    >
                                      重置
                                    </span>
                                  )}
                                </div>
                                <div className="infra-wq-dropdown-tags">
                                  {villageWaterPointOptions.map((wp) => (
                                    <span
                                      key={wp.id}
                                      className={`infra-wq-tag ${tempWaterPoints.includes(wp.id) ? 'infra-wq-tag-active' : ''}`}
                                      onClick={() => toggleTempTag(wp.id, tempWaterPoints, setTempWaterPoints)}
                                    >
                                      {wp.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {/* 检测机构 */}
                              <div className="infra-wq-panel-section">
                                <div className="infra-wq-panel-section-header">
                                  <span>检测机构</span>
                                  {tempInstitutions.length > 0 && (
                                    <span
                                      className="infra-wq-panel-reset"
                                      onClick={() => resetFilter('institution')}
                                    >
                                      重置
                                    </span>
                                  )}
                                </div>
                                <div className="infra-wq-dropdown-tags">
                                  {villageInstitutionOptions.map((inst) => (
                                    <span
                                      key={inst}
                                      className={`infra-wq-tag ${tempInstitutions.includes(inst) ? 'infra-wq-tag-active' : ''}`}
                                      onClick={() => toggleTempTag(inst, tempInstitutions, setTempInstitutions)}
                                    >
                                      {inst}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {/* 底部按钮 */}
                              <div className="infra-wq-dropdown-footer">
                                <Button size="small" onClick={resetAllFilters}>重置全部</Button>
                                <Button size="small" type="primary" onClick={confirmFilter}>确定</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="infra-wq-filter-footer">
                        <span className="infra-wq-filter-count">共 {filteredLabRecords.length} 条记录</span>
                      </div>
                    </div>
                    <Table
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={filteredLabRecords}
                      locale={{ emptyText: '暂无符合条件的水质记录' }}
                      columns={[
                        { title: '检测日期', dataIndex: 'testDate' },
                        { title: '供水点', dataIndex: 'waterPointId', render: waterPointNameOf },
                        { title: '检测机构', dataIndex: 'institution' },
                        { title: '菌落总数(CFU/mL)', dataIndex: 'bacteriaCount' },
                        {
                          title: '总大肠菌群',
                          dataIndex: 'coliformDetected',
                          render: (v: boolean) => (v ? <Tag color="error">检出</Tag> : <Tag color="success">未检出</Tag>),
                        },
                        { title: '浑浊度(NTU)', dataIndex: 'turbidity' },
                        { title: '余氯(mg/L)', dataIndex: 'residualChlorine' },
                        { title: 'pH', dataIndex: 'ph' },
                        {
                          title: '结论',
                          dataIndex: 'conclusion',
                          render: (v: string) => <Tag color={v === '合格' ? 'success' : 'error'}>{v}</Tag>,
                        },
                        { title: '报告附件', dataIndex: 'reportFileName', render: (v?: string) => v ?? '-' },
                      ]}
                    />
                  </>
                ),
              },
              {
                key: 'inspections',
                label: '巡检工单',
                children: (
                  <>
                    <div className="infra-wq-filter">
                      <div className="infra-wq-filter-row">
                        <span className="infra-wq-filter-label">巡检时间：</span>
                        <DatePicker.RangePicker
                          value={inspDateRange}
                          onChange={(dates) => setInspDateRange(dates as [Dayjs | null, Dayjs | null])}
                          style={{ width: 260 }}
                          placeholder={['开始日期', '结束日期']}
                        />
                        <div className="infra-wq-dropdown-wrapper infra-insp-dropdown-wrapper">
                          <Button
                            className={`infra-wq-filter-btn ${
                              inspWaterPoints.length > 0 || inspResults.length > 0 ? 'infra-wq-filter-btn-active' : ''
                            }`}
                            onClick={openInspFilterPanel}
                          >
                            <FilterOutlined style={{ marginRight: 4 }} />
                            更多筛选
                            {inspWaterPoints.length + inspResults.length > 0 && (
                              <Tag color="cyan" style={{ marginLeft: 8, marginBottom: 0 }}>
                                {inspWaterPoints.length + inspResults.length}
                              </Tag>
                            )}
                            <DownOutlined style={{ marginLeft: 4, fontSize: 10 }} />
                          </Button>
                          {inspFilterPanelOpen && (
                            <div className="infra-wq-dropdown-panel">
                              <div className="infra-wq-panel-section">
                                <div className="infra-wq-panel-section-header">
                                  <span>供水点</span>
                                  {tempInspWaterPoints.length > 0 && (
                                    <span className="infra-wq-panel-reset" onClick={() => resetInspFilter('waterPoint')}>重置</span>
                                  )}
                                </div>
                                <div className="infra-wq-dropdown-tags">
                                  {villageWaterPointOptions.map((wp) => (
                                    <span
                                      key={wp.id}
                                      className={`infra-wq-tag ${tempInspWaterPoints.includes(wp.id) ? 'infra-wq-tag-active' : ''}`}
                                      onClick={() => toggleInspTempTag(wp.id, tempInspWaterPoints, setTempInspWaterPoints)}
                                    >
                                      {wp.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="infra-wq-panel-section">
                                <div className="infra-wq-panel-section-header">
                                  <span>结果</span>
                                  {tempInspResults.length > 0 && (
                                    <span className="infra-wq-panel-reset" onClick={() => resetInspFilter('result')}>重置</span>
                                  )}
                                </div>
                                <div className="infra-wq-dropdown-tags">
                                  {['正常', '异常'].map((val) => (
                                    <span
                                      key={val}
                                      className={`infra-wq-tag ${tempInspResults.includes(val) ? 'infra-wq-tag-active' : ''}`}
                                      onClick={() => toggleInspTempTag(val, tempInspResults, setTempInspResults)}
                                    >
                                      {val}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="infra-wq-dropdown-footer">
                                <Button size="small" onClick={resetAllInspFilters}>重置全部</Button>
                                <Button size="small" type="primary" onClick={confirmInspFilter}>确定</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="infra-wq-filter-footer">
                        <span className="infra-wq-filter-count">共 {filteredInspections.length} 条记录</span>
                      </div>
                    </div>
                    <Table
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={filteredInspections}
                      locale={{ emptyText: '暂无符合条件的巡检记录' }}
                      columns={[
                        { title: '巡检时间', dataIndex: 'inspectedAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
                        { title: '供水点', dataIndex: 'waterPointId', render: waterPointNameOf },
                        { title: '巡检人', dataIndex: 'inspector' },
                        {
                          title: '巡检项',
                          dataIndex: 'items',
                          render: (v: string[]) => v.join('、'),
                        },
                        {
                          title: '结果',
                          dataIndex: 'result',
                          render: (v: string) => <Tag color={v === '正常' ? 'success' : 'error'}>{v}</Tag>,
                        },
                        {
                          title: '问题描述',
                          dataIndex: 'issueDescription',
                          render: (v?: string) => v ?? '-',
                        },
                      ]}
                    />
                  </>
                ),
              },
              {
                key: 'repairs',
                label: '报修工单',
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={villageRepairs}
                    locale={{ emptyText: '该村暂无报修记录' }}
                    columns={[
                      { title: '报修时间', dataIndex: 'reportedAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
                      { title: '供水点', dataIndex: 'waterPointId', render: (v?: string) => (v ? waterPointNameOf(v) : '-') },
                      { title: '来源', dataIndex: 'source' },
                      { title: '报修人', dataIndex: 'reporterContact', render: (v?: string) => v ?? '-' },
                      { title: '问题描述', dataIndex: 'description' },
                      { title: '处理人', dataIndex: 'handler', render: (v?: string) => v ?? '-' },
                      {
                        title: '状态',
                        dataIndex: 'status',
                        render: (v: string) => {
                          const colorMap: Record<string, string> = {
                            '待派单': 'error',
                            '处理中': 'warning',
                            '已完成': 'success',
                            '已回访': 'cyan',
                          };
                          return <Tag color={colorMap[v] ?? 'default'}>{v}</Tag>;
                        },
                      },
                      { title: '解决时间', dataIndex: 'resolvedAt', render: (v?: string) => (v ? new Date(v).toLocaleString('zh-CN') : '-') },
                      { title: '处理结果', dataIndex: 'resolution', render: (v?: string) => v ?? '-' },
                    ]}
                  />
                ),
              },
              {
                key: 'waterMeters',
                label: '用户水表',
                children: (
                  <>
                    <div className="infra-wq-filter">
                      <div className="infra-wq-filter-row">
                        <span className="infra-wq-filter-label">搜索：</span>
                        <Input.Search
                          placeholder="请输入用户姓名或水表编号"
                          allowClear
                          value={meterSearchText}
                          onChange={(e) => setMeterSearchText(e.target.value)}
                          style={{ width: 320 }}
                          prefix={<SearchOutlined />}
                        />
                      </div>
                      <div className="infra-wq-filter-footer">
                        <span className="infra-wq-filter-count">共 {filteredWaterMeters.length} 条记录</span>
                      </div>
                    </div>
                    <Table
                      size="small"
                      rowKey="id"
                      pagination={false}
                      dataSource={filteredWaterMeters}
                      locale={{ emptyText: '暂无符合条件的水表记录' }}
                      columns={[
                        { title: '水表编号', dataIndex: 'meterNumber' },
                        { title: '用户姓名', dataIndex: 'householdName' },
                        { title: '地址', dataIndex: 'address' },
                        { title: '所属供水点', dataIndex: 'waterPointId', render: waterPointNameOf },
                        { title: '安装日期', dataIndex: 'installedAt' },
                        { title: '最近读数(m³)', dataIndex: 'lastReading' },
                        { title: '抄表日期', dataIndex: 'lastReadingDate' },
                        {
                          title: '状态',
                          dataIndex: 'status',
                          render: (v: string) => (
                            <Tag color={v === '正常' ? 'success' : v === '故障' ? 'error' : 'warning'}>{v}</Tag>
                          ),
                        },
                      ]}
                    />
                  </>
                ),
              },
            ]}
          />
          </div>
        </div>

        <DeviceDetailModal
          open={selectedDevice !== null}
          device={selectedDevice}
          waterPointName={selectedDevice ? waterPointNameOf(selectedDevice.waterPointId) : undefined}
          villageName={selectedVillage.name}
          onClose={() => setSelectedDevice(null)}
        />

        <VillageFormModal
          open={villageEditOpen}
          village={selectedVillage}
          onCancel={() => setVillageEditOpen(false)}
          onSaved={(updated) => {
            setVillages((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
            setVillageEditOpen(false);
            message.success('村庄基础信息已更新(演示数据,仅保存在本次会话中)');
          }}
        />

        <WaterPointFormModal
          open={modalOpen}
          villages={villages}
          defaultVillageId={selectedVillage.id}
          onCancel={() => setModalOpen(false)}
          onCreated={(newPoint) => {
            setWaterPoints((prev) => [...prev, newPoint]);
            setModalOpen(false);
            message.success('供水点已新增(演示数据,仅保存在本次会话中)');
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle title="基础台账管理" />
      <div className="glass-card infra-card">
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={villages}
          onRow={(record) => ({
            onClick: () => navigate(`/infrastructure/${record.id}`),
            className: 'infra-village-row',
          })}
          columns={[
            { title: '村庄名称', dataIndex: 'name' },
            { title: '所属乡镇', dataIndex: 'township' },
            { title: '人口', dataIndex: 'population', render: (v: number) => v.toLocaleString() },
            { title: '户数', dataIndex: 'households', render: (v: number) => v.toLocaleString() },
            {
              title: '供水点',
              key: 'waterPointCount',
              render: (_: unknown, record: Village) => `${waterPointCountOf(record.id)} 处`,
            },
            {
              title: '',
              key: 'action',
              width: 48,
              render: () => <RightOutlined className="infra-row-arrow" />,
            },
          ]}
        />
      </div>
    </div>
  );
}
