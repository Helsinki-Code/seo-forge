import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/mcp-auth";
import {
  callGoogleAnalytics,
  listGoogleAnalyticsProperties,
  refreshGoogleToken,
  type GoogleConnectionRow,
} from "@/lib/google-analytics";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JsonRpcId = string | number | null;
type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
};

const tools = [
  { name: "get_account_summaries", description: "Return the account summary for this site's selected GA4 property.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "get_property_details", description: "Get configuration details for this site's selected GA4 property.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "list_google_ads_links", description: "List Google Ads links for this site's selected GA4 property.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "list_property_annotations", description: "List reporting data annotations for this site's selected GA4 property.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "get_custom_dimensions_and_metrics", description: "List custom dimensions and metrics for this site's selected GA4 property.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "run_report", description: "Run a GA4 core report using the Google Analytics Data API request body.", inputSchema: { type: "object", properties: { request: { type: "object" }, dimensions: { type: "array", items: { type: "string" } }, metrics: { type: "array", items: { type: "string" } }, date_ranges: { type: "array", items: { type: "object" } } }, additionalProperties: true } },
  { name: "run_realtime_report", description: "Run a GA4 realtime report.", inputSchema: { type: "object", properties: { request: { type: "object" }, dimensions: { type: "array", items: { type: "string" } }, metrics: { type: "array", items: { type: "string" } } }, additionalProperties: true } },
  { name: "run_funnel_report", description: "Run a GA4 funnel report using a Data API v1alpha request body.", inputSchema: { type: "object", properties: { request: { type: "object" } }, additionalProperties: true } },
  { name: "run_conversions_report", description: "Run a GA4 key-event/conversion report using a Data API request body.", inputSchema: { type: "object", properties: { request: { type: "object" } }, additionalProperties: true } },
] as const;

function rpc(id: JsonRpcId | undefined, result: unknown, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { status });
}

function rpcError(id: JsonRpcId | undefined, code: number, message: string, status = 400) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

function reportRequest(args: Record<string, unknown>) {
  if (args.request && typeof args.request === "object" && !Array.isArray(args.request)) {
    const direct = { ...(args.request as Record<string, unknown>) };
    if ("limit" in direct) {
      const requestedLimit = Number(direct.limit);
      direct.limit = String(Number.isFinite(requestedLimit) ? Math.max(1, Math.min(requestedLimit, 10_000)) : 10_000);
    }
    return direct;
  }
  const result: Record<string, unknown> = { ...args };
  delete result.request;
  const mappings: Record<string, string> = {
    date_ranges: "dateRanges",
    dimension_filter: "dimensionFilter",
    metric_filter: "metricFilter",
    order_bys: "orderBys",
    return_property_quota: "returnPropertyQuota",
    conversion_spec: "conversionSpec",
  };
  for (const [source, target] of Object.entries(mappings)) {
    if (source in result) {
      result[target] = result[source];
      delete result[source];
    }
  }
  if (Array.isArray(result.dimensions)) {
    result.dimensions = result.dimensions.map((value) => typeof value === "string" ? { name: value } : value);
  }
  if (Array.isArray(result.metrics)) {
    result.metrics = result.metrics.map((value) => typeof value === "string" ? { name: value } : value);
  }
  const requestedLimit = Number(result.limit ?? 10_000);
  result.limit = String(Number.isFinite(requestedLimit) ? Math.max(1, Math.min(requestedLimit, 10_000)) : 10_000);
  return result;
}

async function selectedAnalytics(userId: string, siteId: string) {
  const { data: resource } = await supabase()
    .from("google_resources")
    .select("external_id,connection_id")
    .eq("user_id", userId)
    .eq("site_id", siteId)
    .eq("resource_type", "ga4_property")
    .maybeSingle();
  if (!resource) throw new Error("No GA4 property is selected for this site");

  const { data: connection } = await supabase()
    .from("google_connections")
    .select("id,user_id,google_subject,email,refresh_token_enc,scopes,status")
    .eq("id", resource.connection_id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (!connection) throw new Error("The site's Google Analytics connection is unavailable");
  return { resource, connection: connection as GoogleConnectionRow };
}

async function executeTool(name: string, args: Record<string, unknown>, userId: string, siteId: string) {
  const { resource, connection } = await selectedAnalytics(userId, siteId);
  const token = await refreshGoogleToken(connection);
  if (name === "get_account_summaries") {
    const properties = await listGoogleAnalyticsProperties(token.access_token);
    return { properties: properties.filter((property) => property.externalId === resource.external_id) };
  }
  const action: Record<string, string> = {
    get_property_details: "property_details",
    list_google_ads_links: "google_ads_links",
    list_property_annotations: "property_annotations",
    get_custom_dimensions_and_metrics: "custom_dimensions_and_metrics",
    run_report: "run_report",
    run_realtime_report: "run_realtime_report",
    run_funnel_report: "run_funnel_report",
    run_conversions_report: "run_conversions_report",
  };
  if (!action[name]) throw new Error("Unknown GA4 tool");
  return callGoogleAnalytics(token.access_token, resource.external_id, action[name], reportRequest(args));
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    const allowed = new Set([
      process.env.NEXT_PUBLIC_APP_URL,
      ...(process.env.MCP_ALLOWED_ORIGINS ?? "").split(","),
    ].filter(Boolean).map((value) => value!.trim().replace(/\/$/, "")));
    if (!allowed.has(origin.replace(/\/$/, ""))) {
      return rpcError(null, -32003, "Origin is not allowed", 403);
    }
  }
  const principal = await authenticateMcpRequest(request);
  if (!principal) return rpcError(null, -32001, "Invalid or expired bearer token", 401);

  let body: JsonRpcRequest;
  try {
    body = await request.json() as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  if (body.jsonrpc !== "2.0" || !body.method) return rpcError(body.id, -32600, "Invalid Request");

  if (body.method === "notifications/initialized") return new NextResponse(null, { status: 202 });
  if (body.method === "ping") return rpc(body.id, {});
  if (body.method === "initialize") {
    return rpc(body.id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "SEOForge GA4", version: "1.0.0" },
      instructions: "Read-only GA4 tools bound to the authenticated SEOForge site. Credentials are never returned.",
    });
  }
  if (body.method === "tools/list") return rpc(body.id, { tools });
  if (body.method !== "tools/call") return rpcError(body.id, -32601, "Method not found", 404);

  const name = body.params?.name;
  if (!name || !tools.some((tool) => tool.name === name)) return rpcError(body.id, -32602, "Unknown tool");
  try {
    const result = await executeTool(name, body.params?.arguments ?? {}, principal.userId, principal.siteId);
    return rpc(body.id, {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
      isError: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/Google API \d+:.*$/s, "Google Analytics request failed") : "GA4 tool failed";
    return rpc(body.id, { content: [{ type: "text", text: message }], isError: true });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "SEOForge GA4 MCP",
    transport: "Streamable HTTP",
    authentication: "Bearer",
    protocolVersion: "2025-06-18",
  });
}
