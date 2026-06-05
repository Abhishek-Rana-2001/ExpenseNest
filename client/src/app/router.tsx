import { createBrowserRouter } from "react-router-dom";
import { GuestRoute } from "../components/layout/GuestRoute";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { AppLayout } from "./AppLayout";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Spinner from "@/components/animated/Spinner";

function RouteHydrateFallback() {
  return (
    <div className="grid h-screen place-items-center">
      <Spinner className="size-10" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    HydrateFallback: RouteHydrateFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Homepage } = await import("@/features/homepage/Homepage");
          return { Component: Homepage };
        },
      },
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <DashboardContainer />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "dashboard",
            lazy: async () => {
              const { DashboardPage } = await import(
                "@/features/dashboard/DashboardPage"
              );
              return { Component: DashboardPage };
            },
          },
          {
            path: "transactions",
            lazy: async () => {
              const { default: TransactionsPage } = await import(
                "../features/transactions/TransactionsPage"
              );
              return { Component: TransactionsPage };
            },
          },
          {
            path: "analytics",
            lazy: async () => {
              const { default: Analytics } = await import(
                "@/features/analytics/Analytics"
              );
              return { Component: Analytics };
            },
          },
          {
            path: "budgets",
            lazy: async () => {
              const { default: BudgetsPage } = await import(
                "@/features/budgets/BudgetsPage"
              );
              return { Component: BudgetsPage };
            },
          },
          {
            path: "goals",
            lazy: async () => {
              const { DashboardPage } = await import(
                "@/features/dashboard/DashboardPage"
              );
              return { Component: DashboardPage };
            },
          },
        ],
      },
      {
        path: "login",
        lazy: async () => {
          const { default: Login } = await import("../features/auth/Login");
          const LoginRoute = () => (
            <GuestRoute>
              <Login />
            </GuestRoute>
          );
          return { Component: LoginRoute };
        },
      },
      {
        path: "signup",
        lazy: async () => {
          const { default: SignUp } = await import("../features/auth/SignUp");
          const SignUpRoute = () => (
            <GuestRoute>
              <SignUp />
            </GuestRoute>
          );
          return { Component: SignUpRoute };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { NotFoundPage } = await import("./NotFoundPage");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
