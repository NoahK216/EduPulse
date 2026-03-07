import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../ui/NavBar";

import { authClient } from "../../lib/auth-client";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await authClient.forgotPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message || "Failed to send reset email");
      } else {
        setMessage("If an account with that email exists, we've sent you a password reset link.");
      }
    } catch (e: any) {
      console.error("forgot password error", e);
      setError(e.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar/>
      <main className="mx-auto max-w-md px-8 py-20">
        <h1 className="text-3xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-neutral-300">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div aria-live="polite">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {message && <div className="text-green-400 text-sm">{message}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="Email"
              required
              className={`mt-2 w-full rounded-md border bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500 ${error ? 'border-red-500' : 'border-neutral-700'}`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
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

export default ForgotPassword;