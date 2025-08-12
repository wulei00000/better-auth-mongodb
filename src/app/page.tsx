"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 gap-16">
      {/* Header */}
      <header className="w-full flex items-center justify-between max-w-6xl">
        <h1 className="text-2xl font-bold">Better Auth MongoDB</h1>
        <nav className="flex items-center gap-4">
          {isPending ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {session.user.name || session.user.email}
              </span>
              <Button asChild>
                <Link href="/todos">Todos</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-2xl">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Next.js Template
          </h2>
          <p className="text-xl text-muted-foreground">
            A modern authentication template built with Next.js, Better Auth, and MongoDB
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="p-6 border rounded-lg space-y-2">
            <h3 className="font-semibold">🔐 Better Auth</h3>
            <p className="text-sm text-muted-foreground">
              Modern authentication for TypeScript
            </p>
          </div>
          <div className="p-6 border rounded-lg space-y-2">
            <h3 className="font-semibold">🍃 MongoDB</h3>
            <p className="text-sm text-muted-foreground">
              Modern general purpose database
            </p>
          </div>
          <div className="p-6 border rounded-lg space-y-2">
            <h3 className="font-semibold">🎨 shadcn/ui</h3>
            <p className="text-sm text-muted-foreground">
              Beautiful, accessible UI components
            </p>
          </div>
        </div>

        {!session && (
          <div className="flex gap-4 items-center mt-8">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="row-start-3 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Better Auth, MongoDB, and shadcn/ui</p>
      </footer>
    </div>
  );
}