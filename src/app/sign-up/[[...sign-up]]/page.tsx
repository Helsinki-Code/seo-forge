import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export const metadata = { title: "Create account — SEO Forge" };

export default function SignUpPage() {
  return (
    <main className="grid-fade flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber" aria-hidden />
        <span className="display text-lg font-semibold">
          SEO<span className="text-primary">Forge</span>
        </span>
      </Link>
      <SignUp />
      <p className="text-xs text-fg-faint">
        Eight agents. One approval queue. Your rankings, compounding.
      </p>
    </main>
  );
}
