import { useAuth } from "../context/AuthContext";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function ChangePasswordGate() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-term-bg px-4">
      <div className="terminal-panel w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold">Password Change Required</h1>
        <p className="mt-1 text-sm text-term-green/60">
          // your password was set by an administrator - choose a new one to continue
        </p>

        <div className="mt-6">
          <ChangePasswordForm />
        </div>

        <button
          onClick={logout}
          className="mt-4 text-sm text-term-green/60 hover:text-term-amber hover:underline"
        >
          Log out instead
        </button>
      </div>
    </div>
  );
}
