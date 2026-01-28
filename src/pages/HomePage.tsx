import { Typography } from "antd";

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="page-hero">
        <Typography.Title level={3}>主页</Typography.Title>
        <Typography.Text type="secondary">这里预留为首页概览。</Typography.Text>
      </div>
    </div>
  );
}
