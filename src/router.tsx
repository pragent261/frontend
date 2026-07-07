import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import AppShell from "./components/AppShell";
import TaskProgress from "./components/TaskProgress";
import HomePage from "./pages/HomePage";
import MyTasksPage from "./pages/MyTasksPage";
import TalentPage from "./pages/TalentPage";
import HistoryPage from "./pages/HistoryPage";
import ReviewPage from "./pages/ReviewPage";
import PlanPage from "./pages/PlanPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import EmployeePanelPage from "./pages/EmployeePanelPage";
import LoginPage from "./pages/LoginPage";
import { isAuthenticated } from "./lib/auth";

function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "/home", element: <HomePage /> },
      { path: "/tasks", element: <MyTasksPage /> },
      { path: "/plan", element: <PlanPage /> },
      { path: "/plan/:id", element: <CampaignDetailPage /> },
      { path: "/talent", element: <TalentPage /> },
      { path: "/history", element: <HistoryPage /> },
      { path: "/review", element: <ReviewPage /> },
      { path: "/employees", element: <EmployeePanelPage /> },
      { path: "/task-progress", element: <TaskProgress /> }
        ]
      }
    ]
  }
]);
