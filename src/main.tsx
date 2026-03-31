import type { ComponentType } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

type LazyRouteModule = { default: ComponentType };
const lazyComponent = (importer: () => Promise<LazyRouteModule>) => {
  return async () => {
    const { default: Component } = await importer();
    return { Component };
  };
};

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        index: true,
        lazy: lazyComponent(() => import("./pages/home/HomePage.tsx")),
      },
      {
        path: "login",
        lazy: lazyComponent(() => import("./pages/home/LoginPage.tsx")),
      },
      {
        path: "signup",
        lazy: lazyComponent(() => import("./pages/home/SignupPage.tsx")),
      },
      {
        path: "settings",
        lazy: lazyComponent(() => import("./pages/home/SettingsPage.tsx")),
      },
      {
        path: "classrooms",
        lazy: lazyComponent(() => import("./pages/classroom/ClassroomListPage.tsx")),
      },
      {
        path: "classrooms/:classroomId",
        children: [
          {
            index: true,
            lazy: lazyComponent(
              () => import("./pages/classroom/ClassroomPage.tsx"),
            ),
          },
          {
            path: "assignment/:assignmentId",
            lazy: lazyComponent(
              () => import("./pages/classroom/AssignmentPage.tsx"),
            ),
          },
          {
            path: "assignment/:assignmentId/attempt",
            lazy: lazyComponent(
              () => import("./pages/classroom/AssignmentRunnerPage.tsx"),
            ),
          },
          {
            path: "assignment/:assignmentId/attempt/:attemptId",
            lazy: lazyComponent(
              () => import("./pages/classroom/AttemptPage.tsx"),
            ),
          },
          {
            path: "assignment/:assignmentId/attempt/:attemptId/response/:responseId",
            lazy: lazyComponent(
              () => import("./pages/classroom/ResponsePage.tsx"),
            ),
          },
        ],
      },
      {
        path: "scenario",
        children: [
          {
            index: true,
            lazy: lazyComponent(
              () => import("./pages/scenario/ScenarioLibraryPage.tsx"),
            ),
          },
          {
            path: "new",
            lazy: lazyComponent(
              () => import("./pages/scenario/ScenarioNewPage.tsx"),
            ),
          },
          {
            path: ":scenarioId/viewer",
            lazy: lazyComponent(
              () => import("./pages/scenario/ScenarioTestRunPage.tsx"),
            ),
          },
          {
            path: ":scenarioId/editor",
            lazy: lazyComponent(
              () => import("./pages/scenario/ScenarioEditorPage.tsx"),
            ),
          },
          {
            path: "library",
            lazy: lazyComponent(
              () => import("./pages/scenario/ScenarioLibraryPage.tsx"),
            ),
          },
        ],
      },
    ],
  },
]);

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
