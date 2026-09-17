import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Switch, Upload, message, Typography, Row, Col, Divider, Tag, Spin, Tooltip } from 'antd';
import { ThunderboltOutlined, SaveOutlined, LinkOutlined, PictureOutlined, DollarOutlined, UploadOutlined, ExportOutlined } from '@ant-design/icons';
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

  const watchedLinkDrive = Form.useWatch('linkDrive', form);
  const watchedLinkDrive2 = Form.useWatch('linkDrive2', form);
  const watchedLinkTest = Form.useWatch('linkTest', form);
  const watchedLinkTest2 = Form.useWatch('linkTest2', form);

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
          name: (data.name !== undefined && data.name !== null && data.name !== '') ? data.name : 'Trọn Bộ Full Tất Cả Khóa Học Drive MH',
          description: (data.description !== undefined && data.description !== null) ? data.description : defaultDescription,
          oldPrice: (data.oldPrice !== undefined && data.oldPrice !== null) ? Number(data.oldPrice) : 100000000,
          newPrice: (data.newPrice !== undefined && data.newPrice !== null) ? Number(data.newPrice) : 599000,
          linkDrive: data.linkDrive || '',
          linkDrive2: data.linkDrive2 || '',
          linkTest: data.linkTest || '',
          linkTest2: data.linkTest2 || '',
          isFullCourse: (data.isFullCourse !== undefined && data.isFullCourse !== null) ? Boolean(data.isFullCourse) : true,
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
        description: values.description !== undefined ? values.description : defaultDescription,
        oldPrice: values.oldPrice !== undefined ? Number(values.oldPrice) : 100000000,
        newPrice: values.newPrice !== undefined ? Number(values.newPrice) : 599000,
        linkDrive: values.linkDrive !== undefined ? values.linkDrive : '',
        linkDrive2: values.linkDrive2 !== undefined ? values.linkDrive2 : '',
        linkTest: values.linkTest !== undefined ? values.linkTest : '',
        linkTest2: values.linkTest2 !== undefined ? values.linkTest2 : '',
        isFullCourse: values.isFullCourse !== undefined ? Boolean(values.isFullCourse) : true,
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

      courseService.clearCache();
      message.success('🎉 Cập nhật cài đặt Link & Nội dung Full Khóa Học thành công!');

      if (updated) {
        if (updated.avatar) {
          setPreviewUrl(updated.avatar);
        }
        form.setFieldsValue({
          name: updated.name !== undefined ? updated.name : values.name,
          description: updated.description !== undefined ? updated.description : values.description,
          oldPrice: updated.oldPrice !== undefined ? Number(updated.oldPrice) : values.oldPrice,
          newPrice: updated.newPrice !== undefined ? Number(updated.newPrice) : values.newPrice,
          linkDrive: updated.linkDrive !== undefined ? updated.linkDrive : values.linkDrive,
          linkDrive2: updated.linkDrive2 !== undefined ? updated.linkDrive2 : values.linkDrive2,
          linkTest: updated.linkTest !== undefined ? updated.linkTest : values.linkTest,
          linkTest2: updated.linkTest2 !== undefined ? updated.linkTest2 : values.linkTest2,
          isFullCourse: updated.isFullCourse !== undefined ? Boolean(updated.isFullCourse) : values.isFullCourse,
        });
      }
      setFileList([]);
    } catch (err) {
      console.error('Lỗi khi cập nhật Full Khóa Học:', err);
      const serverError = err.response?.data?.message || err.message;
      message.error(`Cập nhật thất bại: ${serverError}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderLinkField = (name, labelText, placeholder, watchedValue, color, iconEmoji) => {
    const hasValue = Boolean(watchedValue && watchedValue.trim() !== '');
    return (
      <Form.Item
        name={name}
        label={<span style={{ fontWeight: 700, color }}>{iconEmoji} {labelText}</span>}
        help={
          hasValue ? (
            <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              ✅ Link đã lưu/nhập: <a href={watchedValue} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#1d4ed8', wordBreak: 'break-all' }}>{watchedValue}</a>
            </span>
          ) : (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Chưa thiết lập đường link</span>
          )
        }
      >
        <Input
          placeholder={placeholder}
          size="large"
          suffix={
            hasValue ? (
              <Tooltip title="Mở đường link này trong tab mới">
                <Button
                  type="primary"
                  size="small"
                  icon={<ExportOutlined />}
                  onClick={() => window.open(watchedValue, '_blank')}
                  style={{ borderRadius: 6, fontSize: 12, background: color, borderColor: color }}
                >
                  Mở link
                </Button>
              </Tooltip>
            ) : null
          }
        />
      </Form.Item>
    );
  };

  return (
    <div className="full-course-admin-container">
      <Card className="full-course-admin-card">
        <Spin spinning={loading} tip="Đang tải dữ liệu Full Khóa Học...">
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
              linkDrive: '',
              linkDrive2: '',
              linkTest: '',
              linkTest2: '',
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
                      {renderLinkField('linkDrive', 'Link Khóa Học 1', 'https://drive.google.com/drive/folders/...', watchedLinkDrive, '#1d4ed8', '🚀')}
                    </Col>

                    <Col span={12}>
                      {renderLinkField('linkDrive2', 'Link Khóa Học 2', 'https://drive.google.com/drive/folders/...', watchedLinkDrive2, '#7e22ce', '🚀')}
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      {renderLinkField('linkTest', 'Link Xem Thử 1', 'https://drive.google.com/drive/folders/...', watchedLinkTest, '#047857', '🎬')}
                    </Col>

                    <Col span={12}>
                      {renderLinkField('linkTest2', 'Link Xem Thử 2', 'https://drive.google.com/drive/folders/...', watchedLinkTest2, '#0f766e', '🎬')}
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
        </Spin>
      </Card>
    </div>
  );
};

export default FullCourseAdmin;

