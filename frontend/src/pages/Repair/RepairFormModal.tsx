import { Modal, Form, Select, Input } from 'antd';
import { createRepair } from '../../services/repairService';
import type { RepairSource, Village } from '../../types';

const SOURCES: RepairSource[] = ['电话反映', '现场反映', '小程序自助(预留)'];

interface RepairFormModalProps {
  open: boolean;
  villages: Village[];
  onCancel: () => void;
  onCreated: () => void;
}

export default function RepairFormModal({ open, villages, onCancel, onCreated }: RepairFormModalProps) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await createRepair({
      villageId: values.villageId,
      source: values.source,
      reporterContact: values.reporterContact,
      description: values.description,
      reportedAt: new Date().toISOString(),
      handler: values.handler,
    });
    form.resetFields();
    onCreated();
  };

  return (
    <Modal
      title="代客登记报修"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false} initialValues={{ source: '电话反映' }}>
        <Form.Item name="villageId" label="村庄" rules={[{ required: true, message: '请选择村庄' }]}>
          <Select options={villages.map((v) => ({ value: v.id, label: v.name }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item name="source" label="来源" rules={[{ required: true }]}>
          <Select options={SOURCES.map((s) => ({ value: s, label: s }))} />
        </Form.Item>
        <Form.Item name="reporterContact" label="反映人联系方式">
          <Input placeholder="例如:村民-李大爷 138****2201" />
        </Form.Item>
        <Form.Item name="description" label="问题描述" rules={[{ required: true, message: '请填写问题描述' }]}>
          <Input.TextArea rows={3} placeholder="请描述反映的问题" />
        </Form.Item>
        <Form.Item name="handler" label="指派处理人">
          <Input placeholder="例如:王建国(可留空,后续再指派)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
