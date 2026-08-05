import { Modal, Form, Input, InputNumber, DatePicker, Radio } from 'antd';
import dayjs from 'dayjs';
import { createLabRecord } from '../../services/waterQualityService';

interface LabRecordFormModalProps {
  open: boolean;
  waterPointId: string;
  onCancel: () => void;
  onCreated: () => void;
}

export default function LabRecordFormModal({ open, waterPointId, onCancel, onCreated }: LabRecordFormModalProps) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    await createLabRecord({
      waterPointId,
      testDate: values.testDate.format('YYYY-MM-DD'),
      institution: values.institution,
      bacteriaCount: values.bacteriaCount,
      coliformDetected: values.coliformDetected === 'yes',
      turbidity: values.turbidity,
      residualChlorine: values.residualChlorine,
      ph: values.ph,
      conclusion: values.conclusion,
      reportFileName: values.reportFileName,
    });
    form.resetFields();
    onCreated();
  };

  return (
    <Modal
      title="登记第三方送检报告"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false} initialValues={{ testDate: dayjs(), coliformDetected: 'no', conclusion: '合格' }}>
        <Form.Item name="testDate" label="检测日期" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="institution" label="检测机构" rules={[{ required: true, message: '请输入检测机构' }]}>
          <Input placeholder="例如:县疾控中心水质检测所" />
        </Form.Item>
        <Form.Item name="bacteriaCount" label="菌落总数(CFU/mL)" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="coliformDetected" label="总大肠菌群" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: '未检出', value: 'no' },
              { label: '检出', value: 'yes' },
            ]}
          />
        </Form.Item>
        <Form.Item name="turbidity" label="浑浊度(NTU)" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
        </Form.Item>
        <Form.Item name="residualChlorine" label="游离余氯(mg/L)" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
        </Form.Item>
        <Form.Item name="ph" label="pH值" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} max={14} step={0.1} />
        </Form.Item>
        <Form.Item name="conclusion" label="检测结论" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: '合格', value: '合格' },
              { label: '不合格', value: '不合格' },
            ]}
          />
        </Form.Item>
        <Form.Item name="reportFileName" label="报告附件文件名(演示,不做真实上传)">
          <Input placeholder="例如:青溪水厂-2026Q3检测报告.pdf" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
