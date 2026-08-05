import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import type { Village, WaterPoint, WaterPointType, WaterSourceType, SupplyMode, ManagedBy } from '../../types';

const WATER_POINT_TYPES: WaterPointType[] = ['集中式水厂', '集中式水站', '蓄水池', '分散式机井', '分散式山泉'];
const SOURCE_TYPES: WaterSourceType[] = ['地表水', '地下水', '山泉水'];
const SUPPLY_MODES: SupplyMode[] = ['集中供水', '分散供水'];
const MANAGED_BY: ManagedBy[] = ['公司直管', '村级管护'];

interface WaterPointFormModalProps {
  open: boolean;
  villages: Village[];
  defaultVillageId?: string;
  onCancel: () => void;
  onCreated: (point: WaterPoint) => void;
}

export default function WaterPointFormModal({
  open,
  villages,
  defaultVillageId,
  onCancel,
  onCreated,
}: WaterPointFormModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && defaultVillageId) {
      form.setFieldsValue({ villageId: defaultVillageId });
    }
  }, [open, defaultVillageId, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const newPoint: WaterPoint = {
      id: `wp-${Date.now()}`,
      name: values.name,
      villageId: values.villageId,
      type: values.type,
      sourceType: values.sourceType,
      supplyMode: values.supplyMode,
      managedBy: values.managedBy,
      coveredHouseholds: values.coveredHouseholds,
      coveredPopulation: values.coveredPopulation,
      designCapacity: values.designCapacity,
      currentFlow: 0,
      status: 'running',
      location: { lat: 28.42, lng: 118.86 },
    };
    form.resetFields();
    onCreated(newPoint);
  };

  return (
    <Modal
      title="新增供水点"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item name="name" label="供水点名称" rules={[{ required: true, message: '请输入供水点名称' }]}>
          <Input placeholder="例如:青溪水厂" />
        </Form.Item>
        <Form.Item name="villageId" label="所属村庄" rules={[{ required: true, message: '请选择所属村庄' }]}>
          <Select options={villages.map((v) => ({ value: v.id, label: v.name }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item name="type" label="供水点类型" rules={[{ required: true }]}>
          <Select options={WATER_POINT_TYPES.map((t) => ({ value: t, label: t }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item name="sourceType" label="水源类型" rules={[{ required: true }]}>
          <Select options={SOURCE_TYPES.map((t) => ({ value: t, label: t }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item name="supplyMode" label="供水方式" rules={[{ required: true }]}>
          <Select options={SUPPLY_MODES.map((t) => ({ value: t, label: t }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item name="managedBy" label="管护主体" rules={[{ required: true }]}>
          <Select options={MANAGED_BY.map((t) => ({ value: t, label: t }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item name="coveredPopulation" label="覆盖人口" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} placeholder="人" />
        </Form.Item>
        <Form.Item name="coveredHouseholds" label="覆盖户数" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} placeholder="户" />
        </Form.Item>
        <Form.Item name="designCapacity" label="设计供水规模(m³/日)" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
