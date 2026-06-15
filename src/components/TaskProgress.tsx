import { Button, Input, Typography, Spin } from "antd";
import { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  ThunderboltFilled,
  UserOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { supportAvatar } from "../figmaAssets";
import { apiFetch } from "../lib/api";
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
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskTab>("need_confirm");
  const [confirmTasks, setConfirmTasks] = useState<TaskItem[] | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<"loading" | "success" | "error">("loading");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [shipTasks, setShipTasks] = useState<TaskItem[] | null>(null);
  const [shipStatus, setShipStatus] = useState<"loading" | "success" | "error">("loading");
  const [shipError, setShipError] = useState<string | null>(null);
  const [shipTracking, setShipTracking] = useState<Record<string, string>>({});
  const [shipValidation, setShipValidation] = useState<Record<string, string>>({});
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [scriptTasks, setScriptTasks] = useState<TaskItem[] | null>(null);
  const [scriptStatus, setScriptStatus] = useState<"loading" | "success" | "error">("loading");
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [approvingScriptId, setApprovingScriptId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadSummary = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const response = await apiFetch("/v1/dashboard/my-tasks", { signal: controller.signal });
        if (!response.ok) throw new Error("summary_request_failed");
        const data = (await response.json()) as DashboardSummary;
        setSummary(data);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setSummary(null);
        setStatus("error");
        setErrorMessage("数据加载失败，已显示默认统计。");
      }
    };
    loadSummary();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setConfirmStatus("loading");
      setConfirmError(null);
      try {
        const response = await apiFetch("/v1/tasks?type=need_confirm", { signal: controller.signal });
        if (!response.ok) throw new Error("need_confirm_request_failed");
        const data = (await response.json()) as TaskListResponse;
        setConfirmTasks(data.items ?? []);
        setConfirmStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setConfirmTasks([]);
        setConfirmStatus("error");
        setConfirmError("确认合作列表加载失败。");
      }
    };
    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (activeTab !== "need_ship" || shipTasks !== null) return;
    const controller = new AbortController();
    const load = async () => {
      setShipStatus("loading");
      setShipError(null);
      try {
        const response = await apiFetch("/v1/tasks?type=need_ship", { signal: controller.signal });
        if (!response.ok) throw new Error("need_ship_request_failed");
        const data = (await response.json()) as TaskListResponse;
        setShipTasks(data.items ?? []);
        setShipStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setShipTasks([]);
        setShipStatus("error");
        setShipError("产品寄送列表加载失败。");
      }
    };
    load();
    return () => controller.abort();
  }, [activeTab, shipTasks]);

  useEffect(() => {
    if (activeTab !== "need_script_review" || scriptTasks !== null) return;
    const controller = new AbortController();
    const load = async () => {
      setScriptStatus("loading");
      setScriptError(null);
      try {
        const response = await apiFetch("/v1/tasks?type=need_script_review", { signal: controller.signal });
        if (!response.ok) throw new Error("need_script_review_request_failed");
        const data = (await response.json()) as TaskListResponse;
        setScriptTasks(data.items ?? []);
        setScriptStatus("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        setScriptTasks([]);
        setScriptStatus("error");
        setScriptError("脚本审核列表加载失败。");
      }
    };
    load();
    return () => controller.abort();
  }, [activeTab, scriptTasks]);

  const data = summary ?? emptySummary;
  const confirmCount = confirmTasks !== null ? confirmTasks.length : data.collaborations_need_confirm;
  const shipCount = shipTasks !== null ? shipTasks.length : data.collaborations_need_ship;
  const scriptCount = scriptTasks !== null ? scriptTasks.length : data.collaborations_need_script_review;
  const totalCount = confirmCount + shipCount + scriptCount;

  const handleApprove = async (collaborationId: string) => {
    setApprovingId(collaborationId);
    setConfirmError(null);
    try {
      const response = await apiFetch(`/v1/tasks/${collaborationId}/actions/approve-collaboration`, { method: "POST" });
      if (!response.ok) throw new Error("approve_collaboration_failed");
      setConfirmTasks((prev) => prev ? prev.filter((item) => item.collaboration_id !== collaborationId) : prev);
    } catch {
      setConfirmError("确认合作失败，请稍后重试。");
    } finally {
      setApprovingId(null);
    }
  };

  const handleShipConfirm = async (collaborationId: string) => {
    const trackingNumber = shipTracking[collaborationId]?.trim();
    if (!trackingNumber) {
      setShipValidation((prev) => ({ ...prev, [collaborationId]: "快递单号不能为空" }));
      return;
    }
    setShippingId(collaborationId);
    setShipError(null);
    try {
      const response = await apiFetch(`/v1/tasks/${collaborationId}/actions/confirm-ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_number: trackingNumber })
      });
      if (!response.ok) throw new Error("confirm_ship_failed");
      setShipTasks((prev) => prev ? prev.filter((item) => item.collaboration_id !== collaborationId) : prev);
      setShipTracking((prev) => { const n = { ...prev }; delete n[collaborationId]; return n; });
      setShipValidation((prev) => { const n = { ...prev }; delete n[collaborationId]; return n; });
    } catch {
      setShipError("确认发货失败，请稍后重试。");
    } finally {
      setShippingId(null);
    }
  };

  const handleApproveScript = async (collaborationId: string) => {
    setApprovingScriptId(collaborationId);
    setScriptError(null);
    try {
      const response = await apiFetch(`/v1/tasks/${collaborationId}/actions/approve-script`, { method: "POST" });
      if (!response.ok) throw new Error("approve_script_failed");
      setScriptTasks((prev) => prev ? prev.filter((item) => item.collaboration_id !== collaborationId) : prev);
    } catch {
      setScriptError("批准脚本失败，请稍后重试。");
    } finally {
      setApprovingScriptId(null);
    }
  };

  const renderEmpty = (message: string = "暂无待处理任务") => (
    <div className="tasks-empty">
      <div className="tasks-empty__icon">✅</div>
      <div className="tasks-empty__title">{message}</div>
      <div className="tasks-empty__sub">所有任务已处理完毕，做得很好！</div>
    </div>
  );

  const renderError = (msg: string) => (
    <div className="tasks-error">
      <CloseCircleOutlined style={{ color: "#ef4444", fontSize: 20 }} />
      <span>{msg}</span>
    </div>
  );

  const renderConfirmList = () => {
    if (confirmStatus === "loading") return <div className="tasks-loading"><Spin /></div>;
    if (confirmStatus === "error" && confirmError) return renderError(confirmError);
    if (!confirmTasks || confirmTasks.length === 0) return renderEmpty();
    return (
      <div className="task-list">
        {confirmTasks.map((item) => (
          <div key={item.id} className="task-card">
            <div className="task-card__stripe" />
            <div className="task-card__inner">
              <div className="task-card__top">
                <div className="task-card__info">
                  <span className="task-card__campaign">{item.campaign?.name ?? "未命名项目"}</span>
                  <span className="task-card__influencer">
                    <UserOutlined style={{ fontSize: 11 }} />
                    达人：{item.influencer_id}
                  </span>
                </div>
                <span className="task-card__badge task-card__badge--confirm">待确认</span>
              </div>
              <div className="task-card__meta">
                <span className="task-card__meta-pill">
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>活动状态</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{item.campaign?.status ?? "未知"}</span>
                </span>
              </div>
              <div className="task-card__actions">
                <Button onClick={() => handleApprove(item.collaboration_id)} style={{ color: "#6b7280" }}>
                  拒绝合作
                </Button>
                <Button
                  type="primary"
                  loading={approvingId === item.collaboration_id}
                  onClick={() => handleApprove(item.collaboration_id)}
                  className="task-card__primary-btn"
                >
                  <CheckCircleOutlined /> 确认合作
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderShipList = () => {
    if (shipStatus === "loading") return <div className="tasks-loading"><Spin /></div>;
    if (shipStatus === "error" && shipError) return renderError(shipError);
    if (!shipTasks || shipTasks.length === 0) return renderEmpty();
    return (
      <div className="task-list">
        {shipTasks.map((item) => (
          <div key={item.id} className="task-card">
            <div className="task-card__stripe task-card__stripe--ship" />
            <div className="task-card__inner">
              <div className="task-card__top">
                <div className="task-card__info">
                  <span className="task-card__campaign">{item.campaign?.name ?? "未命名项目"}</span>
                  <span className="task-card__influencer">
                    <UserOutlined style={{ fontSize: 11 }} />
                    达人：{item.influencer_id}
                  </span>
                </div>
                <span className="task-card__badge task-card__badge--ship">待寄送</span>
              </div>
              <div className="task-card__meta">
                <span className="task-card__meta-pill">
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>合作状态</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{item.collaboration_status}</span>
                </span>
                <span className="task-card__meta-pill">
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>活动状态</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{item.campaign?.status ?? "未知"}</span>
                </span>
              </div>
              <div className="task-card__ship-row">
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="填写快递单号"
                    value={shipTracking[item.collaboration_id] ?? ""}
                    status={shipValidation[item.collaboration_id] ? "error" : undefined}
                    onChange={(e) => {
                      const value = e.target.value;
                      setShipTracking((prev) => ({ ...prev, [item.collaboration_id]: value }));
                      if (value.trim()) {
                        setShipValidation((prev) => {
                          if (!prev[item.collaboration_id]) return prev;
                          const next = { ...prev };
                          delete next[item.collaboration_id];
                          return next;
                        });
                      }
                    }}
                    onBlur={() => {
                      const value = shipTracking[item.collaboration_id]?.trim();
                      if (!value) {
                        setShipValidation((prev) => ({ ...prev, [item.collaboration_id]: "快递单号不能为空" }));
                      } else {
                        setShipValidation((prev) => { const n = { ...prev }; delete n[item.collaboration_id]; return n; });
                      }
                    }}
                  />
                  {shipValidation[item.collaboration_id] && (
                    <Text className="task-card__error">{shipValidation[item.collaboration_id]}</Text>
                  )}
                </div>
                <Button
                  type="primary"
                  loading={shippingId === item.collaboration_id}
                  onClick={() => handleShipConfirm(item.collaboration_id)}
                  className="task-card__primary-btn"
                >
                  <SendOutlined /> 确认发货
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderScriptList = () => {
    if (scriptStatus === "loading") return <div className="tasks-loading"><Spin /></div>;
    if (scriptStatus === "error" && scriptError) return renderError(scriptError);
    if (!scriptTasks || scriptTasks.length === 0) return renderEmpty();
    return (
      <div className="task-list">
        {scriptTasks.map((item) => (
          <div key={item.id} className="task-card">
            <div className="task-card__stripe task-card__stripe--script" />
            <div className="task-card__inner">
              <div className="task-card__top">
                <div className="task-card__info">
                  <span className="task-card__campaign">{item.campaign?.name ?? "未命名项目"}</span>
                  <span className="task-card__influencer">
                    <UserOutlined style={{ fontSize: 11 }} />
                    达人：{item.influencer_id}
                  </span>
                </div>
                <span className="task-card__badge task-card__badge--script">待审核</span>
              </div>
              <div className="task-card__meta">
                <span className="task-card__meta-pill">
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>合作状态</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{item.collaboration_status}</span>
                </span>
              </div>
              {item.script_text && (
                <div className="task-card__script-box">
                  <span className="task-card__script-label">脚本内容</span>
                  <span className="task-card__script-text">{item.script_text}</span>
                </div>
              )}
              <div className="task-card__actions">
                <Button
                  type="primary"
                  loading={approvingScriptId === item.collaboration_id}
                  onClick={() => handleApproveScript(item.collaboration_id)}
                  className="task-card__primary-btn"
                >
                  <CheckCircleOutlined /> 批准脚本
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { key: "need_confirm" as TaskTab, label: "确认合作", count: confirmCount, icon: <CheckCircleOutlined /> },
    { key: "need_ship" as TaskTab, label: "产品寄送", count: shipCount, icon: <SendOutlined /> },
    { key: "need_script_review" as TaskTab, label: "脚本审核", count: scriptCount, icon: <FileTextOutlined /> }
  ];

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <div className="tasks-header__left">
          <h2 className="tasks-header__title">投放待办事项</h2>
          <div className="tasks-header__subtitle">
            <span className="tasks-header__ai-badge">
              <ThunderboltFilled style={{ fontSize: 10 }} />
              AI 智能体
            </span>
            你的 24/7 网红营销 AI 助理正在运行
          </div>
        </div>
        {status === "loading" ? (
          <Spin />
        ) : (
          <div className="tasks-header__total">
            <div className="tasks-header__total-num">{totalCount}</div>
            <div className="tasks-header__total-label">待处理任务</div>
          </div>
        )}
      </div>

      {/* Stat cards — also act as tab switchers */}
      <div className="tasks-stats">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tasks-stat-card${activeTab === tab.key ? " tasks-stat-card--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <div className="tasks-stat-icon">{tab.icon}</div>
            <div className="tasks-stat-body">
              <div className="tasks-stat-count">{tab.count}</div>
              <span className="tasks-stat-label">{tab.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="tasks-panel">
        {/* Tab bar */}
        <div className="tasks-panel__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tasks-panel__tab${activeTab === tab.key ? " tasks-panel__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
              <span className="tasks-panel__tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Hint strip */}
        <div className="tasks-panel__hint">
          <span className="tasks-panel__hint-dot" />
          <InfoCircleOutlined style={{ fontSize: 12, color: "#fb6011" }} />
          尽快审核合作申请可以确保网红的档期，并提高合作成功率；如果反馈太慢，网红更容易失联。
        </div>

        {/* Content */}
        <div className="tasks-panel__body">
          {status === "error" && errorMessage && (
            <div className="tasks-panel__note">
              <InfoCircleOutlined className="tasks-panel__note-icon" style={{ color: "#f59e0b" }} />
              <span>{errorMessage}</span>
            </div>
          )}
          {activeTab === "need_confirm" && renderConfirmList()}
          {activeTab === "need_ship" && renderShipList()}
          {activeTab === "need_script_review" && renderScriptList()}
        </div>
      </div>

      {/* Support tab */}
      <div className="support-tab">
        <img src={supportAvatar} alt="" />
        <span>客服咨询</span>
      </div>
    </div>
  );
}
