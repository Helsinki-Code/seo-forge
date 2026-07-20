"use client";

import { useState } from "react";
import { Check, Clipboard, KeyRound, PlugZap, Trash2 } from "lucide-react";

type TokenMetadata = {
  id: string;
  label: string;
  token_prefix: string;
  last_four: string;
  expires_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export default function McpTokenManager({
  siteId,
  initialTokens,
  endpoint,
}: {
  siteId: string;
  initialTokens: TokenMetadata[];
  endpoint: string;
}) {
  const [tokens, setTokens] = useState(initialTokens);
  const [plainToken, setPlainToken] = useState("");
  const [label, setLabel] = useState("GA4 MCP client");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  async function createToken() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/mcp/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId, label, expiresInDays: 90 }),
    });
    const body = await response.json() as { token?: string; metadata?: TokenMetadata; error?: string };
    setBusy(false);
    if (!response.ok || !body.token || !body.metadata) {
      return setMessage(body.error ?? "Could not create the MCP token.");
    }
    setPlainToken(body.token);
    setTokens((current) => [body.metadata!, ...current]);
    setMessage("Token created. Copy it now; SEO Forge will never display it again.");
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function revoke(id: string) {
    if (!window.confirm("Revoke this MCP token immediately?")) return;
    setBusy(true);
    const response = await fetch(`/api/mcp/tokens/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return setMessage("Could not revoke the MCP token.");
    setTokens((current) => current.map((token) => token.id === id ? { ...token, revoked_at: new Date().toISOString() } : token));
    setMessage("MCP token revoked.");
  }

  return (
    <section className="panel mt-6 p-6">
      <div className="mb-5 flex items-start gap-3">
        <PlugZap size={19} className="mt-0.5 text-mint" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold">GA4 MCP access</h2>
          <p className="mt-1 max-w-3xl text-sm text-fg-mute">
            Connect an MCP client to this site&apos;s read-only analytics. Tokens are site-bound,
            expire after 90 days, and cannot approve content, deploy changes, or reveal Google credentials.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-edge bg-panel-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-faint">Streamable HTTP endpoint</p>
        <div className="mt-2 flex items-center gap-2">
          <code className="min-w-0 flex-1 overflow-x-auto text-xs text-fg">{endpoint}</code>
          <button type="button" onClick={() => copy(endpoint)} className="rounded-md border border-edge p-2 hover:border-edge-2" aria-label="Copy endpoint">
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Token label</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} className="w-full rounded-lg border border-edge bg-panel px-3 py-2.5 text-sm" />
        </label>
        <button type="button" disabled={busy || !label.trim()} onClick={createToken} className="inline-flex items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50">
          <KeyRound size={14} aria-hidden /> Create token
        </button>
      </div>

      {plainToken ? (
        <div className="mt-4 rounded-lg border border-amber/40 bg-amber/5 p-4">
          <p className="text-xs font-semibold text-amber">Shown once — copy this token now</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs">{plainToken}</code>
            <button type="button" onClick={() => copy(plainToken)} className="rounded-md border border-edge p-2 hover:border-edge-2" aria-label="Copy token">
              {copied ? <Check size={14} /> : <Clipboard size={14} />}
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-fg-mute" role="status">{message}</p> : null}

      <div className="mt-5 space-y-2">
        {tokens.length ? tokens.map((token) => {
          const inactive = Boolean(token.revoked_at) || new Date(token.expires_at) <= new Date();
          return (
            <div key={token.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-edge px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{token.label}</p>
                <p className="text-xs text-fg-faint">
                  {token.token_prefix}…{token.last_four} · {inactive ? "inactive" : `expires ${new Date(token.expires_at).toLocaleDateString()}`}
                  {token.last_used_at ? ` · last used ${new Date(token.last_used_at).toLocaleString()}` : " · never used"}
                </p>
              </div>
              {!inactive ? (
                <button type="button" disabled={busy} onClick={() => revoke(token.id)} className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-xs text-fg-mute hover:border-rose hover:text-rose disabled:opacity-50">
                  <Trash2 size={13} aria-hidden /> Revoke
                </button>
              ) : null}
            </div>
          );
        }) : <p className="rounded-lg border border-dashed border-edge px-4 py-5 text-sm text-fg-mute">No MCP token has been issued for this site.</p>}
      </div>
    </section>
  );
}
