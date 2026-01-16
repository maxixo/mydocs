import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

export const SignUp = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Call auth API to create a new account.
  };

  const handleGoogleSignIn = () => {
    // TODO: Use Firebase Auth (Google provider) and exchange ID token with the server.
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
          <button className="auth-button" type="submit">
            Sign up
          </button>
        </form>
        <div className="auth-divider">or</div>
        <button className="auth-google" type="button" onClick={handleGoogleSignIn}>
          Continue with Google
        </button>
        <p className="auth-footer">
          Already have an account? <Link to="/auth/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
