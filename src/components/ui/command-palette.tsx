"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command as CommandIcon,
  LayoutDashboard,
  Bot,
  LineChart,
  FileText,
  GitPullRequest,
  Image as ImageIcon,
  Settings,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const { useState, useEffect, useRef, useCallback } = React;

type PaletteCategory = "Navigate" | "Ask the team";

type PaletteItem = {
  id: string;
  title: string;
  description: string;
  category: PaletteCategory;
  icon: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  onSelect: (router: ReturnType<typeof useRouter>) => void;
};

const NAV_ITEMS: PaletteItem[] = [
  {
    id: "nav-dashboard",
    title: "Mission Control",
    description: "SEO health, rankings, and live agent activity",
    category: "Navigate",
    icon: <LayoutDashboard className="h-3.5 w-3.5" />,
    keywords: ["overview", "home", "health"],
    onSelect: (router) => router.push("/dashboard"),
  },
  {
    id: "nav-agents",
    title: "Agent Team",
    description: "Supervisor, Content Growth, Search Optimization, Site Experience",
    category: "Navigate",
    icon: <Bot className="h-3.5 w-3.5" />,
    keywords: ["agents", "team", "supervisor"],
    onSelect: (router) => router.push("/dashboard/agents"),
  },
  {
    id: "nav-rankings",
    title: "Rankings",
    description: "SERP positions and keyword tracking",
    category: "Navigate",
    icon: <LineChart className="h-3.5 w-3.5" />,
    keywords: ["serp", "keywords", "positions"],
    onSelect: (router) => router.push("/dashboard/rankings"),
  },
  {
    id: "nav-content",
    title: "Content Operations",
    description: "Optimization plan and content run history",
    category: "Navigate",
    icon: <FileText className="h-3.5 w-3.5" />,
    keywords: ["content", "articles", "calendar"],
    onSelect: (router) => router.push("/dashboard/content"),
  },
  {
    id: "nav-approvals",
    title: "Approvals",
    description: "Review and approve pending proposals",
    category: "Navigate",
    icon: <GitPullRequest className="h-3.5 w-3.5" />,
    keywords: ["approve", "pr", "proposals", "review"],
    onSelect: (router) => router.push("/dashboard/approvals"),
  },
  {
    id: "nav-media",
    title: "Media",
    description: "Generated images and brand-matched assets",
    category: "Navigate",
    icon: <ImageIcon className="h-3.5 w-3.5" />,
    keywords: ["images", "assets", "media"],
    onSelect: (router) => router.push("/dashboard/media"),
  },
  {
    id: "nav-settings",
    title: "Settings",
    description: "Connections, credentials, and agent roster",
    category: "Navigate",
    icon: <Settings className="h-3.5 w-3.5" />,
    keywords: ["settings", "connect", "github", "wordpress"],
    onSelect: (router) => router.push("/dashboard/settings"),
  },
];

export type CommandPaletteProps = {
  /** Extra items rendered above navigation — used to wire natural-language
   * dispatch to the Workflow Supervisor once that endpoint exists. */
  extraItems?: PaletteItem[];
};

export default function CommandPalette({ extraItems = [] }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const allItems = React.useMemo(() => [...extraItems, ...NAV_ITEMS], [extraItems]);

  const filtered = useCallback(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
      return inTitle || inDesc || inKeywords;
    });
  }, [allItems, searchTerm]);

  const runSelected = useCallback(
    (item: PaletteItem) => {
      item.onSelect(router);
      setOpen(false);
    },
    [router],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        setSelectedIndex(0);
        setSearchTerm("");
        return;
      }
      if (!open) return;
      const items = filtered();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[selectedIndex];
        if (item) runSelected(item);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, selectedIndex, filtered, runSelected]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (open && itemsRef.current[selectedIndex]) {
      itemsRef.current[selectedIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex, open]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && open) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const items = filtered();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:text-foreground"
        aria-label="Open command palette"
        title="Cmd/Ctrl+K"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Ask the team or jump to…</span>
        <kbd className="ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/60 pt-[15vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              ref={ref}
              className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
            >
              <div className="flex items-center gap-2 border-b border-border px-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  className="h-12 w-full border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ask the team (e.g. “investigate our traffic loss”) or jump to a page…"
                  autoFocus
                />
                <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Esc
                </kbd>
              </div>

              <div className="max-h-[50vh] overflow-y-auto py-2">
                {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground">
                      No match for &ldquo;{searchTerm}&rdquo;
                    </p>
                  </div>
                )}
                {(["Ask the team", "Navigate"] as PaletteCategory[]).map((cat) => {
                  const group = items.filter((i) => i.category === cat);
                  if (group.length === 0) return null;
                  return (
                    <div key={cat} className="px-2 py-1">
                      <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {cat}
                      </div>
                      {group.map((item) => {
                        const globalIdx = items.findIndex((i) => i.id === item.id);
                        const isSelected = selectedIndex === globalIdx;
                        return (
                          <div
                            key={item.id}
                            ref={(el) => {
                              itemsRef.current[globalIdx] = el;
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            onClick={() => runSelected(item)}
                            className={`mx-1 flex cursor-pointer items-center justify-between rounded-md px-2 py-2 transition-colors duration-100 ${
                              isSelected ? "bg-primary/15 text-foreground" : "text-foreground/90 hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                                  isSelected ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"
                                }`}
                              >
                                {item.icon}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">{item.title}</span>
                                <span className="text-[11px] text-muted-foreground">{item.description}</span>
                              </div>
                            </div>
                            {item.shortcut && (
                              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {item.shortcut}
                              </kbd>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CommandIcon className="h-3 w-3" aria-hidden /> + K to toggle
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↑</kbd>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↓</kbd>
                  navigate
                  <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5">↵</kbd>
                  select
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { CommandPalette };
