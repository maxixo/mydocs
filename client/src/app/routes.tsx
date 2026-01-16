import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { SignIn } from "./SignIn";
import { SignUp } from "./SignUp";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
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
