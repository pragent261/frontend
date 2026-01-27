import { Badge, Button, Input, Typography } from "antd";
import {
  BellOutlined,
  BookOutlined,
  HistoryOutlined,
  HomeOutlined,
  MailOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  campaignBanner,
  emptyState,
  sidebarStar,
  supportAvatar,
  topAvatar
} from "../figmaAssets";
import "../styles.css";

const { Text } = Typography;

export default function TaskProgress() {
  return (
    <div className="task-shell">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <img className="sidebar__logo-icon" src={sidebarStar} alt="" />
          <Text className="sidebar__logo-text">Braintrust</Text>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__item">
            <HomeOutlined />
            <Text>主页</Text>
          </div>
          <div className="sidebar__item">
            <UserOutlined />
            <Text>我的任务</Text>
            <span className="sidebar__badge">0</span>
          </div>
          <div className="sidebar__item sidebar__item--active">
            <TeamOutlined />
            <Text>寻找达人</Text>
            <span className="sidebar__pill">测试版</span>
          </div>
          <div className="sidebar__item">
            <HistoryOutlined />
            <Text>历史邀约</Text>
          </div>
          <div className="sidebar__item">
            <BookOutlined />
            <Text>复盘统计</Text>
          </div>
        </nav>

        <div className="sidebar__points">
          <div className="sidebar__points-icon" />
          <Text className="sidebar__points-text">你拥有 无限 个积分</Text>
          <Button className="sidebar__points-btn">添加积分</Button>
        </div>
      </aside>

      <main className="task-main">
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
            <Text className="topbar__banner-text">
              现在充值即可获得额外积分奖励
            </Text>
            <div className="topbar__banner-btn">立即存入资金</div>
          </div>

          <div className="topbar__actions">
            <MailOutlined />
            <div className="topbar__bookmark" />
            <Badge count={1} size="small" color="#dc3848">
              <BellOutlined />
            </Badge>
            <div className="topbar__avatar">
              <img src={topAvatar} alt="" />
            </div>
          </div>
        </header>

        <div className="task-main__toolbar">
          <div className="task-main__welcome">
            <Text className="task-main__welcome-text">欢迎回来</Text>
            <span className="task-main__welcome-emoji">👋</span>
          </div>
          <Button className="task-main__cta">创建投放计划</Button>
        </div>

        <section className="task-main__panel">
          <Text className="todo-card__title">投放代办事项</Text>
          <div className="todo-card__tabs">
            <div className="todo-card__tab todo-card__tab--active">
              确认合作(0)
            </div>
            <div className="todo-card__tab">产品寄送 (0)</div>
            <div className="todo-card__tab">脚本审核 (0)</div>
          </div>
          <div className="todo-card__hint">
            <span className="todo-card__line" />
            <Text>你的 24/7 网红营销 AI智能体员工</Text>
            <div className="todo-card__hint-icon" />
          </div>
          <div className="todo-card__note">
            尽快审核合作申请可以确保网红的档期，并提高合作成功率；如果反馈太慢，网红更容易失联。
          </div>
          <div className="todo-card__empty">
            <img src={emptyState} alt="" />
            <Text>暂无待处理任务</Text>
          </div>
        </section>
      </main>

      <div className="support-tab">
        <img src={supportAvatar} alt="" />
        <span>客服咨询</span>
      </div>
    </div>
  );
}
