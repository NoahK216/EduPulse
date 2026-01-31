import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import App from './App.tsx'
import ScenarioDemo from './scenario/viewer/demo.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: ScenarioDemo },
      { path: "scenario", Component: ScenarioDemo },
      { path: "grader", Component: App },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
