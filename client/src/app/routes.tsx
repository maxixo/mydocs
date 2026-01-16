import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { ProtectedRoute } from "./ProtectedRoute";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    )
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
