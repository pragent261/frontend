import { Button, Input, Typography, Spin, Dropdown } from "antd";
import { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  MailOutlined,
  MoreOutlined,
  DownOutlined
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
  const [scriptSubTab, setScriptSubTab] = useState<"getting" | "giving">("getting");
  const [offersFilter, setOffersFilter] = useState<string>("All offers");

  useEffect(() => {
    const controller = new AbortController();
    const loadSummary = async () => {
      try {
        const response = await apiFetch("/v1/dashboard/my-tasks", { signal: controller.signal });
        if (!response.ok) throw new Error("summary_request_failed");
        const data = (await response.json()) as DashboardSummary;
        setSummary(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setSummary(null);
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
        setConfirmStatus("success");
        setConfirmError(null);
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
        setShipStatus("success");
        setShipError(null);
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
        setScriptStatus("success");
        setScriptError(null);
      }
    };
    load();
    return () => controller.abort();
  }, [activeTab, scriptTasks]);

  const data = summary ?? emptySummary;
  const confirmCount = confirmTasks !== null ? confirmTasks.length : data.collaborations_need_confirm;
  const shipCount = shipTasks !== null ? shipTasks.length : data.collaborations_need_ship;
  const scriptCount = scriptTasks !== null ? scriptTasks.length : data.collaborations_need_script_review;

  const handleApprove = async (collaborationId: string) => {
    setApprovingId(collaborationId);
    setConfirmError(null);
    try {
      const response = await apiFetch(`/v1/tasks/${collaborationId}/actions/approve-collaboration`, { method: "POST" });
      if (!response.ok) throw new Error("approve_collaboration_failed");
      setConfirmTasks((prev) => prev ? prev.filter((item) => item.collaboration_id !== collaborationId) : prev);
    } catch {
      setConfirmError(null);
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
      setShipError(null);
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
      setScriptError(null);
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

  const renderCardHead = (item: TaskItem, index: number, timeLabel: string) => {
    const displayName = item.influencer_id || "未知达人";
    const initial = displayName.trim().charAt(0).toUpperCase() || "?";
    const avatarColor = avatarPalette[index % avatarPalette.length];
    return (
      <div className="sr-card__head">
        <div className="sr-card__avatar" style={{ backgroundColor: avatarColor }}>
          {initial}
        </div>
        <span className="sr-card__name">{displayName}</span>
        <span className="sr-card__time">• {timeLabel}</span>
        <div className="sr-card__head-right">
          <span className="sr-tag sr-tag--pending">Pending</span>
          <button className="sr-card__more" type="button" aria-label="更多">
            <MoreOutlined />
          </button>
        </div>
      </div>
    );
  };

  const renderCardPill = (label: string, status: string) => (
    <div className="sr-card__pill">
      <span className="sr-card__pill-check" />
      <span className="sr-card__pill-label">{label}</span>
      <span className="sr-card__pill-status">{status}</span>
    </div>
  );

  const renderConfirmCards = () => {
    if (confirmStatus === "loading") return <div className="tasks-loading"><Spin /></div>;
    if (confirmStatus === "error" && confirmError) return renderError(confirmError);
    if (!confirmTasks || confirmTasks.length === 0) return renderEmpty();
    return (
      <div className="sr-card-list">
        {confirmTasks.map((item, index) => (
          <div key={item.id} className="sr-card">
            {renderCardHead(item, index, "待确认")}
            {renderCardPill(item.campaign?.name ?? "合作申请", item.campaign?.status ?? "未知")}
            <div className="sr-card__divider" />
            <div className="sr-card__actions">
              <button
                className="sr-btn sr-btn--ghost"
                type="button"
                onClick={() => handleApprove(item.collaboration_id)}
              >
                拒绝合作
              </button>
              <Button
                className="sr-btn sr-btn--dark"
                loading={approvingId === item.collaboration_id}
                onClick={() => handleApprove(item.collaboration_id)}
              >
                确认合作
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderShipCards = () => {
    if (shipStatus === "loading") return <div className="tasks-loading"><Spin /></div>;
    if (shipStatus === "error" && shipError) return renderError(shipError);
    if (!shipTasks || shipTasks.length === 0) return renderEmpty();
    return (
      <div className="sr-card-list">
        {shipTasks.map((item, index) => (
          <div key={item.id} className="sr-card">
            {renderCardHead(item, index, "待寄送")}
            {renderCardPill(item.campaign?.name ?? "产品寄送", item.collaboration_status)}
            <div className="sr-card__divider" />
            <div className="sr-card__ship-row">
              <div className="sr-card__ship-input">
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
                className="sr-btn sr-btn--dark"
                loading={shippingId === item.collaboration_id}
                onClick={() => handleShipConfirm(item.collaboration_id)}
              >
                确认发货
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const offerMenuItems = ["All offers", "Pending", "Approved"].map((label) => ({
    key: label,
    label
  }));

  const avatarPalette = ["#1e3a8a", "#0891b2", "#7c3aed", "#be123c", "#15803d", "#b45309"];

  const renderScriptCards = () => {
    if (scriptStatus === "loading") return <div className="tasks-loading"><Spin /></div>;
    if (scriptStatus === "error" && scriptError) return renderError(scriptError);
    if (!scriptTasks || scriptTasks.length === 0) return renderEmpty();
    return (
      <div className="sr-card-list">
        {scriptTasks.map((item, index) => (
          <div key={item.id} className="sr-card">
            {renderCardHead(item, index, "待审核")}
            {renderCardPill(item.campaign?.name ?? "脚本审核", item.collaboration_status)}
            {item.script_text && (
              <div className="sr-card__script">{item.script_text}</div>
            )}
            <div className="sr-card__divider" />
            <div className="sr-card__actions">
              <button className="sr-btn sr-btn--ghost" type="button">
                <MailOutlined />
                沟通
              </button>
              <Button
                className="sr-btn sr-btn--dark"
                loading={approvingScriptId === item.collaboration_id}
                onClick={() => handleApproveScript(item.collaboration_id)}
              >
                接受脚本
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveCards = () => {
    if (activeTab === "need_confirm") return renderConfirmCards();
    if (activeTab === "need_ship") return renderShipCards();
    return renderScriptCards();
  };

  const tabs = [
    { key: "need_confirm" as TaskTab, label: "确认合作", count: confirmCount, icon: <CheckCircleOutlined /> },
    { key: "need_ship" as TaskTab, label: "产品寄送", count: shipCount, icon: <SendOutlined /> },
    { key: "need_script_review" as TaskTab, label: "脚本审核", count: scriptCount, icon: <FileTextOutlined /> }
  ];

  return (
    <div className="tasks-page">
      {/* Top text tabs (Figma) */}
      <div className="sr-toptabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`sr-toptab${activeTab === tab.key ? " sr-toptab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gray panel */}
      <div className="sr-panel">
        <div className="sr-panel__head">
          <div className="sr-subtabs">
            <button
              type="button"
              className={`sr-subtab${scriptSubTab === "getting" ? " sr-subtab--active" : ""}`}
              onClick={() => setScriptSubTab("getting")}
            >
              Getting help
            </button>
            <button
              type="button"
              className={`sr-subtab${scriptSubTab === "giving" ? " sr-subtab--active" : ""}`}
              onClick={() => setScriptSubTab("giving")}
            >
              Giving help
            </button>
          </div>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: offerMenuItems,
              selectable: true,
              selectedKeys: [offersFilter],
              onClick: ({ key }) => setOffersFilter(key)
            }}
          >
            <button className="sr-offers-btn" type="button">
              {offersFilter}
              <DownOutlined className="sr-offers-btn__caret" />
            </button>
          </Dropdown>
        </div>

        {renderActiveCards()}
      </div>

      {/* Support tab */}
      <div className="support-tab">
        <img src={supportAvatar} alt="" />
        <span>客服咨询</span>
      </div>
    </div>
  );
}
