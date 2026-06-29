import { Input, Layout } from "antd";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Briefcase,
  CircleUser,
  House,
  Mail,
  Search,
  Settings,
  Sparkles,
  Users,
  Wallet
} from "lucide-react";
import promoCoins from "../assets/promo-coins.png";
import pointsStar from "../assets/points-star.png";
import topAvatar from "../assets/top-avatar.png";
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
    { to: "/home", label: "主页", icon: <House /> },
    {
      to: "/tasks",
      label: "我的任务",
      icon: <CircleUser />,
      badge: taskBadgeCount
    },
    { to: "/talent", label: "寻找达人", icon: <Briefcase />, pill: "测试版" },
    { to: "/history", label: "历史邀约", icon: <Users /> },
    { to: "/review", label: "复盘统计", icon: <Wallet /> }
  ];

  return (
    <Layout className="app-shell">
      <Sider width={231} className="app-sider">
        <div className="sidebar__logo">
          <Sparkles className="sidebar__logo-icon" strokeWidth={2} />
          <span className="sidebar__logo-text">聚风</span>
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
              {item.badge !== undefined ? (
                <span className="sidebar__badge">
                  <Settings />
                  {item.badge}
                </span>
              ) : null}
              {item.pill ? (
                <span className="sidebar__pill">{item.pill}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__points">
          <img className="sidebar__points-icon" src={pointsStar} alt="" />
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
              <Search />
              <Input
                className="topbar__input"
                placeholder="请输入关键词..."
                variant="borderless"
              />
            </div>

            <div className="topbar__banner">
              <img className="topbar__banner-icon" src={promoCoins} alt="" />
              <span className="topbar__banner-text">
                现在充值即可获得额外积分奖励
              </span>
              <button className="topbar__banner-btn" type="button">
                立即存入资金
              </button>
            </div>

            <div className="topbar__actions">
              <Mail />
              <Bookmark />
              <span className="topbar__bell">
                <Bell />
                <span className="topbar__bell-dot">1</span>
              </span>
              <button className="topbar__profile" type="button">
                <div className="topbar__avatar">
                  <img src={topAvatar} alt="" />
                </div>
              </button>
            </div>
          </header>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
