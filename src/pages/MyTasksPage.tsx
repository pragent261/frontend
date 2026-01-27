import { Typography } from "antd";

export default function MyTasksPage() {
  return (
    <div className="page-shell">
      <div className="page-hero">
        <Typography.Title level={3}>我的任务</Typography.Title>
        <Typography.Text type="secondary">
          这里预留为任务列表与状态。
        </Typography.Text>
      </div>
    </div>
  );
}
