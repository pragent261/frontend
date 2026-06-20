import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sidebarStar } from "../figmaAssets";

type RegisterFormValues = {
  display_name?: string;
  email: string;
  password: string;
  confirm_password: string;
};

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await register(values.email, values.password, values.display_name);
      message.success("注册成功");
      navigate("/home", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "注册失败");
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
          <h1>注册聚风</h1>
          <p>创建账号后即可使用投放管理功能</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item label="昵称（可选）" name="display_name">
            <Input size="large" placeholder="你的昵称" autoComplete="nickname" />
          </Form.Item>

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
            rules={[
              { required: true, message: "请输入密码" },
              { min: 8, message: "密码至少 8 位" }
            ]}
          >
            <Input.Password
              size="large"
              placeholder="至少 8 位"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再次输入密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                }
              })
            ]}
          >
            <Input.Password
              size="large"
              placeholder="再次输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
          >
            注册
          </Button>
        </Form>

        <p className="auth-card__footer">
          已有账号？<Link to="/login">去登录</Link>
        </p>
      </div>
    </div>
  );
}
