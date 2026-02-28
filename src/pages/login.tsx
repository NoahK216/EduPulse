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
    setMessage(null);
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      } as any);

      if (error) {
        // show human-friendly message based on known codes
        let msg = error.message || "Failed to sign in";
        switch (error.code) {
          case "INVALID_EMAIL_OR_PASSWORD":
            msg = "Invalid email or password.";
            break;
          case "PASSWORD_REQUIRED":
            msg = "Password is required.";
            break;
          case "EMAIL_NOT_VERIFIED":
            msg = "Please verify your email before logging in.";
            break;
          case "USER_NOT_FOUND":
            msg = "No account exists with that email.";
            break;
          default:
            // keep existing message
        }
        setError(msg);
      } else {
        await authClient.getSession();
        navigate("/");
      }
    } catch (e: any) {
      console.error("login error", e);
      setError(e?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
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
              required
              className={`mt-2 w-full rounded-md border bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500 ${error ? 'border-red-500' : 'border-neutral-700'}`}/>
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