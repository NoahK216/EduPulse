import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import './index.css'
import App from './App.tsx'
import ScenarioDemo from './scenario/viewer/demo.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: App },
      {
        path: "scenario",
        Component: ScenarioDemo
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
