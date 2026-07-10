import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid-fade flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="display text-7xl font-bold text-primary glow-primary">404</p>
      <h1 className="text-xl font-semibold">This page fell out of the index.</h1>
      <p className="max-w-md text-sm text-fg-mute">
        The URL you requested doesn&apos;t exist. Even our SEO agents couldn&apos;t rank it.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim"
      >
        Back to home
      </Link>
    </main>
  );
}
