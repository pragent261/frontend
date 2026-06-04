import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Button, Typography, Spin, Descriptions, Tag, message, Card, Tabs, Empty } from "antd";
import { ArrowLeftOutlined, EditOutlined, SendOutlined } from "@ant-design/icons";
import { apiFetch } from "../lib/api";
import "../styles.css";

const { Title } = Typography;

type Campaign = {
    id: string;
    name: string;
    brand_site_url: string | null;
    taobao_url: string | null;
    collaboration_mode: string | null;
    status: "draft" | "active" | "paused" | "completed";
    mode: string;
    config: Record<string, unknown>;
    version: number | null;
    created_at: string;
    updated_at: string;
};

const collaborationModeLabels: Record<string, string> = {
    send_sample: "送拍",
    ship_sample: "寄拍",
    exchange: "置换",
    pugongying_reported: "蒲公英报备",
    underwater: "水下/非报备"
};

const statusConfig: Record<string, { color: string; text: string }> = {
    draft: { color: "gold", text: "草稿" },
    active: { color: "green", text: "进行中" },
    paused: { color: "default", text: "已暂停" },
    completed: { color: "blue", text: "已完成" }
};

export default function CampaignDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);

    const fetchCampaign = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch(`/v1/campaigns/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("投放计划不存在");
                }
                throw new Error("加载失败");
            }
            const data = await response.json();
            setCampaign(data);
        } catch (err) {
            console.error("Failed to fetch campaign:", err);
            setError(err instanceof Error ? err.message : "加载失败");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    const handlePublish = async () => {
        if (!campaign) return;

        setPublishing(true);
        try {
            const response = await apiFetch(`/v1/campaigns/${campaign.id}/publish`, {
                method: "POST"
            });
            if (!response.ok) {
                throw new Error("发布失败");
            }
            message.success("投放计划已发布");
            fetchCampaign();
        } catch (err) {
            console.error("Publish error:", err);
            message.error("发布失败，请稍后重试");
        } finally {
            setPublishing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="campaign-detail__loading">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="campaign-detail__error">
                <Empty description={error || "投放计划不存在"}>
                    <Button onClick={() => navigate("/plan")}>返回列表</Button>
                </Empty>
            </div>
        );
    }

    const status = statusConfig[campaign.status] || statusConfig.draft;

    return (
        <div className="campaign-detail">
            <div className="campaign-detail__header">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/plan")}
                    className="campaign-detail__back"
                >
                    返回
                </Button>
                <div className="campaign-detail__title-row">
                    <Title level={3} className="campaign-detail__title">{campaign.name}</Title>
                    <Tag color={status.color}>{status.text}</Tag>
                </div>
                <div className="campaign-detail__actions">
                    <Button icon={<EditOutlined />}>编辑</Button>
                    {campaign.status === "draft" && (
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handlePublish}
                            loading={publishing}
                        >
                            发布
                        </Button>
                    )}
                </div>
            </div>

            <Tabs
                defaultActiveKey="info"
                items={[
                    {
                        key: "info",
                        label: "基本信息",
                        children: (
                            <Card className="campaign-detail__card">
                                <Descriptions column={2} bordered>
                                    <Descriptions.Item label="投放计划名称">{campaign.name}</Descriptions.Item>
                                    <Descriptions.Item label="状态">
                                        <Tag color={status.color}>{status.text}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="合作模式">
                                        {campaign.collaboration_mode
                                            ? collaborationModeLabels[campaign.collaboration_mode] || campaign.collaboration_mode
                                            : "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="运营模式">{campaign.mode}</Descriptions.Item>
                                    <Descriptions.Item label="品牌方网站" span={2}>
                                        {campaign.brand_site_url ? (
                                            <a href={campaign.brand_site_url} target="_blank" rel="noopener noreferrer">
                                                {campaign.brand_site_url}
                                            </a>
                                        ) : "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="淘宝店铺链接" span={2}>
                                        {campaign.taobao_url ? (
                                            <a href={campaign.taobao_url} target="_blank" rel="noopener noreferrer">
                                                {campaign.taobao_url}
                                            </a>
                                        ) : "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="创建时间">{formatDate(campaign.created_at)}</Descriptions.Item>
                                    <Descriptions.Item label="更新时间">{formatDate(campaign.updated_at)}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )
                    },
                    {
                        key: "influencers",
                        label: "博主列表",
                        children: (
                            <Card className="campaign-detail__card">
                                <Empty description="暂无博主数据" />
                            </Card>
                        )
                    },
                    {
                        key: "content",
                        label: "内容Brief",
                        children: (
                            <Card className="campaign-detail__card">
                                <Empty description="暂无内容Brief" />
                            </Card>
                        )
                    },
                    {
                        key: "assets",
                        label: "资源文件",
                        children: (
                            <Card className="campaign-detail__card">
                                <Empty description="暂无资源文件" />
                            </Card>
                        )
                    }
                ]}
            />
        </div>
    );
}
