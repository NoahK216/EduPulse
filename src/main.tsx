import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import App from './App.tsx'
import ScenarioViewerDemo from './scenario/viewer/viewerDemo.tsx';
import ScenarioCreatorDemo from './scenario/creator/creatorDemo.tsx';
import Login from "./pages/login";
import Classroom from "./pages/classroom";
import Signup from "./pages/signup";
import ClassroomDetail from './pages/classroomDetail.tsx';
import ClassroomMemberDetail from './pages/classroomMemberDetail.tsx';
import AssignmentDetail from './pages/assignmentDetail.tsx';
import AttemptDetail from './pages/attemptDetail.tsx';
import ResponseDetail from './pages/responseDetail.tsx';
import ScenarioLibrary from './pages/scenarioLibrary.tsx';
import ScenarioDetail from './pages/scenarioDetail.tsx';
import ScenarioVersionDetail from './pages/scenarioVersionDetail.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: App },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "classrooms", Component: Classroom },
      {
        path: "classrooms/:classroomId", children:
          [
            { index: true, Component: ClassroomDetail },
            { path: "member/:userId", Component: ClassroomMemberDetail },
            { path: "assignment/:assignmentId", Component: AssignmentDetail },
            {
              path: "assignment/:assignmentId/attempt/:attemptId",
              Component: AttemptDetail
            },
            {
              path: "assignment/:assignmentId/attempt/:attemptId/response/:responseId",
              Component: ResponseDetail
            },
          ]
      },
      {
        path: "scenario",
        children: [
          { index: true, Component: ScenarioViewerDemo },
          { path: "viewer", Component: ScenarioViewerDemo },
          { path: "creator", Component: ScenarioCreatorDemo },
          { path: "library", Component: ScenarioLibrary },
          { path: "library/scenario/:scenarioId", Component: ScenarioDetail },
          { path: "library/version/:versionId", Component: ScenarioVersionDetail },
        ]
      },
    ]
  }
]);

import { Providers } from './providers';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
