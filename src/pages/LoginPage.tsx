import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sidebarStar } from "../figmaAssets";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      message.success("登录成功");
      navigate("/home", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <img className="auth-card__logo" src={sidebarStar} alt="" />
          <h1>登录聚风</h1>
          <p>使用邮箱和密码登录你的账号</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效邮箱" }
            ]}
          >
            <Input size="large" placeholder="you@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              size="large"
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
          >
            登录
          </Button>
        </Form>

        <p className="auth-card__footer">
          还没有账号？<Link to="/register">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
