import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Sign in — SEO Forge" };

export default function SignInPage() {
  return (
    <main className="grid-fade flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber" aria-hidden />
        <span className="display text-lg font-semibold">
          SEO<span className="text-primary">Forge</span>
        </span>
      </Link>
      <SignIn />
      <p className="text-xs text-fg-faint">
        Your agents kept working while you were away.
      </p>
    </main>
  );
}
