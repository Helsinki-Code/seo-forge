# Multi-tenant GA4 OAuth and MCP

SEOForge runs one shared MCP endpoint for all customers:

```text
https://seoforge.online/api/mcp/ga4
```

The endpoint does not use a shared Google Analytics identity. Each signed-in customer authorizes
their own Google account with OAuth, selects one GA4 property for their SEOForge site, and creates a
site-bound MCP bearer token. Google refresh grants are encrypted at rest. MCP tokens are stored only
as keyed HMAC hashes and are displayed once.

## Production setup

1. Apply `supabase/schema-v3.sql` after the earlier schemas.
2. Enable Google Analytics Admin API and Google Analytics Data API in the Google Cloud project.
3. Configure the Google OAuth consent screen for an external application.
4. Add the production OAuth redirect URI:

   ```text
   https://seoforge.online/api/oauth/google/callback
   ```

5. Add these production variables to Vercel:

   ```text
   GOOGLE_CLIENT_ID=<OAuth web client ID>
   GOOGLE_CLIENT_SECRET=<rotated OAuth web client secret>
   GOOGLE_REDIRECT_URI=https://seoforge.online/api/oauth/google/callback
   CREDENTIALS_ENCRYPTION_KEY=<64 hexadecimal characters>
   MCP_TOKEN_PEPPER=<at least 32 random characters>
   MCP_ALLOWED_ORIGINS=https://seoforge.online
   SUPABASE_SECRET_KEY=<Supabase server secret/service-role key>
   ```

6. Redeploy Mission Control.
7. Sign in, open Settings, connect Google Analytics, select the correct property, and create an MCP token.

Never place a Google service-account JSON file in the app, customer repository, MCP client, or Vercel
environment. Customers do not need to add SEOForge as a GA4 user.

## MCP client configuration

Use Streamable HTTP and send the token as a bearer credential:

```json
{
  "url": "https://seoforge.online/api/mcp/ga4",
  "headers": {
    "Authorization": "Bearer sfg_live_TOKEN_SHOWN_ONCE"
  }
}
```

The available tools are read-only and always resolve the site and GA4 property from the authenticated
token. Tool inputs cannot override the tenant, site, Google connection, or property.
