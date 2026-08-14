import { useMemo, useState } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  ScheduleOutlined,
  ToolOutlined,
  FileTextOutlined,
  BellOutlined,
  UserOutlined,
  HomeOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MENU_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '运营驾驶舱' },
  { key: '/smart-village', icon: <HomeOutlined />, label: '智慧村庄' },
  { key: '/infrastructure', icon: <DatabaseOutlined />, label: '基础台账管理' },
  { key: '/water-quality', icon: <ExperimentOutlined />, label: '水质安全管理' },
  { key: '/inspection', icon: <ScheduleOutlined />, label: '巡检与运行管理' },
  { key: '/repair', icon: <ToolOutlined />, label: '报修管理' },
  { key: '/elderly-care', icon: <HeartOutlined />, label: '独居老人关怀' },
  { key: '/reports', icon: <FileTextOutlined />, label: '报表导出' },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '运营驾驶舱',
  '/smart-village': '智慧村庄',
  '/infrastructure': '基础台账管理',
  '/water-quality': '水质安全管理',
  '/inspection': '巡检与运行管理',
  '/repair': '报修管理',
  '/elderly-care': '独居老人关怀',
  '/reports': '报表导出',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(() => {
    const match = MENU_ITEMS.find((item) => location.pathname.startsWith(item.key));
    return match?.key ?? '/dashboard';
  }, [location.pathname]);

  const userMenu = {
    items: [
      { key: 'role', label: '当前角色:公司管理人员', disabled: true },
      { key: 'logout', label: '退出登录' },
    ],
  };

  return (
    <Layout className="app-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={216}
        className="app-sider"
      >
        <div className="app-logo">
          <div className="app-logo-mark" />
          {!collapsed && (
            <div className="app-logo-text">
              <div className="app-logo-title">农村饮水安全管理平台</div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={MENU_ITEMS}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <span className="app-header-title">{PAGE_TITLES[selectedKey]}</span>
          <div className="app-header-actions">
            <Badge count={3} size="small" offset={[-2, 2]}>
              <BellOutlined className="app-header-icon" />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="app-header-user">
                <Avatar size={28} icon={<UserOutlined />} />
                <span className="text-label-sm">李峰 · 管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
