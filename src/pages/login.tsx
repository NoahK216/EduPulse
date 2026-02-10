import NavBar from "../scenario/creator/ui/NavBar";

function Login() {
  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar/>
      <main className="mx-auto max-w-md px-8 py-20">
        <h1 className="text-3xl font-semibold">Log in</h1>
        <form className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"/>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
            onClick={(e) => {
              e.preventDefault();
            }}>
            Sign in
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
          <button
            type="button"
            className="text-blue-400 hover:text-blue-300">
            Sign up
          </button>
        </div>
      </main>
      </div>
  );
}

export default Login;