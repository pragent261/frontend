import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import { router } from "./router";
import "./styles.css";

export default function App() {
  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
