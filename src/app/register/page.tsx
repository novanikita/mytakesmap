"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = (await res.json()) as { error?: string; user?: { username: string } };
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created, but sign-in failed. Try logging in.");
        return;
      }

      router.push(`/${data.user!.username}`);
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
        <p className="mb-8 text-center text-sm text-white/50">Create your map</p>

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
            Username
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nikitanova"
              className="rounded border border-white/20 bg-transparent px-3 py-2 text-white outline-none focus:border-white/50"
            />
            <span className="text-xs text-white/35">
              mytakesmap.space/{username || "username"}
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
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
            {loading ? "Creating…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/45">
          Already have an account?{" "}
          <Link href="/login" className="text-white/80 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
