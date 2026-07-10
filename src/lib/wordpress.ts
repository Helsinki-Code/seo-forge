import { decryptSecret } from "./crypto";
import type { Site } from "./data";

/** A structured change proposed by an agent for a WordPress site. */
export type WpChange =
  | {
      type: "update_post";
      post_id: number;
      title?: string;
      meta_description?: string;
      content_html?: string;
      rationale?: string;
    }
  | {
      type: "new_post";
      title: string;
      slug?: string;
      content_html: string;
      meta_description?: string;
      rationale?: string;
    };

function wpAuth(site: Site): string {
  if (!site.wp_username || !site.wp_app_password_enc) {
    throw new Error("WordPress credentials not configured for this site");
  }
  const pass = decryptSecret(site.wp_app_password_enc);
  return "Basic " + Buffer.from(`${site.wp_username}:${pass}`).toString("base64");
}

async function wpRequest(site: Site, path: string, method: string, body?: unknown) {
  const base = site.url.replace(/\/$/, "");
  const res = await fetch(`${base}/wp-json/wp/v2${path}`, {
    method,
    headers: {
      Authorization: wpAuth(site),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WordPress ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/** Verify credentials by hitting the users/me endpoint. */
export async function verifyWordPress(site: Site): Promise<boolean> {
  await wpRequest(site, "/users/me", "GET");
  return true;
}

/** Apply an approved agent change to the live WordPress site. */
export async function applyWpChange(site: Site, change: WpChange) {
  if (change.type === "update_post") {
    return wpRequest(site, `/posts/${change.post_id}`, "POST", {
      ...(change.title ? { title: change.title } : {}),
      ...(change.content_html ? { content: change.content_html } : {}),
      ...(change.meta_description ? { excerpt: change.meta_description } : {}),
    });
  }
  return wpRequest(site, "/posts", "POST", {
    status: "publish",
    title: change.title,
    ...(change.slug ? { slug: change.slug } : {}),
    content: change.content_html,
    ...(change.meta_description ? { excerpt: change.meta_description } : {}),
  });
}

/** Extract the ```seo-forge-changes fenced JSON block from agent output. */
export function parseWpChanges(messages: string[]): WpChange[] {
  for (const msg of [...messages].reverse()) {
    const match = msg.match(/```seo-forge-changes\s*\n([\s\S]*?)```/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed.changes)) return parsed.changes as WpChange[];
      } catch {
        // malformed block — ignore
      }
    }
  }
  return [];
}
