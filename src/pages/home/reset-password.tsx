import { type FormEvent, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NavBar from "../ui/NavBar";
import { authClient } from "../../lib/auth-client";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (error) {
        setError(error.message || "Could not reset password.");
        return;
      }

      setSuccessMessage("Password updated. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Could not reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar />
      <main className="mx-auto max-w-md px-8 py-20">
        <h1 className="text-3xl font-semibold mb-8">Set new password</h1>
        
        {token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div aria-live="polite">
              {error && <div className="text-sm text-red-400">{error}</div>}
              {successMessage && <div className="text-sm text-green-400">{successMessage}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-200">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-200">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Set new password"}
            </button>
          </form>
        ) : (
          <div className="text-red-400 text-sm">
            Invalid or missing reset token. Please request a new password reset.
          </div>
        )}
      </main>
    </div>
  );
}

export default ResetPassword;
