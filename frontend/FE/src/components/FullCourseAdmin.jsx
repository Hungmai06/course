import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Switch, Upload, message, Typography, Row, Col, Divider, Tag } from 'antd';
import { ThunderboltOutlined, SaveOutlined, LinkOutlined, PictureOutlined, DollarOutlined, UploadOutlined } from '@ant-design/icons';
import courseService from '../services/courseService';
import './FullCourseAdmin.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const FullCourseAdmin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('/bn.png');

  useEffect(() => {
    fetchFullCourse();
  }, []);

  const defaultDescription = `<h3>🎉 Bạn sẽ có gì trong gói Full Khóa Học?</h3>
<ul>
  <li><strong>1000+ Khóa học chọn lọc:</strong> Đầy đủ các lĩnh vực Lập trình, Ngoại ngữ, Thiết kế đồ họa, Marketing, Kinh doanh online...</li>
  <li><strong>Hệ thống 2 Link Google Drive:</strong> Link chính và Link dự phòng đồng bộ tốc độ cao.</li>
  <li><strong>Cập nhật miễn phí:</strong> Khóa học mới được upload và làm mới liên tục mỗi ngày.</li>
  <li><strong>Xem online & Tải về offline:</strong> Thoải mái xem trực tuyến hoặc tải trọn bộ về máy cá nhân lưu trữ.</li>
</ul>`;

  const fetchFullCourse = async () => {
    setLoading(true);
    try {
      const res = await courseService.getFullCourse();
      const data = res.data?.data || res.data;
      if (data) {
        form.setFieldsValue({
          name: data.name || 'Trọn Bộ Full Tất Cả Khóa Học Drive MH',
          description: data.description || defaultDescription,
          oldPrice: Number(data.oldPrice) || 100000000,
          newPrice: Number(data.newPrice) || 599000,
          linkDrive: data.linkDrive || '',
          linkDrive2: data.linkDrive2 || '',
          linkTest: data.linkTest || '',
          linkTest2: data.linkTest2 || '',
          isFullCourse: (data.isFullCourse !== undefined && data.isFullCourse !== null) ? data.isFullCourse : true,
        });
        setPreviewUrl(data.avatar || '/bn.png');
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin Full Khóa Học:', err);
      message.error('Không thể tải dữ liệu Full Khóa Học!');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const url = URL.createObjectURL(newFileList[0].originFileObj);
      setPreviewUrl(url);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const courseData = {
        name: values.name || 'Trọn Bộ Full Tất Cả Khóa Học Drive MH',
        description: values.description || defaultDescription,
        oldPrice: Number(values.oldPrice) || 100000000,
        newPrice: Number(values.newPrice) || 599000,
        linkDrive: values.linkDrive || '',
        linkDrive2: values.linkDrive2 || '',
        linkTest: values.linkTest || '',
        linkTest2: values.linkTest2 || '',
        isFullCourse: (values.isFullCourse !== undefined && values.isFullCourse !== null) ? values.isFullCourse : true,
      };

      let res;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        formData.append('data', new Blob([JSON.stringify(courseData)], { type: 'application/json' }));
        res = await courseService.updateFullCourse(formData);
      } else {
        res = await courseService.updateFullCourse(courseData);
      }

      const updated = res.data?.data || res.data;

      message.success('🎉 Cập nhật cài đặt Link & Nội dung Full Khóa Học thành công!');

      if (updated) {
        if (updated.avatar) {
          setPreviewUrl(updated.avatar);
        }
        form.setFieldsValue({
          name: updated.name || values.name,
          description: updated.description || values.description,
          oldPrice: Number(updated.oldPrice) || values.oldPrice,
          newPrice: Number(updated.newPrice) || values.newPrice,
          linkDrive: updated.linkDrive !== undefined ? updated.linkDrive : values.linkDrive,
          linkDrive2: updated.linkDrive2 !== undefined ? updated.linkDrive2 : values.linkDrive2,
          linkTest: updated.linkTest !== undefined ? updated.linkTest : values.linkTest,
          linkTest2: updated.linkTest2 !== undefined ? updated.linkTest2 : values.linkTest2,
          isFullCourse: (updated.isFullCourse !== undefined && updated.isFullCourse !== null) ? updated.isFullCourse : values.isFullCourse,
        });
      }
      setFileList([]);
    } catch (err) {
      console.error('Lỗi khi cập nhật Full Khóa Học:', err);
      message.error('Cập nhật thất bại. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="full-course-admin-container">
      <Card loading={loading} className="full-course-admin-card">
        <div className="card-header-row">
          <div>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
              <ThunderboltOutlined style={{ color: '#ec4899', marginRight: 10 }} />
              Cấu Hình Link & Nội Dung Full Khóa Học
            </Title>
            <Text type="secondary">
              Thiết lập 2 Link Drive chính/dự phòng, 2 Link Xem Thử và Nội Dung Mô Tả cho gói Full Khóa Học nằm ngay bên dưới Header.
            </Text>
          </div>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isFullCourse: true,
            name: 'Trọn Bộ Full Tất Cả Khóa Học Drive MH',
            oldPrice: 100000000,
            newPrice: 599000,
          }}
        >
          <Row gutter={24}>
            {/* LEFT SIDE: PRESET THUMBNAIL & DISPLAY INFO */}
            <Col xs={24} md={8}>
              <Card title={<><PictureOutlined /> Thumbnail / Banner Mặc Định</>} size="small" style={{ marginBottom: 20 }}>
                <div className="avatar-preview-wrapper">
                  <img src={previewUrl} alt="Thumbnail Preview" className="admin-avatar-img" onError={(e) => { e.target.src = '/bn.png'; }} />
                </div>
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <Tag color="purple" style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                    Mặc định: /bn.png (Public)
                  </Tag>
                  <div style={{ marginTop: 10 }}>
                    <Upload
                      accept="image/*"
                      beforeUpload={() => false}
                      fileList={fileList}
                      onChange={handleUploadChange}
                      maxCount={1}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} size="small">Thay thumbnail khác (Tùy chọn)</Button>
                    </Upload>
                  </div>
                </div>
              </Card>

              <Card title="Cấu Hình Giá & Hiển Thị" size="small">
                <Form.Item name="name" label="Tên Gói Full Khóa Học">
                  <Input placeholder="Trọn Bộ Full Tất Cả Khóa Học Drive MH" />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="oldPrice" label="Giá Gốc (đ)">
                      <InputNumber style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="newPrice" label="Giá Bán (đ)">
                      <InputNumber style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="isFullCourse" valuePropName="checked" label="Bật Hiển Thị Banner Giữa Header">
                  <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
                </Form.Item>
              </Card>
            </Col>

            {/* RIGHT SIDE: 2 DRIVE LINKS, 2 TEST LINKS & DESCRIPTION */}
            <Col xs={24} md={16}>
              <Card title={<><LinkOutlined style={{ color: '#2563eb' }} /> Quản Lý 2 Link Khóa Học & 2 Link Xem Thử</>} size="small" style={{ marginBottom: 20 }}>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="linkDrive"
                      label={<span style={{ fontWeight: 700, color: '#1d4ed8' }}>🚀 Link Khóa Học 1</span>}
                    >
                      <Input placeholder="https://drive.google.com/drive/folders/..." size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="linkDrive2"
                      label={<span style={{ fontWeight: 700, color: '#7e22ce' }}>🚀 Link Khóa Học 2</span>}
                    >
                      <Input placeholder="https://drive.google.com/drive/folders/..." size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="linkTest"
                      label={<span style={{ fontWeight: 700, color: '#047857' }}>🎬 Link Xem Thử 1</span>}
                    >
                      <Input placeholder="https://drive.google.com/drive/folders/..." size="large" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="linkTest2"
                      label={<span style={{ fontWeight: 700, color: '#0f766e' }}>🎬 Link Xem Thử 2</span>}
                    >
                      <Input placeholder="https://drive.google.com/drive/folders/..." size="large" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card title="📝 Nội Dung Mô Tả Chi Tiết" size="small">
                <Form.Item name="description">
                  <TextArea rows={6} placeholder="Nhập mô tả chi tiết quyền lợi gói Full Khóa Học..." />
                </Form.Item>
              </Card>

              <Form.Item style={{ marginTop: 20, textAlign: 'right' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    borderColor: 'transparent',
                    fontWeight: 800,
                    borderRadius: 10,
                    padding: '0 36px'
                  }}
                >
                  Lưu Cài Đặt Full Khóa Học
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default FullCourseAdmin;
