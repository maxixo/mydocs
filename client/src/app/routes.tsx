import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { ProtectedRoute } from "./ProtectedRoute";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";
import { Editor } from "../pages/Editor";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      // <ProtectedRoute>
        <App />
    )
  },
  {
    path: "/editor",
    element: <Editor />
  },
  {
    path: "/auth/sign-in",
    element: <SignIn />
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />
  }
]);

// TODO: Add protected document routes and auth guards.
