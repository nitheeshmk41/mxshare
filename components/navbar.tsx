"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="p-4 border-b flex justify-between">
      <a href="/" className="font-bold text-xl">MXShare</a>
      {!session ? (
        <button
          className="btn"
          onClick={() => signIn("google")}
        >
          Login
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm">Dashboard</a>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt={session.user.name || 'user'} className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm">{session.user?.name}</span>
            <button className="btn" onClick={() => signOut()}>Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}
