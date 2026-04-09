import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../ui/NavBar";
import { authClient } from "../../lib/auth-client";

function ForgotPassword() {
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message || "Could not send reset email.");
        return;
      }

      setRequestedEmail(email.trim());
    } catch (err: any) {
      setError(err?.message || "Could not send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar />
      <main className="mx-auto max-w-md px-8 py-20">
        <h1 className="text-3xl font-semibold mb-8">Reset your password</h1>
        {requestedEmail ? (
          <div className="space-y-4 rounded-lg border border-neutral-700 bg-neutral-800 p-5">
            <p className="text-sm text-neutral-200">
              Password reset email sent to <span className="font-semibold">{requestedEmail}</span>.
              Use the link in that email to continue.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRequestedEmail(null)}
                className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-600"
              >
                Send again
              </button>
              <Link
                to="/login"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div aria-live="polite">
              {error && <div className="text-sm text-red-400">{error}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default ForgotPassword;
