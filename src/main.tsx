import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import Home from './pages/home/home.tsx'
import Login from "./pages/home/login.tsx";
import Classroom from "./pages/classroom/classroom.tsx";
import Signup from "./pages/home/signup.tsx";
import ClassroomDetail from './pages/classroom/classroomDetail.tsx';
import ClassroomMemberDetail from './pages/classroom/classroomMemberDetail.tsx';
import AssignmentDetail from './pages/classroom/assignmentDetail.tsx';
import AttemptDetail from './pages/classroom/attemptDetail.tsx';
import ResponseDetail from './pages/classroom/responseDetail.tsx';
import ScenarioLibrary from './pages/scenario/scenarioLibrary.tsx';
import ScenarioEditorPage from './pages/scenario/scenarioEditor.tsx';
import ScenarioNewPage from './pages/scenario/scenarioNew.tsx';
import ScenarioViewerPage from './pages/scenario/scenarioViewerPage.tsx';

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
          { index: true, Component: ScenarioLibrary },
          { path: "new", Component: ScenarioNewPage },
          { path: ":scenarioId/viewer", Component: ScenarioViewerPage },
          { path: ":scenarioId/editor", Component: ScenarioEditorPage },
          { path: "library", Component: ScenarioLibrary },
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
