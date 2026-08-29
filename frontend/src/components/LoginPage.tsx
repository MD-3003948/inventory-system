import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api";
import { FormField } from "./FormField";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ username, password });
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Could not reach the server. Please try again shortly.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-term-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="terminal-panel w-full max-w-sm p-6"
      >
        <h1 className="text-xl font-semibold">Inventory System</h1>
        <p className="mt-1 text-sm text-term-green/60">// sign in to continue</p>

        <div className="mt-6 flex flex-col gap-3">
          <FormField label="Username">
            <input
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="terminal-input"
            />
          </FormField>
          <FormField label="Password">
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="terminal-input"
            />
          </FormField>
        </div>

        {error && <p className="mt-3 text-sm text-term-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="terminal-button mt-4 w-full"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
