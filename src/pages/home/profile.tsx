import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../ui/NavBar";

import { authClient } from "../../lib/auth-client";
import {
  ApiRequestError,
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
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error states
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Success states
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

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

      const response = await publicApiGet<{ item: User }>(`/api/public/users/${session.data.user.id}`, token);
      const userData = response.item;
      setUser(userData);
      setName(userData.name || "");
      setEmail(userData.email);
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

      const updateData: { name?: string; email?: string } = {};

      if (name !== user.name) {
        updateData.name = name;
      }

      if (email !== user.email) {
        updateData.email = email;
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

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    setUpdating(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (error) {
        setPasswordError(error.message || "Failed to change password");
      } else {
        setPasswordMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setUpdating(false);
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                {updating ? 'Updating…' : 'Update Profile'}
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
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                {updating ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;