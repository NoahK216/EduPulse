import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./ui/NavBar";
import { authClient } from "../lib/auth-client";

function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName || !lastName) {
      setError("First and last name are required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      });
      if (error) {
        setError(error.message || "Failed to sign up");
      } else {
        navigate("/login");
      }
    } catch (e: any) {
      console.error("signup error", e);
      setError(e?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar/>
      <main className="mx-auto max-w-md px-8 py-15">
        <h1 className="text-3xl font-semibold">Create Account</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="grid gap-5 grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              First Name
            </label>
            <input
                className="mt-2 w-half rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Last Name
            </label>
            <input
                className="mt-2 w-half rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"/>
          </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Email
            </label>
            <input
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Password
            </label>
            <input
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Confirm Password
            </label>
            <input
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Password"/>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Sign up'}
          </button>
        </form>
      </main>
      </div>
  );
}

export default Signup;
