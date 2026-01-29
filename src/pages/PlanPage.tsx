import { Button, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";

const { Text } = Typography;

type Campaign = {
  id: string;
  name: string;
  status: string;
};

type Collaboration = {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: string;
};

type CampaignListResponse = {
  items: Campaign[];
  next_cursor: string | null;
};

type CollaborationListResponse = {
  items: Collaboration[];
  next_cursor: string | null;
};

export default function PlanPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const [campaignRes, collaborationRes] = await Promise.all([
          fetch("/v1/campaigns", { signal: controller.signal }),
          fetch("/v1/collaborations", { signal: controller.signal })
        ]);

        if (!campaignRes.ok || !collaborationRes.ok) {
          throw new Error("plan_request_failed");
        }

        const campaignsData =
          (await campaignRes.json()) as CampaignListResponse;
        const collaborationsData =
          (await collaborationRes.json()) as CollaborationListResponse;

        setCampaigns(campaignsData.items ?? []);
        setCollaborations(collaborationsData.items ?? []);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load plan data", error);
        setCampaigns([]);
        setCollaborations([]);
        setStatus("error");
        setErrorMessage("投放计划数据加载失败。");
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, []);

  const collaborationsByCampaign = useMemo(() => {
    return collaborations.reduce<Record<string, Collaboration[]>>(
      (acc, item) => {
        if (!acc[item.campaign_id]) {
          acc[item.campaign_id] = [];
        }
        acc[item.campaign_id].push(item);
        return acc;
      },
      {}
    );
  }, [collaborations]);

  return (
    <div className="page-shell">
      <div className="task-main__toolbar">
        <div className="task-main__welcome">
          <Text className="task-main__welcome-text">欢迎回来</Text>
          <span className="task-main__welcome-emoji">👋</span>
        </div>
        <Button className="task-main__cta">创建投放计划</Button>
      </div>
      <div className="page-hero">
        <Typography.Title level={3}>投放计划</Typography.Title>
        <Typography.Text type="secondary">
          这里汇总全部投放计划与对应合作信息。
        </Typography.Text>
      </div>

      <div className="campaign-list">
        {status === "loading" ? (
          <Text className="todo-card__status">正在加载投放计划...</Text>
        ) : null}
        {status === "error" && errorMessage ? (
          <Text className="todo-card__status todo-card__status--error">
            {errorMessage}
          </Text>
        ) : null}
        {status === "success" && campaigns.length === 0 ? (
          <Text className="todo-card__status">暂无投放计划。</Text>
        ) : null}
        {campaigns.map((campaign) => {
          const list = collaborationsByCampaign[campaign.id] ?? [];
          const isOpen = expandedId === campaign.id;
          return (
            <div key={campaign.id} className="campaign-card">
              <button
                type="button"
                className="campaign-card__header"
                onClick={() =>
                  setExpandedId(isOpen ? null : campaign.id)
                }
              >
                <div>
                  <Text className="campaign-card__title">{campaign.name}</Text>
                  <Text className="campaign-card__meta">
                    状态：{campaign.status}
                  </Text>
                </div>
                <div className="campaign-card__toggle">
                  <span>{list.length} 个合作</span>
                  <span>{isOpen ? "收起" : "展开"}</span>
                </div>
              </button>
              {isOpen ? (
                <div className="campaign-card__body">
                  {list.length === 0 ? (
                    <Text className="todo-card__status">
                      暂无合作记录。
                    </Text>
                  ) : (
                    list.map((collaboration) => (
                      <div
                        key={collaboration.id}
                        className="campaign-collab"
                      >
                        <div>
                          <Text className="campaign-collab__title">
                            达人：{collaboration.influencer_id}
                          </Text>
                          <Text className="campaign-collab__meta">
                            合作状态：{collaboration.status}
                          </Text>
                        </div>
                        <span className="campaign-collab__tag">
                          {collaboration.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
