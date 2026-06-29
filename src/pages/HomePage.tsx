import { Button, Input, Spin } from "antd";
import { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  SendOutlined,
  UserOutlined
} from "@ant-design/icons";
import { ChevronDown } from "lucide-react";
import emptyTasks from "../assets/empty-tasks.png";
import supportAvatar from "../assets/support-avatar.png";
import CreateCampaignModal from "../components/CreateCampaignModal";
import { apiFetch } from "../lib/api";
import "../styles.css";

type TaskItem = {
  id: string;
  collaboration_id: string;
  collaboration_status: string;
  influencer_id: string;
  script_text?: string | null;
  campaign: {
    id: string;
    name: string;
    status: string;
  } | null;
};

type TaskListResponse = {
  items: TaskItem[];
  next_cursor: string | null;
};

type TaskTab = "need_confirm" | "need_ship" | "need_script_review";

type LoadState = "loading" | "success";

export default function HomePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskTab>("need_confirm");

  const [confirmTasks, setConfirmTasks] = useState<TaskItem[] | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<LoadState>("loading");
  const [shipTasks, setShipTasks] = useState<TaskItem[] | null>(null);
  const [shipStatus, setShipStatus] = useState<LoadState>("loading");
  const [scriptTasks, setScriptTasks] = useState<TaskItem[] | null>(null);
  const [scriptStatus, setScriptStatus] = useState<LoadState>("loading");

  const [shipTracking, setShipTracking] = useState<Record<string, string>>({});
  const [shipValidation, setShipValidation] = useState<Record<string, string>>({});
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvingScriptId, setApprovingScriptId] = useState<string | null>(null);

  const loadList = (
    type: TaskTab,
    setTasks: (items: TaskItem[]) => void,
    setStatus: (state: LoadState) => void,
    signal: AbortSignal
  ) => {
    setStatus("loading");
    return apiFetch(`/v1/tasks?type=${type}`, { signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("request_failed");
        const data = (await response.json()) as TaskListResponse;
        setTasks(data.items ?? []);
        setStatus("success");
      })
      .catch((error: unknown) => {
        if (signal.aborted) return;
        console.error(`Failed to load ${type}`, error);
        setTasks([]);
        setStatus("success");
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    loadList("need_confirm", setConfirmTasks, setConfirmStatus, controller.signal);
    loadList("need_ship", setShipTasks, setShipStatus, controller.signal);
    loadList("need_script_review", setScriptTasks, setScriptStatus, controller.signal);
    return () => controller.abort();
  }, []);

  const reloadAll = () => {
    const controller = new AbortController();
    loadList("need_confirm", setConfirmTasks, setConfirmStatus, controller.signal);
    loadList("need_ship", setShipTasks, setShipStatus, controller.signal);
    loadList("need_script_review", setScriptTasks, setScriptStatus, controller.signal);
  };

  const confirmCount = confirmTasks?.length ?? 0;
  const shipCount = shipTasks?.length ?? 0;
  const scriptCount = scriptTasks?.length ?? 0;

  const handleApprove = async (collaborationId: string) => {
    setApprovingId(collaborationId);
    try {
      const response = await apiFetch(
        `/v1/tasks/${collaborationId}/actions/approve-collaboration`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("approve_collaboration_failed");
      setConfirmTasks((prev) =>
        prev ? prev.filter((item) => item.collaboration_id !== collaborationId) : prev
      );
    } catch (error) {
      console.error(error);
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
    try {
      const response = await apiFetch(
        `/v1/tasks/${collaborationId}/actions/confirm-ship`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracking_number: trackingNumber })
        }
      );
      if (!response.ok) throw new Error("confirm_ship_failed");
      setShipTasks((prev) =>
        prev ? prev.filter((item) => item.collaboration_id !== collaborationId) : prev
      );
    } catch (error) {
      console.error(error);
    } finally {
      setShippingId(null);
    }
  };

  const handleApproveScript = async (collaborationId: string) => {
    setApprovingScriptId(collaborationId);
    try {
      const response = await apiFetch(
        `/v1/tasks/${collaborationId}/actions/approve-script`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("approve_script_failed");
      setScriptTasks((prev) =>
        prev ? prev.filter((item) => item.collaboration_id !== collaborationId) : prev
      );
    } catch (error) {
      console.error(error);
    } finally {
      setApprovingScriptId(null);
    }
  };

  const tabs: { key: TaskTab; label: string; count: number }[] = [
    { key: "need_confirm", label: "确认合作", count: confirmCount },
    { key: "need_ship", label: "产品寄送", count: shipCount },
    { key: "need_script_review", label: "脚本审核", count: scriptCount }
  ];

  const renderEmpty = () => (
    <div className="todo-empty">
      <img className="todo-empty__img" src={emptyTasks} alt="" />
      <div className="todo-empty__text">暂无待处理任务</div>
    </div>
  );

  const renderConfirmList = () => {
    if (confirmStatus === "loading") {
      return (
        <div className="todo-loading">
          <Spin />
        </div>
      );
    }
    if (!confirmTasks || confirmTasks.length === 0) return renderEmpty();
    return (
      <div className="task-list">
        {confirmTasks.map((item) => (
          <div key={item.id} className="task-card">
            <div className="task-card__stripe" />
            <div className="task-card__inner">
              <div className="task-card__top">
                <div className="task-card__info">
                  <span className="task-card__campaign">
                    {item.campaign?.name ?? "未命名项目"}
                  </span>
                  <span className="task-card__influencer">
                    <UserOutlined style={{ fontSize: 11 }} />
                    达人：{item.influencer_id}
                  </span>
                </div>
                <span className="task-card__badge task-card__badge--confirm">待确认</span>
              </div>
              <div className="task-card__actions">
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
    if (shipStatus === "loading") {
      return (
        <div className="todo-loading">
          <Spin />
        </div>
      );
    }
    if (!shipTasks || shipTasks.length === 0) return renderEmpty();
    return (
      <div className="task-list">
        {shipTasks.map((item) => (
          <div key={item.id} className="task-card">
            <div className="task-card__stripe task-card__stripe--ship" />
            <div className="task-card__inner">
              <div className="task-card__top">
                <div className="task-card__info">
                  <span className="task-card__campaign">
                    {item.campaign?.name ?? "未命名项目"}
                  </span>
                  <span className="task-card__influencer">
                    <UserOutlined style={{ fontSize: 11 }} />
                    达人：{item.influencer_id}
                  </span>
                </div>
                <span className="task-card__badge task-card__badge--ship">待寄送</span>
              </div>
              <div className="task-card__ship-row">
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="填写快递单号"
                    value={shipTracking[item.collaboration_id] ?? ""}
                    status={shipValidation[item.collaboration_id] ? "error" : undefined}
                    onChange={(e) => {
                      const value = e.target.value;
                      setShipTracking((prev) => ({
                        ...prev,
                        [item.collaboration_id]: value
                      }));
                      if (value.trim()) {
                        setShipValidation((prev) => {
                          if (!prev[item.collaboration_id]) return prev;
                          const next = { ...prev };
                          delete next[item.collaboration_id];
                          return next;
                        });
                      }
                    }}
                  />
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
    if (scriptStatus === "loading") {
      return (
        <div className="todo-loading">
          <Spin />
        </div>
      );
    }
    if (!scriptTasks || scriptTasks.length === 0) return renderEmpty();
    return (
      <div className="task-list">
        {scriptTasks.map((item) => (
          <div key={item.id} className="task-card">
            <div className="task-card__stripe task-card__stripe--script" />
            <div className="task-card__inner">
              <div className="task-card__top">
                <div className="task-card__info">
                  <span className="task-card__campaign">
                    {item.campaign?.name ?? "未命名项目"}
                  </span>
                  <span className="task-card__influencer">
                    <UserOutlined style={{ fontSize: 11 }} />
                    达人：{item.influencer_id}
                  </span>
                </div>
                <span className="task-card__badge task-card__badge--script">待审核</span>
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

  return (
    <div className="home">
      <div className="home__header">
        <h1 className="home__welcome">
          <span>欢迎回来</span>
          <span>👋</span>
        </h1>
        <button
          className="home__create-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
        >
          创建投放计划
        </button>
      </div>

      <div className="todo-card">
        <h2 className="todo-card__title">投放代办事项</h2>

        <div className="todo-card__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`todo-tab${activeTab === tab.key ? " todo-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}（{tab.count}）
            </button>
          ))}
        </div>

        <div className="todo-card__subrow">
          <span className="todo-card__subrow-line" />
          <span className="todo-card__subrow-text">你的 24/7 网红营销 AI智能体员工</span>
          <span className="todo-card__collapse">
            <ChevronDown />
          </span>
        </div>

        <div className="todo-card__hint">
          尽快审核合作申请可以确保网红的档期，并提高合作成功率；如果反馈太慢，网红更容易失联。
        </div>

        <div className="todo-card__body">
          {activeTab === "need_confirm" && renderConfirmList()}
          {activeTab === "need_ship" && renderShipList()}
          {activeTab === "need_script_review" && renderScriptList()}
        </div>
      </div>

      <div className="support-tab">
        <img src={supportAvatar} alt="" />
        <span>客服咨询</span>
      </div>

      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          reloadAll();
        }}
      />
    </div>
  );
}
