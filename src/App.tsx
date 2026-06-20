import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./router";
import "./styles.css";

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  );
}
