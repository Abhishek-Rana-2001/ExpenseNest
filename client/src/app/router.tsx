import { createBrowserRouter } from "react-router-dom";
import { GuestRoute } from "../components/layout/GuestRoute";
import { TransactionsPage } from "../features/transactions/TransactionsPage";
import Login from "../features/auth/Login";
import SignUp from "../features/auth/SignUp";
import { AppLayout } from "./AppLayout";
import { NotFoundPage } from "./NotFoundPage";
import { Homepage } from "@/features/homepage/Homepage";
import DashboardContainer from "@/components/layout/DashboardContainer";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import Analytics from "@/features/analytics/Analytics";
import { NavigationProvider } from "@/context/NavigationContext";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Homepage /> },
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <NavigationProvider>
            <DashboardContainer />
            </NavigationProvider>
          </ProtectedRoute>
        ),
        children: [{
          path: "dashboard",
          element: <DashboardPage />
        },
        {
          path: "history",
          element: <TransactionsPage  />
        },
        {
          path: "analytics",
          element: <Analytics />
        },
        {
          path: "goals",
          element: <DashboardPage />
        }
      
      ],
      },
      {
        path: "transactions",
        element: (
          // <ProtectedRoute>
          <TransactionsPage />
          // </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <GuestRoute>
            <SignUp />
          </GuestRoute>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
