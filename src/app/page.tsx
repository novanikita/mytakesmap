import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.username) {
    redirect(`/${session.user.username}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <h1 className="text-5xl tracking-tight text-white sm:text-6xl">
        My Takes Map
      </h1>
      <p className="mt-4 max-w-md text-center text-white/50">
        Place movies and books on your personal map. Share the link to your
        username.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/register"
          className="rounded-full border border-white/40 px-6 py-2.5 text-sm text-white transition hover:border-white"
        >
          Register
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/70 transition hover:border-white/50 hover:text-white"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
