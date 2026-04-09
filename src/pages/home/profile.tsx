import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../ui/NavBar";

import { authClient } from "../../lib/auth-client";
import {
  ApiRequestError,
  clearPublicApiTokenCache,
  publicApiDelete,
  publicApiGet,
  publicApiPut,
  resolvePublicApiToken,
} from "../../lib/public-api-client";

interface User {
  id: number;
  auth_user_id: string | null;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  created_classroom_count: number;
  classroom_membership_count: number;
  owned_scenario_count: number;
  attempt_count: number;
}

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Error states
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Success states
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [confirmDataDeletion, setConfirmDataDeletion] = useState(false);
  const [confirmNoRecovery, setConfirmNoRecovery] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const session = await authClient.getSession();
      if (!session.data?.user) {
        navigate("/login");
        return;
      }

      const token = await resolvePublicApiToken();
      if (!token) {
        setProfileError("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await publicApiGet<{ items: User[] }>(
        "/api/public/users?page=1&pageSize=1",
        token
      );
      const userData = response.items[0];
      if (!userData) {
        setProfileError("Failed to load profile");
        return;
      }
      setUser(userData);
      setName(userData.name || "");
    } catch (error) {
      console.error("Failed to load user profile:", error);
      if (error instanceof ApiRequestError) {
        setProfileError(error.message);
      } else {
        setProfileError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileError(null);
    setProfileMessage(null);
    setUpdating(true);

    try {
      const token = await resolvePublicApiToken();
      if (!token) {
        setProfileError("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const updateData: { name?: string } = {};

      if (name !== user.name) {
        updateData.name = name;
      }

      if (Object.keys(updateData).length === 0) {
        setProfileMessage("No changes to save");
        return;
      }

      const response = await publicApiPut<{ item: User }>(`/api/public/users/${user.id}`, token, updateData);
      setUser(response.item);
      setProfileMessage("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (error instanceof ApiRequestError) {
        setProfileError(error.message);
      } else {
        setProfileError("Failed to update profile");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (!currentPassword || !newPassword) {
      setPasswordError("Current password and new password are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordUpdating(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (error) {
        setPasswordError(error.message || "Failed to change password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage("Password updated successfully.");
    } catch (error: any) {
      setPasswordError(error?.message || "Failed to change password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setDeleteError(null);
    if (deleteConfirmText !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm account deletion.');
      return;
    }
    if (!confirmDataDeletion || !confirmNoRecovery) {
      setDeleteError("Please confirm both security acknowledgements before deleting.");
      return;
    }

    setDeletingAccount(true);
    try {
      const token = await resolvePublicApiToken();
      if (!token) {
        setDeleteError("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      await publicApiDelete("/api/public/users/me", token, {
        confirm: "DELETE",
        acknowledgeDataDeletion: true,
        acknowledgeNoRecovery: true,
      });
      clearPublicApiTokenCache();

      // Account/session may already be revoked by backend deletion. Sign out best-effort.
      try {
        await authClient.signOut();
      } catch {
        // Ignore sign-out failures after account deletion.
      }

      navigate("/signup", { replace: true });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Failed to delete account.");
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
        <NavBar />
        <main className="mx-auto max-w-2xl px-8 py-20">
          <div className="text-center">Loading profile...</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
        <NavBar />
        <main className="mx-auto max-w-2xl px-8 py-20">
          <div className="text-center text-red-400">Failed to load profile</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar />
      <main className="mx-auto max-w-2xl px-8 py-20">
        <h1 className="text-3xl font-semibold mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div aria-live="polite">
                {profileError && <div className="text-red-400 text-sm">{profileError}</div>}
                {profileMessage && <div className="text-green-400 text-sm">{profileMessage}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-400 outline-none"
                />
                <p className="mt-2 text-xs text-neutral-400">
                  Email is managed by Neon Auth and can't be edited here.
                </p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div aria-live="polite">
                {passwordError && <div className="text-red-400 text-sm">{passwordError}</div>}
                {passwordMessage && <div className="text-green-400 text-sm">{passwordMessage}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={passwordUpdating}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {passwordUpdating ? "Updating..." : "Update Password"}
                </button>
                <Link
                  to="/forgot-password"
                  className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-600"
                >
                  Forgot password flow
                </Link>
              </div>
            </form>
          </div>

          <div className="rounded-lg border border-red-800/70 bg-neutral-800 p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Delete Account</h2>
            <p className="text-sm text-neutral-300 mb-4">
              This permanently deletes your EduPulse account and related data.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div aria-live="polite">
                {deleteError && <div className="text-sm text-red-400">{deleteError}</div>}
              </div>
              <label className="flex items-start gap-3 rounded-md border border-red-900/60 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={confirmDataDeletion}
                  onChange={(e) => setConfirmDataDeletion(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I understand all my classrooms, scenarios, assignments, and attempts may be permanently deleted.
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-md border border-red-900/60 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={confirmNoRecovery}
                  onChange={(e) => setConfirmNoRecovery(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I understand this action cannot be undone and account recovery is not guaranteed.
                </span>
              </label>
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full rounded-md border border-red-800/70 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-red-600"
                  placeholder="DELETE"
                />
              </div>
              <button
                type="submit"
                disabled={deletingAccount}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deletingAccount ? "Deleting..." : "Delete my account"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
