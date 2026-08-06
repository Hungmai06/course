import React, { useEffect, useState } from 'react';
import { categoryService } from '../../services/categoryService';
import Category from '../../components/Category';
import Author from '../../components/Author';
import User from '../../components/User';
import revenueService from '../../services/revenueService';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import LogoutButton from '../../components/LogoutButton';
import orderService from '../../services/orderService';
import Coupon from '../../components/Coupon';
import Order from '../../components/Order';
import Course from '../../components/Course';
import FreeCourse from '../../components/FreeCourse';
import Bill from '../../components/Bill';
import Item from '../../components/Item';
import { Layout, Menu, Row, Col, Card, Statistic, Table, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  GiftOutlined,
  DollarOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const sidebarItems = [
  { key: '', label: 'Thống kê', icon: <DashboardOutlined /> },
  { key: 'Category', label: 'Danh mục', icon: <TagsOutlined /> },
  { key: 'Author', label: 'Tác giả', icon: <TeamOutlined /> },
  { key: 'Course', label: 'Khóa học', icon: <BookOutlined /> },
  { key: 'Course Free', label: 'Khóa học Free & Học viên', icon: <GiftOutlined /> },
  { key: 'User', label: 'Người dùng', icon: <UserOutlined /> },
  { key: 'Coupon', label: 'Mã giảm giá', icon: <GiftOutlined /> },
  { key: 'Order', label: 'Đơn hàng', icon: <ShoppingCartOutlined /> },
  { key: 'Bill', label: 'Hóa đơn', icon: <DollarOutlined /> },
  { key: 'Item', label: 'Từ Khóa danh mục', icon: <AppstoreOutlined /> },
];

export default function AdminDashboard() {
  // SECTION STATE (move selectedSection to top)
  // Mặc định về giao diện chính (dashboard stats) khi reload
  const [selectedSection, setSelectedSection] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', roleName: '', username: '', password: '', confirmPassword: '', gender: 'MALE', phone: '', avatar: '' });
  const [loadingUser, setLoadingUser] = useState(false);
  const [userAvatarPreview, setUserAvatarPreview] = useState(null);
  const [userErrors, setUserErrors] = useState({});
  const [responseData, setResponseData] = useState(null);
  const [userPage, setUserPage] = useState(0);
  const [userSize, setUserSize] = useState(8);
  const [userSearch, setUserSearch] = useState('');
  const [responseDataCourse, setResponseDataCourse] = useState(null);
  const [orders, setOrders] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  const formatCurrency = (amount) =>
    amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;
        if (userSearch) {

          res = await userService.searchUser({ credential: userSearch, page: userPage, size: userSize });
        } else {
          res = await userService.getAllUsers(userPage, userSize);
        }
        if (res && res.data) {
          setResponseData(res.data);
        }
      } catch (error) {

      }
    };
    fetchData();
  }, [userPage, userSize, userSearch, selectedSection]);
  const totalUsers = responseData?.data?.totalElements || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await courseService.getAll();
        if (res && res.data) {
          setResponseDataCourse(res.data);
        }
      } catch (error) {

      }
    };
    fetchData();
  }, []);
  const totalCourses = responseDataCourse?.data?.totalElements || 0;

  useEffect(() => {
    revenueService.getMonthlyRevenue().then(res => {
      setMonthlyRevenue(res.data);
    });
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      revenueService.getDailyRevenue(selectedMonth).then(res => {
        setDailyRevenue(res.data);
      });
    }
  }, [selectedMonth]);

  const totalRevenueAll = monthlyRevenue.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  const totalOrdersAll = monthlyRevenue.reduce((sum, item) => sum + (item.totalOrders || 0), 0);

  const monthlyColumns = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
      render: (v) => <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{v}</span>
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (v) => <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.05rem' }}>{formatCurrency(v)}</span>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <button
          className="admin-action-btn"
          onClick={() => setSelectedMonth(record.month)}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '8px 22px',
            borderRadius: 9999,
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          Xem chi tiết
        </button>
      )
    },
  ];

  const dailyColumns = [
    {
      title: 'Ngày',
      dataIndex: 'day',
      key: 'day',
      render: (v) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{v}</span>
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (v) => <span style={{ fontWeight: 800, color: '#059669' }}>{formatCurrency(v)}</span>
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ padding: '24px 16px 16px', textAlign: 'center', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }} onClick={() => setSelectedSection('')}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
            <DashboardOutlined />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'block' }}>Khóa Học Drive MH</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Management</span>
        </div>
        <Menu theme="light" mode="inline" selectedKeys={[selectedSection]} onClick={({ key }) => setSelectedSection(key)} items={sidebarItems.map(i => ({ key: i.key, icon: i.icon, label: i.label }))} style={{ marginTop: 12 }} />
      </Sider>
      <Layout>
        <Header style={{ background: '#ffffff', padding: '16px 28px', height: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.4rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <DashboardOutlined style={{ color: '#2563eb' }} />
              {sidebarItems.find(i => i.key === selectedSection)?.label || 'Admin Control Panel'}
            </h2>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
              Quản trị dữ liệu người dùng, bài học và tài liệu hệ thống.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 9999,
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <HomeOutlined /> Về Trang chủ
            </Link>
            <LogoutButton />
          </div>
        </Header>
        <Content style={{ margin: '24px', background: '#f8fafc' }}>
          {!selectedSection && (
            <>
              <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      borderRadius: 20,
                      padding: '24px 20px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      boxShadow: '0 10px 25px rgba(37, 99, 235, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#ffffff', flexShrink: 0 }}>
                      <UserOutlined />
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
                        Tổng Người Dùng
                      </span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                        {totalUsers}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                      borderRadius: 20,
                      padding: '24px 20px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      boxShadow: '0 10px 25px rgba(124, 58, 237, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#ffffff', flexShrink: 0 }}>
                      <BookOutlined />
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
                        Tổng Khóa Học
                      </span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                        {totalCourses}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
                      borderRadius: 20,
                      padding: '24px 20px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      boxShadow: '0 10px 25px rgba(219, 39, 119, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#ffffff', flexShrink: 0 }}>
                      <ShoppingCartOutlined />
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
                        Tổng Đơn Hàng
                      </span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                        {totalOrdersAll}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      borderRadius: 20,
                      padding: '24px 20px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      boxShadow: '0 10px 25px rgba(5, 150, 105, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#ffffff', flexShrink: 0 }}>
                      <DollarOutlined />
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
                        Tổng Doanh Thu
                      </span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                        {formatCurrency(totalRevenueAll)}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Card title="Doanh thu theo tháng" style={{ marginBottom: 16 }}>
                <Table
                  dataSource={monthlyRevenue.map((r, idx) => ({ ...r, key: idx }))}
                  columns={monthlyColumns}
                  pagination={false}
                />
              </Card>

              {selectedMonth && (
                <Card title={`Doanh thu từng ngày trong tháng ${selectedMonth}`} style={{ marginBottom: 16 }}>
                  <Space style={{ marginBottom: 12 }}>
                    <Button onClick={() => setSelectedMonth('')}>Đóng chi tiết</Button>
                  </Space>
                  <Table dataSource={dailyRevenue.map((r, idx) => ({ ...r, key: idx }))} columns={dailyColumns} pagination={false} />
                </Card>
              )}
            </>
          )}

          {selectedSection === 'Author' && <Author />}
          {selectedSection === 'User' && <User />}
          {selectedSection === 'Category' && <Category />}
          {selectedSection === 'Course' && <Course />}
          {selectedSection === 'Course Free' && <FreeCourse />}
          {selectedSection === 'Coupon' && <Coupon />}
          {selectedSection === 'Order' && <Order />}
          {selectedSection === 'Bill' && <Bill />}
          {selectedSection === 'Item' && <Item />}
        </Content>
      </Layout>
    </Layout>
  );
}