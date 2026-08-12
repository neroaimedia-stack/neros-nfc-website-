export default function AccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-center text-3xl font-bold text-black">
        Set up your card
      </h1>
      <p className="mt-3 text-center text-sm text-black/60">
        Log in to manage your profile, or create an account to claim a new
        card.
      </p>

      <div className="mt-10 rounded-3xl border border-black/10 p-8 shadow-sm">
        <form className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-black" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-black"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Log In
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-black/40">
          <div className="h-px flex-1 bg-black/10" />
          New here
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <button className="w-full rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-60">
          Create Account
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-black/40">
        Setting up a new card? You&apos;ll be asked for the activation code
        found inside your card&apos;s packaging.
      </p>
    </main>
  );
}
