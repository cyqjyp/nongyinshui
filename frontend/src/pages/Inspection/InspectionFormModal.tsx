import { Modal, Form, Select, Input, Checkbox, Radio, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { createInspection } from '../../services/inspectionService';
import type { WaterPoint } from '../../types';

const CHECKLIST_ITEMS = ['水泵运行状态', '加氯/消毒装置', '水池液位', '管道渗漏情况', '设备通电与联网', '周边环境卫生'];

interface InspectionFormModalProps {
  open: boolean;
  waterPoints: WaterPoint[];
  onCancel: () => void;
  onCreated: () => void;
}

export default function InspectionFormModal({ open, waterPoints, onCancel, onCreated }: InspectionFormModalProps) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    const waterPoint = waterPoints.find((wp) => wp.id === values.waterPointId);
    await createInspection({
      waterPointId: values.waterPointId,
      villageId: waterPoint?.villageId ?? '',
      inspector: values.inspector,
      inspectedAt: values.inspectedAt.toISOString(),
      items: values.items,
      result: values.result,
      issueDescription: values.issueDescription,
    });
    form.resetFields();
    onCreated();
  };

  return (
    <Modal
      title="登记巡检记录"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ inspectedAt: dayjs(), result: '正常' }}
      >
        <Form.Item name="waterPointId" label="供水点" rules={[{ required: true, message: '请选择供水点' }]}>
          <Select options={waterPoints.map((wp) => ({ value: wp.id, label: wp.name }))} placeholder="请选择" />
        </Form.Item>
        <Form.Item name="inspector" label="巡检人" rules={[{ required: true, message: '请输入巡检人姓名' }]}>
          <Input placeholder="例如:张海涛" />
        </Form.Item>
        <Form.Item name="inspectedAt" label="巡检时间" rules={[{ required: true }]}>
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="items" label="巡检项目" rules={[{ required: true, message: '请至少选择一项' }]}>
          <Checkbox.Group options={CHECKLIST_ITEMS} />
        </Form.Item>
        <Form.Item name="result" label="巡检结果" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: '正常', value: '正常' },
              { label: '异常', value: '异常' },
            ]}
          />
        </Form.Item>
        <Form.Item name="issueDescription" label="问题描述(异常时填写)">
          <Input.TextArea rows={3} placeholder="请描述发现的问题及已采取的措施" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
