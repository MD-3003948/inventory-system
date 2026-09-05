import { useEffect, useState } from "react";
import { departmentsApi, userAccountsApi, ApiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { UserAccountForm } from "./UserAccountForm";
import type { CreateUserInput, Department, ManagedUser, UpdateUserInput } from "../types";
import { privilegeLevelLabel } from "../types";

interface GeneratedPasswordInfo {
  userCode: string;
  username: string;
  password: string;
}

export function UserAccountsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<GeneratedPasswordInfo | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [userList, departmentList] = await Promise.all([userAccountsApi.list(), departmentsApi.list()]);
      setUsers(userList);
      setDepartments(departmentList);
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (input: CreateUserInput) => {
    setError(null);
    try {
      const result = await userAccountsApi.create(input);
      setGeneratedPassword({
        userCode: result.user.userCode,
        username: result.user.username,
        password: result.generatedPassword,
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the user.");
    }
  };

  const handleResetPassword = async (u: ManagedUser) => {
    setError(null);
    try {
      const result = await userAccountsApi.resetPassword(u.id);
      setGeneratedPassword({ userCode: u.userCode, username: u.username, password: result.generatedPassword });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset the password.");
    }
  };

  const handleUpdate = async (id: number, input: UpdateUserInput) => {
    setError(null);
    try {
      await userAccountsApi.update(id, input);
      setEditingUser(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the user.");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await userAccountsApi.remove(id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the user.");
    }
  };

  return (
    <div className="mx-auto w-[95%] py-10">
      <h1 className="text-2xl font-semibold">User Accounts</h1>
      <p className="mt-1 text-sm text-term-green/60">Create accounts, assign departments, and set privilege levels.</p>

      {generatedPassword && (
        <div className="terminal-panel mt-6 flex items-center justify-between gap-4 border-term-green p-4">
          <p className="text-sm">
            Temporary password for <span className="font-semibold text-term-amber">{generatedPassword.username}</span>{" "}
            ({generatedPassword.userCode}):{" "}
            <span className="font-mono text-lg font-semibold text-term-green">{generatedPassword.password}</span>
            <br />
            <span className="text-term-green/60">Copy this now — it won't be shown again. They'll be asked to change it on first login.</span>
          </p>
          <button onClick={() => setGeneratedPassword(null)} className="terminal-button-secondary shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-6">
        <UserAccountForm
          departments={departments}
          editingUser={editingUser}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditingUser(null)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-term-danger">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-term-green/60">Loading...</p>
      ) : users.length === 0 ? (
        <p className="mt-6 text-sm text-term-green/60">No users yet.</p>
      ) : (
        <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
          <thead className="bg-term-panel text-term-amber">
            <tr>
              <th className="px-4 py-2">User Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Privilege</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Last Login</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.username === currentUser?.username;
              return (
                <tr key={u.id} className="border-t border-term-amber/30">
                  <td className="px-4 py-2 font-medium">{u.userCode}</td>
                  <td className="px-4 py-2">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-2 text-term-green/70">{u.username}</td>
                  <td className="px-4 py-2 text-term-green/70">{privilegeLevelLabel(u.privilegeLevel)}</td>
                  <td className="px-4 py-2 text-term-green/70">{u.departmentName ?? "—"}</td>
                  <td className="px-4 py-2">
                    {u.mustChangePassword ? (
                      <span className="text-term-amber">Pending Password Change</span>
                    ) : (
                      <span className="text-term-green/70">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-term-green/70">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button onClick={() => setEditingUser(u)} className="mr-3 text-term-amber hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleResetPassword(u)} className="mr-3 text-term-amber hover:underline">
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={isSelf}
                      title={isSelf ? "You cannot delete your own account" : undefined}
                      className="text-term-danger hover:underline disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:no-underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
