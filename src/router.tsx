import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import TaskProgress from "./components/TaskProgress";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyTasksPage from "./pages/MyTasksPage";
import RegisterPage from "./pages/RegisterPage";
import TalentPage from "./pages/TalentPage";
import HistoryPage from "./pages/HistoryPage";
import ReviewPage from "./pages/ReviewPage";
import PlanPage from "./pages/PlanPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
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
          { path: "/task-progress", element: <TaskProgress /> }
        ]
      }
    ]
  }
]);
