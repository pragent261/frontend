import { Badge, Input, Layout } from "antd";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BellOutlined,
  HistoryOutlined,
  HomeOutlined,
  MailOutlined,
  SearchOutlined,
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  RocketOutlined
} from "@ant-design/icons";
import { campaignBanner, sidebarStar, topAvatar } from "../figmaAssets";
import { apiFetch } from "../lib/api";
import "../styles.css";

const { Sider, Content } = Layout;

type DashboardSummary = {
  collaborations_need_confirm: number;
  collaborations_need_ship: number;
  collaborations_need_script_review: number;
};

export default function AppShell() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSummary = async () => {
      try {
        const response = await apiFetch("/v1/dashboard/my-tasks", {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("summary_request_failed");
        }

        const data = (await response.json()) as DashboardSummary;
        setSummary(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load sidebar summary", error);
        setSummary(null);
      }
    };

    loadSummary();

    return () => {
      controller.abort();
    };
  }, []);

  const taskBadgeCount = summary
    ? summary.collaborations_need_confirm +
      summary.collaborations_need_ship +
      summary.collaborations_need_script_review
    : 0;

  const navItems = [
    { to: "/home", label: "主页", icon: <HomeOutlined /> },
    {
      to: "/tasks",
      label: "我的任务",
      icon: <UserOutlined />,
      badge: taskBadgeCount > 0 ? String(taskBadgeCount) : ""
    },
    { to: "/plan", label: "投放计划", icon: <RocketOutlined /> },
    { to: "/talent", label: "寻找达人", icon: <TeamOutlined />, pill: "测试版" },
    { to: "/history", label: "历史邀约", icon: <HistoryOutlined /> },
    { to: "/review", label: "复盘统计", icon: <BookOutlined /> }
  ];

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
              {item.badge ? (
                <span className="sidebar__badge">{item.badge}</span>
              ) : null}
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
          <header className="topbar">
            <div className="topbar__search">
              <SearchOutlined />
              <Input
                className="topbar__input"
                placeholder="请输入关键词..."
                bordered={false}
              />
            </div>

            <div className="topbar__banner">
              <img className="topbar__banner-icon" src={campaignBanner} alt="" />
              <span className="topbar__banner-text">
                现在充值即可获得额外积分奖励
              </span>
              <div className="topbar__banner-btn">立即存入资金</div>
            </div>

            <div className="topbar__actions">
              <MailOutlined />
              <BookOutlined className="topbar__bookmark" />
              <Badge count={1} size="small" color="#dc3848">
                <BellOutlined style={{ fontSize: "21px" }} />
              </Badge>
              <div className="topbar__profile">
                <div className="topbar__avatar">
                  <img src={topAvatar} alt="" />
                </div>
                <span className="topbar__profile-text">登录/注册</span>
              </div>
            </div>
          </header>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
