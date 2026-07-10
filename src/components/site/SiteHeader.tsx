import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const nav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber" aria-hidden />
        <span className="display text-lg font-semibold tracking-tight">
          SEO<span className="text-primary">Forge</span>
        </span>
      </Link>
      <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto md:order-none md:w-auto">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap text-sm text-fg-mute transition-colors duration-200 hover:text-fg"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton>
            <button className="rounded-lg px-4 py-2 text-sm text-fg-mute transition-colors duration-200 hover:text-fg">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim">
              Get started
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim"
          >
            Dashboard
          </Link>
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
