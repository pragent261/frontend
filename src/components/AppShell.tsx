import { Layout } from "antd";
import { NavLink, Outlet } from "react-router-dom";
import {
  BookOutlined,
  HistoryOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { sidebarStar } from "../figmaAssets";
import "../styles.css";

const { Sider, Content } = Layout;

const navItems = [
  { to: "/home", label: "主页", icon: <HomeOutlined /> },
  { to: "/tasks", label: "我的任务", icon: <UserOutlined />, badge: "0" },
  { to: "/talent", label: "寻找达人", icon: <TeamOutlined />, pill: "测试版" },
  { to: "/history", label: "历史邀约", icon: <HistoryOutlined /> },
  { to: "/review", label: "复盘统计", icon: <BookOutlined /> }
];

export default function AppShell() {
  return (
    <Layout className="app-shell">
      <Sider width={240} className="app-sider">
        <div className="sidebar__logo">
          <img className="sidebar__logo-icon" src={sidebarStar} alt="" />
          <span className="sidebar__logo-text">Braintrust</span>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__item${isActive ? " sidebar__item--active" : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? <span className="sidebar__badge">{item.badge}</span> : null}
              {item.pill ? <span className="sidebar__pill">{item.pill}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__points">
          <div className="sidebar__points-icon" />
          <div className="sidebar__points-text">你拥有 无限 个积分</div>
          <button className="sidebar__points-btn" type="button">
            添加积分
          </button>
        </div>
      </Sider>

      <Layout>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
