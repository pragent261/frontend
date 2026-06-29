import { Button, Card, Typography, Dropdown, Spin, Empty, message } from "antd";
import { PlusOutlined, MoreOutlined, CloudOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CreateCampaignModal from "../components/CreateCampaignModal";
import { apiFetch } from "../lib/api";
import "../styles.css";

const { Text, Title } = Typography;

type Campaign = {
  id: string;
  name: string;
  brand_site_url: string | null;
  taobao_url: string | null;
  collaboration_mode: string;
  status: "draft" | "active" | "paused" | "completed";
  mode: string;
  config: Record<string, unknown>;
  version: number;
  created_at: string;
  updated_at: string;
};

type CampaignListResponse = {
  items: Campaign[];
  next_cursor: string | null;
};

export default function PlanPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/v1/campaigns");
      if (!response.ok) {
        throw new Error("加载投放计划失败");
      }
      const data = (await response.json()) as CampaignListResponse;
      setCampaigns(data.items || []);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      setCampaigns([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreateSuccess = () => {
    fetchCampaigns();
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    const statusConfig = {
      draft: { color: "#faad14", text: "Draft" },
      active: { color: "#52c41a", text: "Active" },
      paused: { color: "#8c8c8c", text: "Paused" },
      completed: { color: "#1890ff", text: "Completed" }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className="campaign-card__status" style={{ borderColor: config.color, color: config.color }}>
        <span className="campaign-card__status-dot" style={{ backgroundColor: config.color }} />
        {config.text}
      </span>
    );
  };

  const handleDelete = async (campaignId: string) => {
    try {
      const response = await apiFetch(`/v1/campaigns/${campaignId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("删除失败");
      }
      fetchCampaigns();
    } catch (err) {
      console.error("Failed to delete campaign:", err);
    }
  };

  const renderCampaignCard = (campaign: Campaign) => (
    <Card
      key={campaign.id}
      className="campaign-card"
      hoverable
    >
      <div className="campaign-card__cover">
        <CloudOutlined className="campaign-card__cover-icon" />
      </div>
      <div className="campaign-card__body">
        <Text className="campaign-card__title" ellipsis>
          {campaign.name}
        </Text>
        <div className="campaign-card__footer">
          {getStatusBadge(campaign.status)}
          <Dropdown
            menu={{
              items: [
                { key: "view", label: "查看详情" },
                { key: "edit", label: "编辑" },
                { key: "publish", label: "发布", disabled: campaign.status !== "draft" },
                { type: "divider" },
                { key: "delete", label: "删除", danger: true }
              ],
              onClick: async ({ key }) => {
                if (key === "view") {
                  navigate(`/plan/${campaign.id}`);
                } else if (key === "edit") {
                  navigate(`/plan/${campaign.id}`);
                } else if (key === "publish" && campaign.status === "draft") {
                  try {
                    const response = await apiFetch(`/v1/campaigns/${campaign.id}/publish`, {
                      method: "POST"
                    });
                    if (!response.ok) throw new Error("发布失败");
                    message.success("投放计划已发布");
                    fetchCampaigns();
                  } catch (err) {
                    console.error("Publish error:", err);
                    message.error("发布失败，请稍后重试");
                  }
                } else if (key === "delete") {
                  handleDelete(campaign.id);
                }
              }
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="campaign-card__more"
            />
          </Dropdown>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="plan-page">
      <div className="plan-page__header">
        <Title level={3} className="plan-page__title">投放计划列表</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="plan-page__create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          创建投放计划
        </Button>
      </div>

      <div className="plan-page__content">
        {loading ? (
          <div className="plan-page__loading">
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="plan-page__error">
            <Text type="danger">{error}</Text>
            <Button onClick={fetchCampaigns}>重试</Button>
          </div>
        ) : campaigns.length === 0 ? (
          <Empty
            description="暂无投放计划"
            className="plan-page__empty"
          >
            <Button
              type="primary"
              onClick={() => setShowCreateModal(true)}
            >
              创建第一个投放计划
            </Button>
          </Empty>
        ) : (
          <div className="plan-page__grid">
            {campaigns.map(renderCampaignCard)}
          </div>
        )}
      </div>

      <CreateCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
