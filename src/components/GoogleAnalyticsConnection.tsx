"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CheckCircle2, ExternalLink, Unplug } from "lucide-react";

type Connection = {
  id: string;
  email: string;
  status: string;
  last_verified_at: string | null;
};

type Resource = {
  id: string;
  connection_id: string;
  site_id: string | null;
  external_id: string;
  display_name: string;
  account_name: string | null;
};

export default function GoogleAnalyticsConnection({
  siteId,
  connections,
  resources,
  result,
}: {
  siteId: string;
  connections: Connection[];
  resources: Resource[];
  result?: string;
}) {
  const router = useRouter();
  const activeConnectionIds = new Set(connections.filter((connection) => connection.status === "active").map((connection) => connection.id));
  const usableResources = resources.filter((resource) => activeConnectionIds.has(resource.connection_id));
  const selected = usableResources.find((resource) => resource.site_id === siteId)?.id ?? "";
  const [resourceId, setResourceId] = useState(selected);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    result === "connected"
      ? "Google Analytics connected. Select the property this site should use."
      : result === "connected-no-properties"
        ? "Google connected, but this account has no accessible GA4 properties."
        : result?.startsWith("error-")
          ? "Google connection failed. Check the OAuth configuration and try again."
          : "",
  );

  async function saveProperty() {
    if (!resourceId) return;
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/google/properties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId, resourceId }),
    });
    const body = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) return setMessage(body.error ?? "Could not save the GA4 property.");
    setMessage("GA4 property selected. Agents can now read this site's analytics.");
    router.refresh();
  }

  async function disconnect(connectionId: string) {
    if (!window.confirm("Disconnect this Google account and revoke SEO Forge access?")) return;
    setBusy(true);
    const response = await fetch(`/api/google/connections/${connectionId}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return setMessage("Could not disconnect the Google account.");
    setMessage("Google Analytics disconnected and its grant was revoked.");
    router.refresh();
  }

  const activeConnections = connections.filter((connection) => connection.status === "active");

  return (
    <section className="panel mt-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 size={18} className="text-mint" aria-hidden />
            <h2 className="text-sm font-semibold">Google Analytics 4</h2>
          </div>
          <p className="max-w-2xl text-sm text-fg-mute">
            Each customer authorizes their own Google account. SEO Forge stores an encrypted,
            tenant-scoped refresh grant and uses read-only access for autonomous reporting.
          </p>
        </div>
        <a
          href={`/api/oauth/google/start?siteId=${encodeURIComponent(siteId)}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mint px-3.5 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
        >
          {activeConnections.length ? "Connect another Google account" : "Connect Google Analytics"}
          <ExternalLink size={14} aria-hidden />
        </a>
      </div>

      {message ? <div className="mt-4 rounded-lg border border-edge bg-panel-2 px-4 py-3 text-sm">{message}</div> : null}

      {activeConnections.length ? (
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            {activeConnections.map((connection) => (
              <div key={connection.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-edge px-4 py-3">
                <CheckCircle2 size={16} className="text-mint" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{connection.email}</p>
                  <p className="text-xs text-fg-faint">
                    Read-only · verified {connection.last_verified_at ? new Date(connection.last_verified_at).toLocaleString() : "recently"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => disconnect(connection.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-xs text-fg-mute hover:border-rose hover:text-rose disabled:opacity-50"
                >
                  <Unplug size={13} aria-hidden /> Disconnect
                </button>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">GA4 property used for {"this site"}</span>
              <select
                value={resourceId}
                onChange={(event) => setResourceId(event.target.value)}
                className="w-full rounded-lg border border-edge bg-panel px-3 py-2.5 text-sm"
              >
                <option value="">Select a property…</option>
                {usableResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.account_name ? `${resource.account_name} · ` : ""}{resource.display_name} ({resource.external_id})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!resourceId || busy}
              onClick={saveProperty}
              className="rounded-lg border border-edge bg-panel px-4 py-2.5 text-sm font-medium hover:border-edge-2 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Use this property"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-edge px-4 py-5 text-sm text-fg-mute">
          No Google Analytics account is connected for this user.
        </div>
      )}
    </section>
  );
}
