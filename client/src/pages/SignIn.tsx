import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Call auth API to sign in with email/password.
  };

  const handleGoogleSignIn = () => {
    // TODO: Use Firebase Auth (Google provider) and exchange ID token with the server.
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign in</h2>
        <p>Access your collaborative workspace.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="sign-in-email">
            Email
          </label>
          <input
            id="sign-in-email"
            className="auth-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="auth-label" htmlFor="sign-in-password">
            Password
          </label>
          <input
            id="sign-in-password"
            className="auth-input"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="auth-button" type="submit">
            Sign in
          </button>
        </form>
        <div className="auth-divider">or</div>
        <button className="auth-google" type="button" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
        <p className="auth-footer">
          New here? <Link to="/auth/sign-up">Create an account</Link>
        </p>
      </div>
    </div>
  );
};
