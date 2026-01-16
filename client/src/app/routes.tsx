import type { RouteObject } from "react-router-dom";
import App from "./App";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />
  }
];

// TODO: Add auth and document routes.
