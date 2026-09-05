import { useAuth } from "../context/AuthContext";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { privilegeLevelLabel } from "../types";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-term-amber">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto w-[95%] max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-term-green/60">Your account information.</p>

      <div className="terminal-panel mt-6 grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
        <InfoField label="User Code" value={user.userCode} />
        <InfoField label="Full Name" value={`${user.firstName} ${user.lastName}`} />
        <InfoField label="Username" value={user.username} />
        <InfoField label="Organization" value={user.organization} />
        <InfoField label="Department" value={user.departmentName ?? "—"} />
        <InfoField label="Privilege Level" value={privilegeLevelLabel(user.privilegeLevel)} />
        <InfoField
          label="Last Login"
          value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "This is your first login"}
        />
        <InfoField label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
      </div>

      <div className="terminal-panel mt-6 p-6">
        <h2 className="text-sm">Change Password</h2>
        <div className="mt-4 max-w-sm">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
