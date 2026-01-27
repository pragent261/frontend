import { Button, Typography } from "antd";
import { emptyState, supportAvatar } from "../figmaAssets";
import "../styles.css";

const { Text } = Typography;

export default function TaskProgress() {
  return (
    <div className="task-main">
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
          <div className="todo-card__tab todo-card__tab--active">确认合作(0)</div>
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

      <div className="support-tab">
        <img src={supportAvatar} alt="" />
        <span>客服咨询</span>
      </div>
    </div>
  );
}
