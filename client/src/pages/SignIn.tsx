import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OAuthGoogleButton } from "./OAuthGoogleButton";
import { signInWithEmail } from "../services/auth.service";

export const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithEmail(email, password);
      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("auth_provider", "better-auth");
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
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
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error ? <p className="auth-error">{error}</p> : null}
        <div className="auth-divider">or</div>
        <OAuthGoogleButton label="Sign in with Google" />
        <p className="auth-footer">
          New here? <Link to="/auth/sign-up">Create an account</Link>
        </p>
      </div>
    </div>
  );
};
