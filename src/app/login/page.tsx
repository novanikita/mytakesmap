"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = (await sessionRes.json()) as {
        user?: { username?: string };
      };
      const username = session.user?.username;
      if (!username) {
        setError("Signed in, but profile is incomplete");
        return;
      }
      router.push(`/${username}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-3xl tracking-tight text-white">
          My Takes Map
        </h1>
        <p className="mb-8 text-center text-sm text-white/50">Sign in to your map</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-white/20 bg-transparent px-3 py-2 text-white outline-none focus:border-white/50"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-white/20 bg-transparent px-3 py-2 text-white outline-none focus:border-white/50"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded border border-white/30 px-4 py-2.5 text-sm text-white transition hover:border-white/60 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/45">
          No account?{" "}
          <Link
            href="/register"
            className="text-white/80 underline-offset-2 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
