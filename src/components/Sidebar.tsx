"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  GitPullRequest,
  Image as ImageIcon,
  LayoutDashboard,
  LineChart,
  Newspaper,
  Settings,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/rankings", label: "Rankings", icon: LineChart },
  { href: "/dashboard/content", label: "Content", icon: Newspaper },
  { href: "/dashboard/approvals", label: "Approvals", icon: GitPullRequest },
  { href: "/dashboard/media", label: "Media", icon: ImageIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-edge bg-panel px-3 py-2 md:h-screen md:w-56 md:flex-col md:border-b-0 md:border-r md:px-3 md:py-6 md:sticky md:top-0">
      <Link href="/" className="mb-0 hidden items-center gap-2 px-3 md:mb-8 md:flex">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber" aria-hidden />
        <span className="display text-base font-semibold">
          SEO<span className="text-primary">Forge</span>
        </span>
      </Link>
      {nav.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
              active
                ? "bg-primary/15 text-primary"
                : "text-fg-mute hover:bg-panel-2 hover:text-fg"
            }`}
          >
            <item.icon size={17} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
