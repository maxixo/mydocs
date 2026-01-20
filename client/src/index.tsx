import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { AppProvider } from "./app/store";
import "./main.css";
import { registerServiceWorker } from "./workers/serviceWorker";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
);

registerServiceWorker();
