import Link from "next/link";
import { Plug } from "lucide-react";

export default function ConnectPrompt() {
  return (
    <div className="panel mx-auto mt-10 flex max-w-xl flex-col items-center gap-4 p-10 text-center">
      <Plug size={28} className="text-primary" aria-hidden />
      <h2 className="text-lg font-semibold">Connect your website first</h2>
      <p className="text-sm leading-relaxed text-fg-mute">
        The agent team needs a target. Connect a GitHub-deployed site (changes ship as
        pull requests you approve) or a WordPress site (changes apply via the WordPress
        API when you approve them).
      </p>
      <Link
        href="/dashboard/connect"
        className="rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-amber-400"
      >
        Connect your site
      </Link>
    </div>
  );
}
