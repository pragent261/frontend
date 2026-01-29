import { Button, Input, Typography } from "antd";
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

type TaskItem = {
  id: string;
  collaboration_id: string;
  collaboration_status: string;
  influencer_id: string;
  shipping_tracking_number?: string | null;
  script_text?: string | null;
  campaign: {
    id: string;
    name: string;
    status: string;
  } | null;
  latest_message: unknown | null;
  script_submission: unknown | null;
};

type TaskListResponse = {
  items: TaskItem[];
  next_cursor: string | null;
};

const emptySummary: DashboardSummary = {
  campaigns_total: 0,
  collaborations_active: 0,
  collaborations_need_confirm: 0,
  collaborations_need_ship: 0,
  collaborations_need_script_review: 0,
  scripts_pending: 0
};

type TaskTab = "need_confirm" | "need_ship" | "need_script_review";

export default function TaskProgress() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskTab>("need_confirm");
  const [confirmTasks, setConfirmTasks] = useState<TaskItem[] | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [shipTasks, setShipTasks] = useState<TaskItem[] | null>(null);
  const [shipStatus, setShipStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [shipError, setShipError] = useState<string | null>(null);
  const [shipTracking, setShipTracking] = useState<Record<string, string>>({});
  const [shipValidation, setShipValidation] = useState<Record<string, string>>(
    {}
  );
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [scriptTasks, setScriptTasks] = useState<TaskItem[] | null>(null);
  const [scriptStatus, setScriptStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [approvingScriptId, setApprovingScriptId] = useState<string | null>(
    null
  );
  const [approvingId, setApprovingId] = useState<string | null>(null);

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

  useEffect(() => {
    const controller = new AbortController();

    const loadNeedConfirm = async () => {
      setConfirmStatus("loading");
      setConfirmError(null);
      try {
        const response = await fetch("/v1/tasks?type=need_confirm", {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("need_confirm_request_failed");
        }

        const data = (await response.json()) as TaskListResponse;
        setConfirmTasks(data.items ?? []);
        setConfirmStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load need confirm tasks", error);
        setConfirmTasks([]);
        setConfirmStatus("error");
        setConfirmError("确认合作列表加载失败。");
      }
    };

    loadNeedConfirm();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "need_ship" || shipTasks !== null) {
      return;
    }

    const controller = new AbortController();

    const loadNeedShip = async () => {
      setShipStatus("loading");
      setShipError(null);
      try {
        const response = await fetch("/v1/tasks?type=need_ship", {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("need_ship_request_failed");
        }

        const data = (await response.json()) as TaskListResponse;
        setShipTasks(data.items ?? []);
        setShipStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load need ship tasks", error);
        setShipTasks([]);
        setShipStatus("error");
        setShipError("产品寄送列表加载失败。");
      }
    };

    loadNeedShip();

    return () => {
      controller.abort();
    };
  }, [activeTab, shipTasks]);

  useEffect(() => {
    if (activeTab !== "need_script_review" || scriptTasks !== null) {
      return;
    }

    const controller = new AbortController();

    const loadNeedScriptReview = async () => {
      setScriptStatus("loading");
      setScriptError(null);
      try {
        const response = await fetch("/v1/tasks?type=need_script_review", {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("need_script_review_request_failed");
        }

        const data = (await response.json()) as TaskListResponse;
        setScriptTasks(data.items ?? []);
        setScriptStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load need script review tasks", error);
        setScriptTasks([]);
        setScriptStatus("error");
        setScriptError("脚本审核列表加载失败。");
      }
    };

    loadNeedScriptReview();

    return () => {
      controller.abort();
    };
  }, [activeTab, scriptTasks]);

  const data = summary ?? emptySummary;
  const confirmCount =
    confirmTasks !== null
      ? confirmTasks.length
      : data.collaborations_need_confirm;
  const shipCount =
    shipTasks !== null ? shipTasks.length : data.collaborations_need_ship;
  const scriptCount =
    scriptTasks !== null
      ? scriptTasks.length
      : data.collaborations_need_script_review;

  const handleApprove = async (collaborationId: string) => {
    setApprovingId(collaborationId);
    setConfirmError(null);
    try {
      const response = await fetch(
        `/v1/tasks/${collaborationId}/actions/approve-collaboration`,
        {
          method: "POST"
        }
      );

      if (!response.ok) {
        throw new Error("approve_collaboration_failed");
      }

      setConfirmTasks((prev) =>
        prev
          ? prev.filter((item) => item.collaboration_id !== collaborationId)
          : prev
      );
    } catch (error) {
      console.error("Failed to approve collaboration", error);
      setConfirmError("确认合作失败，请稍后重试。");
    } finally {
      setApprovingId(null);
    }
  };

  const handleShipConfirm = async (collaborationId: string) => {
    const trackingNumber = shipTracking[collaborationId]?.trim();
    if (!trackingNumber) {
      setShipValidation((prev) => ({
        ...prev,
        [collaborationId]: "快递单号不能为空"
      }));
      setShipError("请先填写快递单号。");
      return;
    }
    setShippingId(collaborationId);
    setShipError(null);
    try {
      const response = await fetch(
        `/v1/tasks/${collaborationId}/actions/confirm-ship`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ tracking_number: trackingNumber })
        }
      );

      if (!response.ok) {
        throw new Error("confirm_ship_failed");
      }

      setShipTasks((prev) =>
        prev
          ? prev.filter((item) => item.collaboration_id !== collaborationId)
          : prev
      );
      setShipTracking((prev) => {
        const next = { ...prev };
        delete next[collaborationId];
        return next;
      });
      setShipValidation((prev) => {
        const next = { ...prev };
        delete next[collaborationId];
        return next;
      });
    } catch (error) {
      console.error("Failed to confirm ship", error);
      setShipError("确认发货失败，请稍后重试。");
    } finally {
      setShippingId(null);
    }
  };

  const handleApproveScript = async (collaborationId: string) => {
    setApprovingScriptId(collaborationId);
    setScriptError(null);
    try {
      const response = await fetch(
        `/v1/tasks/${collaborationId}/actions/approve-script`,
        {
          method: "POST"
        }
      );

      if (!response.ok) {
        throw new Error("approve_script_failed");
      }

      setScriptTasks((prev) =>
        prev
          ? prev.filter((item) => item.collaboration_id !== collaborationId)
          : prev
      );
    } catch (error) {
      console.error("Failed to approve script", error);
      setScriptError("批准脚本失败，请稍后重试。");
    } finally {
      setApprovingScriptId(null);
    }
  };

  const renderEmpty = () => (
    <div className="todo-card__empty">
      <img src={emptyState} alt="" />
      <Text>暂无待处理任务</Text>
    </div>
  );

  const renderConfirmList = () => (
    <>
      {confirmStatus === "loading" ? (
        <Text className="todo-card__status">正在加载确认合作...</Text>
      ) : null}
      {confirmStatus === "error" && confirmError ? (
        <Text className="todo-card__status todo-card__status--error">
          {confirmError}
        </Text>
      ) : null}
      {confirmTasks && confirmTasks.length > 0
        ? confirmTasks.map((item) => (
            <div key={item.id} className="collab-card">
              <div className="collab-card__header">
                <div>
                  <Text className="collab-card__title">
                    {item.campaign?.name ?? "未命名项目"}
                  </Text>
                  <Text className="collab-card__meta">
                    达人：{item.influencer_id}
                  </Text>
                </div>
                <span className="collab-card__status">待确认</span>
              </div>
              <div className="collab-card__body">
                <div className="collab-card__row">
                  <Text type="secondary">活动状态</Text>
                  <Text className="collab-card__value">
                    {item.campaign?.status ?? "未知"}
                  </Text>
                </div>
              </div>
              <div className="collab-card__actions">
                <Button
                  type="primary"
                  loading={approvingId === item.collaboration_id}
                  onClick={() => handleApprove(item.collaboration_id)}
                >
                  确认合作
                </Button>
                <Button>拒绝合作</Button>
              </div>
            </div>
          ))
        : null}
      {confirmTasks && confirmTasks.length === 0 && confirmStatus !== "loading"
        ? renderEmpty()
        : null}
    </>
  );

  const renderShipList = () => (
    <>
      {shipStatus === "loading" ? (
        <Text className="todo-card__status">正在加载产品寄送...</Text>
      ) : null}
      {shipStatus === "error" && shipError ? (
        <Text className="todo-card__status todo-card__status--error">
          {shipError}
        </Text>
      ) : null}
      {shipTasks && shipTasks.length > 0
        ? shipTasks.map((item) => (
            <div key={item.id} className="collab-card">
              <div className="collab-card__header">
                <div>
                  <Text className="collab-card__title">
                    {item.campaign?.name ?? "未命名项目"}
                  </Text>
                  <Text className="collab-card__meta">
                    达人：{item.influencer_id}
                  </Text>
                </div>
                <span className="collab-card__status">待寄送</span>
              </div>
              <div className="collab-card__body">
                <div className="collab-card__row">
                  <Text type="secondary">合作状态</Text>
                  <Text className="collab-card__value">
                    {item.collaboration_status}
                  </Text>
                </div>
                <div className="collab-card__row">
                  <Text type="secondary">活动状态</Text>
                  <Text className="collab-card__value">
                    {item.campaign?.status ?? "未知"}
                  </Text>
                </div>
              </div>
              <div className="collab-card__ship">
                <Input
                  placeholder="填写快递单号"
                  value={shipTracking[item.collaboration_id] ?? ""}
                  status={
                    shipValidation[item.collaboration_id] ? "error" : undefined
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setShipTracking((prev) => ({
                      ...prev,
                      [item.collaboration_id]: value
                    }));
                    if (value.trim()) {
                      setShipValidation((prev) => {
                        if (!prev[item.collaboration_id]) {
                          return prev;
                        }
                        const next = { ...prev };
                        delete next[item.collaboration_id];
                        return next;
                      });
                    }
                  }}
                  onBlur={() => {
                    const value = shipTracking[item.collaboration_id]?.trim();
                    if (!value) {
                      setShipValidation((prev) => ({
                        ...prev,
                        [item.collaboration_id]: "快递单号不能为空"
                      }));
                    } else {
                      setShipValidation((prev) => {
                        const next = { ...prev };
                        delete next[item.collaboration_id];
                        return next;
                      });
                    }
                  }}
                />
                <Button
                  type="primary"
                  loading={shippingId === item.collaboration_id}
                  onClick={() => handleShipConfirm(item.collaboration_id)}
                >
                  确认发货
                </Button>
              </div>
              {shipValidation[item.collaboration_id] ? (
                <Text className="collab-card__error">
                  {shipValidation[item.collaboration_id]}
                </Text>
              ) : null}
            </div>
          ))
        : null}
      {shipTasks && shipTasks.length === 0 && shipStatus !== "loading"
        ? renderEmpty()
        : null}
    </>
  );

  const renderScriptReview = () => (
    <>
      {scriptStatus === "loading" ? (
        <Text className="todo-card__status">正在加载脚本审核...</Text>
      ) : null}
      {scriptStatus === "error" && scriptError ? (
        <Text className="todo-card__status todo-card__status--error">
          {scriptError}
        </Text>
      ) : null}
      {scriptTasks && scriptTasks.length > 0
        ? scriptTasks.map((item) => (
            <div key={item.id} className="collab-card">
              <div className="collab-card__header">
                <div>
                  <Text className="collab-card__title">
                    {item.campaign?.name ?? "未命名项目"}
                  </Text>
                  <Text className="collab-card__meta">
                    达人：{item.influencer_id}
                  </Text>
                </div>
                <span className="collab-card__status">待审核</span>
              </div>
              <div className="collab-card__body">
                <div className="collab-card__row">
                  <Text type="secondary">合作状态</Text>
                  <Text className="collab-card__value">
                    {item.collaboration_status}
                  </Text>
                </div>
                <div className="collab-card__row">
                  <Text type="secondary">活动状态</Text>
                  <Text className="collab-card__value">
                    {item.campaign?.status ?? "未知"}
                  </Text>
                </div>
              </div>
              {item.script_text ? (
                <div className="collab-card__script">
                  <Text type="secondary">脚本内容</Text>
                  <Text className="collab-card__script-text">
                    {item.script_text}
                  </Text>
                </div>
              ) : null}
              <div className="collab-card__actions">
                <Button
                  type="primary"
                  loading={approvingScriptId === item.collaboration_id}
                  onClick={() => handleApproveScript(item.collaboration_id)}
                >
                  批准脚本
                </Button>
              </div>
            </div>
          ))
        : null}
      {scriptTasks && scriptTasks.length === 0 && scriptStatus !== "loading"
        ? renderEmpty()
        : null}
    </>
  );

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
          <button
            type="button"
            className={`todo-card__tab${
              activeTab === "need_confirm" ? " todo-card__tab--active" : ""
            }`}
            onClick={() => setActiveTab("need_confirm")}
          >
            确认合作({confirmCount})
          </button>
          <button
            type="button"
            className={`todo-card__tab${
              activeTab === "need_ship" ? " todo-card__tab--active" : ""
            }`}
            onClick={() => setActiveTab("need_ship")}
          >
            产品寄送 ({shipCount})
          </button>
          <button
            type="button"
            className={`todo-card__tab${
              activeTab === "need_script_review"
                ? " todo-card__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("need_script_review")}
          >
            脚本审核 ({scriptCount})
          </button>
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
          尽快审核合作申请可以确保网红的档期，并提高合作成功率；
          如果反馈太慢，网红更容易失联。
        </div>
        <div className="todo-card__list">
          {activeTab === "need_confirm" ? renderConfirmList() : null}
          {activeTab === "need_ship" ? renderShipList() : null}
          {activeTab === "need_script_review" ? renderScriptReview() : null}
        </div>
      </section>

      <div className="support-tab">
        <img src={supportAvatar} alt="" />
        <span>客服咨询</span>
      </div>
    </div>
  );
}
