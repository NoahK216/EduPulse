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
      { index: true, lazy: lazyComponent(() => import("./pages/home/home.tsx")) },
      { path: "login", lazy: lazyComponent(() => import("./pages/home/login.tsx")) },
      { path: "signup", lazy: lazyComponent(() => import("./pages/home/signup.tsx")) },
      { path: "classrooms", lazy: lazyComponent(() => import("./pages/classroom/classroom.tsx")) },
      {
        path: "classrooms/:classroomId",
        children:
          [
            { index: true, lazy: lazyComponent(() => import("./pages/classroom/classroomDetail.tsx")) },
            { path: "member/:userId", lazy: lazyComponent(() => import("./pages/classroom/classroomMemberDetail.tsx")) },
            { path: "assignment/:assignmentId", lazy: lazyComponent(() => import("./pages/classroom/assignmentDetail.tsx")) },
            {
              path: "assignment/:assignmentId/attempt/:attemptId",
              lazy: lazyComponent(() => import("./pages/classroom/attemptDetail.tsx"))
            },
            {
              path: "assignment/:assignmentId/attempt/:attemptId/response/:responseId",
              lazy: lazyComponent(() => import("./pages/classroom/responseDetail.tsx"))
            },
          ]
      },
      {
        path: "scenario",
        children: [
          { index: true, lazy: lazyComponent(() => import("./pages/scenario/scenarioLibrary.tsx")) },
          { path: "new", lazy: lazyComponent(() => import("./pages/scenario/scenarioNew.tsx")) },
          { path: ":scenarioId/viewer", lazy: lazyComponent(() => import("./pages/scenario/scenarioViewerPage.tsx")) },
          { path: ":scenarioId/editor", lazy: lazyComponent(() => import("./pages/scenario/scenarioEditor.tsx")) },
          { path: "library", lazy: lazyComponent(() => import("./pages/scenario/scenarioLibrary.tsx")) },
        ]
      },
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
