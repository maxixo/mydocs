import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OAuthGoogleButton } from "./OAuthGoogleButton";
import { signUpWithEmail } from "../services/auth.service";

export const SignUp = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signUpWithEmail(displayName, email, password);
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("auth_provider", "better-auth");
      }
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <p>Set up your profile to start collaborating.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="sign-up-name">
            Display name
          </label>
          <input
            id="sign-up-name"
            className="auth-input"
            type="text"
            name="displayName"
            autoComplete="name"
            placeholder="Jordan Lee"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
          <label className="auth-label" htmlFor="sign-up-email">
            Email
          </label>
          <input
            id="sign-up-email"
            className="auth-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="auth-label" htmlFor="sign-up-password">
            Password
          </label>
          <input
            id="sign-up-password"
            className="auth-input"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        {error ? <p className="auth-error">{error}</p> : null}
        <div className="auth-divider">or</div>
        <OAuthGoogleButton label="Continue with Google" />
        <p className="auth-footer">
          Already have an account? <Link to="/auth/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
