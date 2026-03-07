import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import NavBar from "../ui/NavBar";

import { authClient } from "../../lib/auth-client";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
      setIsValidToken(false);
    } else {
      setIsValidToken(true);
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authClient.resetPassword({
        token: token!,
        password,
      });

      if (error) {
        setError(error.message || "Failed to reset password");
      } else {
        setMessage("Password reset successfully! You can now sign in with your new password.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (e: any) {
      console.error("reset password error", e);
      setError(e.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
        <NavBar/>
        <main className="mx-auto max-w-md px-8 py-20">
          <h1 className="text-3xl font-semibold">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-neutral-300">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Request New Reset Link
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar/>
      <main className="mx-auto max-w-md px-8 py-20">
        <h1 className="text-3xl font-semibold">Set new password</h1>
        <p className="mt-2 text-sm text-neutral-300">
          Enter your new password below.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div aria-live="polite">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {message && <div className="text-green-400 text-sm">{message}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="New password"
              required
              minLength={8}
              className={`mt-2 w-full rounded-md border bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500 ${error ? 'border-red-500' : 'border-neutral-700'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm new password"
              required
              minLength={8}
              className={`mt-2 w-full rounded-md border bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500 ${error ? 'border-red-500' : 'border-neutral-700'}`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValidToken}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-neutral-300">
          Remember your password?
          <Link
            to="/login"
            className="ml-1 text-blue-400 hover:text-blue-300"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;