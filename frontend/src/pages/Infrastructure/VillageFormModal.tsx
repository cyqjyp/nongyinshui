import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { Village } from '../../types';

interface VillageFormModalProps {
  open: boolean;
  village: Village | null;
  onCancel: () => void;
  onSaved: (village: Village) => void;
}

export default function VillageFormModal({ open, village, onCancel, onSaved }: VillageFormModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && village) {
      form.setFieldsValue({
        name: village.name,
        township: village.township,
        population: village.population,
        households: village.households,
      });
    }
  }, [open, village, form]);

  const handleOk = async () => {
    if (!village) return;
    const values = await form.validateFields();
    onSaved({
      ...village,
      name: values.name,
      township: values.township,
      population: values.population,
      households: values.households,
    });
    form.resetFields();
  };

  return (
    <Modal
      title="编辑村庄基础信息"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item name="name" label="村庄名称" rules={[{ required: true, message: '请输入村庄名称' }]}>
          <Input placeholder="例如:青溪村" />
        </Form.Item>
        <Form.Item name="township" label="所属乡镇" rules={[{ required: true, message: '请输入所属乡镇' }]}>
          <Input placeholder="例如:龙泉镇" />
        </Form.Item>
        <Form.Item name="population" label="人口" rules={[{ required: true, message: '请输入人口' }]}>
          <InputNumber style={{ width: '100%' }} min={0} placeholder="人" />
        </Form.Item>
        <Form.Item name="households" label="户数" rules={[{ required: true, message: '请输入户数' }]}>
          <InputNumber style={{ width: '100%' }} min={0} placeholder="户" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
