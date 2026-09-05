import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api";
import { FormField } from "./FormField";

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change the password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <FormField label="Current Password">
        <input
          required
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="terminal-input"
        />
      </FormField>
      <FormField label="New Password">
        <input
          required
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="terminal-input"
        />
      </FormField>
      <FormField label="Confirm New Password">
        <input
          required
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="terminal-input"
        />
      </FormField>

      {error && <p className="text-sm text-term-danger">{error}</p>}
      {success && <p className="text-sm text-term-green">Password changed successfully.</p>}

      <button type="submit" disabled={submitting} className="terminal-button self-start">
        {submitting ? "Saving..." : "Change Password"}
      </button>
    </form>
  );
}
