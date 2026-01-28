import { Button, Typography } from "antd";
import { useEffect, useState } from "react";
import { emptyState, supportAvatar } from "../figmaAssets";
import "../styles.css";

const { Text } = Typography;

type DashboardSummary = {
  campaigns_total: number;
  collaborations_active: number;
  collaborations_need_confirm: number;
  collaborations_need_ship: number;
  collaborations_need_script_review: number;
  scripts_pending: number;
};

const emptySummary: DashboardSummary = {
  campaigns_total: 0,
  collaborations_active: 0,
  collaborations_need_confirm: 0,
  collaborations_need_ship: 0,
  collaborations_need_script_review: 0,
  scripts_pending: 0
};

export default function TaskProgress() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSummary = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const response = await fetch("/v1/dashboard/summary", {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("summary_request_failed");
        }

        const data = (await response.json()) as DashboardSummary;
        setSummary(data);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load dashboard summary", error);
        setSummary(null);
        setStatus("error");
        setErrorMessage("数据加载失败，已显示默认统计。");
      }
    };

    loadSummary();

    return () => {
      controller.abort();
    };
  }, []);

  const data = summary ?? emptySummary;

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
          <div className="todo-card__tab todo-card__tab--active">
            确认合作({data.collaborations_need_confirm})
          </div>
          <div className="todo-card__tab">产品寄送 ({data.collaborations_need_ship})</div>
          <div className="todo-card__tab">脚本审核 ({data.collaborations_need_script_review})</div>
        </div>
        <div className="todo-card__hint">
          <span className="todo-card__line" />
          <Text>你的 24/7 网红营销 AI智能体员工</Text>
          <div className="todo-card__hint-icon" />
        </div>
        {status === "loading" ? (
          <Text className="todo-card__status">正在加载数据...</Text>
        ) : null}
        {status === "error" && errorMessage ? (
          <Text className="todo-card__status todo-card__status--error">
            {errorMessage}
          </Text>
        ) : null}
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
