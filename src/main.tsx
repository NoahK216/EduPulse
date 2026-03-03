import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import Home from './pages/home/home.tsx'
import ScenarioViewerDemo from './pages/scenario/viewer/viewerDemo.tsx';
import ScenarioCreatorDemo from './pages/scenario/creator/creatorDemo.tsx';
import Login from "./pages/home/login.tsx";
import Classroom from "./pages/classroom/classroom.tsx";
import Signup from "./pages/home/signup.tsx";
import ClassroomDetail from './pages/classroom/classroomDetail.tsx';
import ClassroomMemberDetail from './pages/classroom/classroomMemberDetail.tsx';
import AssignmentDetail from './pages/classroom/assignmentDetail.tsx';
import AttemptDetail from './pages/classroom/attemptDetail.tsx';
import ResponseDetail from './pages/classroom/responseDetail.tsx';
import ScenarioLibrary from './pages/scenario/scenarioLibrary.tsx';
import ScenarioDetail from './pages/scenario/scenarioDetail.tsx';
import ScenarioVersionDetail from './pages/scenario/scenarioVersionDetail.tsx';
import ScenarioEditorPage from './pages/scenario/scenarioEditor.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: Home },
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
          { path: ":scenarioId/editor", Component: ScenarioEditorPage },
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
