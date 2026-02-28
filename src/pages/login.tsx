import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "./ui/NavBar";

import { authClient } from "../lib/auth-client";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setMessage(null);
    // if password is empty we assume magic-link/passwordless flow
    const payload: { email: string; password?: string } = { email };
    if (password) payload.password = password;
    const { error } = await authClient.signIn.email(payload as any);
    setIsSubmitting(false);
    if (error) {
      setError(error.message || "Failed to sign in");
    } else {
      if (!password) {
        setMessage("If an account exists, you should receive a magic link shortly.");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar/>
      <main className="mx-auto max-w-md px-8 py-20">
        <h1 className="text-3xl font-semibold">Log in</h1>
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
              className={`mt-2 w-full rounded-md border bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500 ${error ? 'border-red-500' : 'border-neutral-700'}`}/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              className={`mt-2 w-full rounded-md border bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500 ${error ? 'border-red-500' : 'border-neutral-700'}`}/>
            <p className="mt-1 text-xs text-neutral-400">
              Leave blank to request a magic link
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
            <div className="mt-2 text-right">
              <button
                type="button"
                className="w-full text-sm text-blue-400 hover:text-blue-300">
                Forgot your password?
              </button>
            </div>
        <div className="mt-6 text-center text-sm text-neutral-300">
          Don’t have an account?
          <Link
            to="/signup"
            className="rounded-md bg-neutral-800 text-white! px-4 py-2 text-sm font-medium hover:bg-neutral-600">
            Sign up
          </Link>
        </div>
      </main>
      </div>
  );
}

export default Login;