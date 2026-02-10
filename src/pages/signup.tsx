import NavBar from "./ui/NavBar";

function Signup() {
  return (
    <div className="min-h-screen w-screen bg-neutral-900 text-neutral-150 pt-10">
      <NavBar/>
      <main className="mx-auto max-w-md px-8 py-15">
        <h1 className="text-3xl font-semibold">Create Account</h1>
        <form className="mt-8 space-y-4">
          <div className="grid gap-5 grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              First Name
            </label>
            <input
                className="mt-2 w-half rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="text"
                placeholder="First Name"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Last Name
            </label>
            <input
                className="mt-2 w-half rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="text"
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
                placeholder="Email"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Password
            </label>
            <input
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="password"
                placeholder="Password"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-200">
              Confirm Password
            </label>
            <input
                className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
                type="password"
                placeholder="Password"/>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
            onClick={(e) => {
              e.preventDefault();
            }}>
            Sign up
          </button>
        </form>
      </main>
      </div>
  );
}

export default Signup;
