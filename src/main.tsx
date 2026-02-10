import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import App from './App.tsx'
import ScenarioViewerDemo from './scenario/viewer/viewerDemo.tsx';
import ScenarioCreatorDemo from './scenario/creator/creatorDemo.tsx';
import Login from "./pages/login";
import Classroom from "./pages/classroom";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: App },
      { path: "login", Component: Login },
      { path: "classroom", Component: Classroom },
      {
        path: "scenario",
        children: [
          { index: true, Component: ScenarioViewerDemo },
          { path: "viewer", Component: ScenarioViewerDemo },
          { path: "creator", Component: ScenarioCreatorDemo },
        ]
      },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
