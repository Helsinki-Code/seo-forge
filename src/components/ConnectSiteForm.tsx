"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Globe, Loader2, Plug } from "lucide-react";

type Platform = "github" | "wordpress";

export default function ConnectSiteForm() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("github");
  const [form, setForm] = useState({
    name: "",
    url: "",
    githubRepo: "",
    githubToken: "",
    wpUsername: "",
    wpAppPassword: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [existing, setExisting] = useState(false);

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((j) => {
        if (j.site) {
          setExisting(true);
          setPlatform((j.site.platform as Platform) ?? "github");
          setForm((f) => ({
            ...f,
            name: j.site.name ?? "",
            url: j.site.url ?? "",
            githubRepo: j.site.github_repo ?? "",
            wpUsername: j.site.wp_username ?? "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          url: form.url,
          platform,
          ...(platform === "github"
            ? {
                githubRepo: form.githubRepo,
                ...(form.githubToken ? { githubToken: form.githubToken } : {}),
              }
            : {
                wpUsername: form.wpUsername,
                ...(form.wpAppPassword ? { wpAppPassword: form.wpAppPassword } : {}),
              }),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.toString?.() ?? "failed");
      if (json.wpVerified === false) {
        setMsg({
          ok: false,
          text: "Saved, but WordPress rejected the credentials — check username & application password.",
        });
      } else {
        setMsg({ ok: true, text: "Site connected! Redirecting to mission control…" });
        setTimeout(() => router.push("/dashboard"), 900);
      }
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to save" });
    } finally {
      setBusy(false);
    }
  }

  const input =
    "rounded-lg border border-edge bg-panel-2 px-3 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:border-primary";

  return (
    <form onSubmit={submit} className="panel flex flex-col gap-5 p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-name" className="text-xs text-fg-mute">
            Site name
          </label>
          <input
            id="s-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="My Travel Blog"
            className={input}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-url" className="text-xs text-fg-mute">
            Website URL
          </label>
          <input
            id="s-url"
            type="url"
            required
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://yoursite.com"
            className={input}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs text-fg-mute">How is your site deployed?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPlatform("github")}
            aria-pressed={platform === "github"}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-200 ${
              platform === "github"
                ? "border-primary bg-primary/10"
                : "border-edge bg-panel-2 hover:border-edge-2"
            }`}
          >
            <GitBranch size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block text-sm font-semibold">GitHub repository</span>
              <span className="mt-0.5 block text-xs text-fg-mute">
                Agents push seo/* branches; you approve PRs; your pipeline deploys.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform("wordpress")}
            aria-pressed={platform === "wordpress"}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-200 ${
              platform === "wordpress"
                ? "border-primary bg-primary/10"
                : "border-edge bg-panel-2 hover:border-edge-2"
            }`}
          >
            <Globe size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block text-sm font-semibold">WordPress</span>
              <span className="mt-0.5 block text-xs text-fg-mute">
                Agents propose changes; approving applies them via the WordPress API.
              </span>
            </span>
          </button>
        </div>
      </fieldset>

      {platform === "github" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-repo" className="text-xs text-fg-mute">
              Repository (owner/repo)
            </label>
            <input
              id="s-repo"
              required
              value={form.githubRepo}
              onChange={(e) => setForm({ ...form, githubRepo: e.target.value })}
              placeholder="yourname/your-site"
              className={input}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-token" className="text-xs text-fg-mute">
              Fine-grained PAT {existing && <span className="text-fg-faint">(blank = keep current)</span>}
            </label>
            <input
              id="s-token"
              type="password"
              value={form.githubToken}
              onChange={(e) => setForm({ ...form, githubToken: e.target.value })}
              placeholder="github_pat_…"
              className={input}
            />
            <p className="text-[11px] text-fg-faint">
              Needs Contents + Pull requests read/write on that repo. Stored encrypted.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-wpuser" className="text-xs text-fg-mute">
              WordPress username
            </label>
            <input
              id="s-wpuser"
              required
              value={form.wpUsername}
              onChange={(e) => setForm({ ...form, wpUsername: e.target.value })}
              placeholder="admin"
              className={input}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-wppass" className="text-xs text-fg-mute">
              Application password {existing && <span className="text-fg-faint">(blank = keep current)</span>}
            </label>
            <input
              id="s-wppass"
              type="password"
              value={form.wpAppPassword}
              onChange={(e) => setForm({ ...form, wpAppPassword: e.target.value })}
              placeholder="xxxx xxxx xxxx xxxx"
              className={input}
            />
            <p className="text-[11px] text-fg-faint">
              WP Admin → Users → Profile → Application Passwords. Stored encrypted.
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-amber-400 disabled:opacity-50"
      >
        {busy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Plug size={15} aria-hidden />}
        {busy ? "Connecting…" : existing ? "Update connection" : "Connect site"}
      </button>
      {msg && (
        <p className={`text-xs ${msg.ok ? "text-mint" : "text-rose"}`} role="status">
          {msg.text}
        </p>
      )}
    </form>
  );
}
