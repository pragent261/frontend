import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import TaskProgress from "./components/TaskProgress";
import HomePage from "./pages/HomePage";
import MyTasksPage from "./pages/MyTasksPage";
import TalentPage from "./pages/TalentPage";
import HistoryPage from "./pages/HistoryPage";
import ReviewPage from "./pages/ReviewPage";
import PlanPage from "./pages/PlanPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";

export const router = createBrowserRouter([
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
]);
