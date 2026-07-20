# SEOForge Public Website Component Blueprint

Status: design and implementation specification only. No component code has been retrieved or installed, and no application code has been changed.

Source: component metadata retrieved from the authenticated 21st.dev MCP catalog on 2026-07-20.

## 1. Product and Conversion Rules

SEOForge is a paid autonomous SEO/GEO operations platform. Its public website must explain two continuously operating pipelines—Content Growth and Search Optimization—coordinated by the Workflow Supervisor and delivered through the Site Experience Engineer.

The public website must follow these rules:

- There is no free trial and no free product access.
- Primary CTA: **Choose Your Plan** → `/pricing`.
- High-intent CTA: **Deploy My SEO Team** → paid checkout or authenticated plan selection.
- Sales CTA: **Book a Demo** → `/demo`.
- Educational CTA: **See How SEOForge Works** → `/how-it-works`.
- Existing customers use **Sign In**; this is never styled as the primary marketing CTA.
- Never use “Try free,” “Start free,” “No credit card required,” or equivalent copy.
- Never fabricate rankings, customer logos, testimonials, review scores, usage statistics, or case-study results.
- Rank #1 is an optimization objective, never a promise or guarantee.
- Components from 21st.dev are design starting points. SEOForge must own the final composition, tokens, copy, data bindings, accessibility, responsiveness, and performance.

## 2. Technical Fit

The current Mission Control frontend already uses Next.js 16, React 19, Tailwind CSS 4, shadcn, Radix/Base UI, Framer Motion, Recharts, Reaviz, Lucide, and Hugeicons. The selected 21st.dev components are compatible in concept with this stack, but every retrieved component must be reviewed before installation.

Implementation requirements:

- Keep shared public components in a dedicated marketing component layer.
- Prefer server-rendered sections; introduce client components only for interactions or animation.
- Use the existing SEOForge design tokens instead of copying a component’s palette verbatim.
- Remove unnecessary animation and heavy effects from mobile and reduced-motion modes.
- Replace all sample data, logos, testimonials, prices, metrics, and images.
- Validate dependencies before installation; do not add a second icon, chart, form, or animation library when the repository already has one.
- Use semantic HTML, visible focus states, keyboard support, descriptive links, and WCAG 2.2 AA contrast.
- Do not expose `$API_KEY_21ST` in client code, source control, build logs, or public URLs.

## 3. Chosen Component Library

These are the preferred patterns to retrieve during implementation. IDs are 21st.dev demo IDs.

### Global Navigation

**Primary: Navigation Menu — sshahaider — ID 7854**

- Purpose: responsive mega menu, multi-level product navigation, mobile drawer.
- Catalog: https://21st.dev/@sshahaider/components/navigation-menu
- Install later: `npx shadcn@latest add "https://21st.dev/r/sshahaider/navigation-menu?api_key=$API_KEY_21ST"`
- Adaptation: use Platform, Solutions, Use Cases, Integrations, Resources, and Pricing groups; retain Sign In, Choose Your Plan, and Book a Demo.

**Alternative: Navbar 5 — shadcnblockscom — ID 2307**

- Catalog: https://21st.dev/@shadcnblockscom/components/navbar-5
- Use only if the primary mega-menu proves too animation-heavy.

### Homepage Hero

**Primary: Hero AI Value Proposition — uilayout.contact — ID 19048**

- Purpose: AI product value proposition, dual CTA area, proof strip, product preview.
- Catalog: https://21st.dev/@uilayout.contact/components/hero-ai-value-proposition
- Install later: `npx shadcn@latest add "https://21st.dev/r/uilayout.contact/hero-ai-value-proposition?api_key=$API_KEY_21ST"`
- Adaptation: replace generic AI visuals with a real SEOForge two-pipeline control-room preview.
- Required CTA copy: Choose Your Plan and See How SEOForge Works.

**Alternative: Financial Hero Section — uilayout.contact — ID 19056**

- Catalog: https://21st.dev/@uilayout.contact/components/hero-financial
- Use its scroll-reveal dashboard treatment only if it stays performant.

### Social Proof and Integration Logos

**Primary: Logo Cloud — educlopez — ID 18355**

- Purpose: integration/provider logos or verified customer logos.
- Catalog: https://21st.dev/@educlopez/components/logo-cloud
- Install later: `npx shadcn@latest add "https://21st.dev/r/educlopez/logo-cloud?api_key=$API_KEY_21ST"`
- Use provider logos before launch; show customer logos only after written permission.

### Platform Feature Grid

**Primary: Bento Grid 01 — avanishverma4 — ID 9594**

- Purpose: explain four agents, two pipelines, approval safety, provider intelligence, and production delivery.
- Catalog: https://21st.dev/@avanishverma4/components/bento-grid-01
- Install later: `npx shadcn@latest add "https://21st.dev/r/avanishverma4/bento-grid-01?api_key=$API_KEY_21ST"`
- Adaptation: cards must show meaningful product evidence, not decorative placeholders.

### Autonomous Workflow Visual

**Primary: N8N Workflow Block — moumensoliman — ID 10645**

- Purpose: visualize Supervisor → Content Growth/Search Optimization → Site Experience Engineer → Approval → Production → Measurement.
- Catalog: https://21st.dev/@moumensoliman/components/n8n-workflow-block-shadcnui
- Install later: `npx shadcn@latest add "https://21st.dev/r/moumensoliman/n8n-workflow-block-shadcnui?api_key=$API_KEY_21ST"`
- Adaptation: this is a read-only product illustration, never an imitation of n8n branding.

**Supporting: Process Timeline — youcefbnm — ID 1943**

- Catalog: https://21st.dev/@youcefbnm/components/process-timeline
- Use for linear explanations such as research → proposal → approval → deployment → measurement.

### Agent and Team Representation

**Primary: Agent Plan — isaiahbjork — ID 2127**

- Purpose: show one agent’s assignment, subtasks, evidence, tools, and approval boundary.
- Catalog: https://21st.dev/@isaiahbjork/components/agent-plan
- Install later: `npx shadcn@latest add "https://21st.dev/r/isaiahbjork/agent-plan?api_key=$API_KEY_21ST"`

**Supporting: AI Agent Processing States — arunjdass — ID 14940**

- Purpose: visually distinguish queued, researching, preparing, awaiting approval, completed, and failed states.
- Catalog: https://21st.dev/@arunjdass/components/ai-agent-processing-states

Do not represent agents as fake human employees. Use role-specific system cards, responsibilities, evidence, and current state.

### Live Activity and Evidence

**Primary: Data Stream — thegridcn — ID 18429**

- Purpose: terminal-style activity feed for tool calls, URLs, queries, evidence, retries, and status changes.
- Catalog: https://21st.dev/@thegridcn/components/data-stream
- Install later: `npx shadcn@latest add "https://21st.dev/r/thegridcn/data-stream?api_key=$API_KEY_21ST"`

**Supporting: Interactive Logs Table — moumensoliman — ID 10635**

- Purpose: filterable and expandable evidence/run history.
- Catalog: https://21st.dev/@moumensoliman/components/interactive-logs-table-shadcnui

Public pages use synthetic, clearly labeled demonstrations. The authenticated product uses real tenant-scoped events. Never display hidden chain-of-thought.

### Analytics and Measured Outcomes

**Primary: Advanced Stats — uilayout.contact — ID 19070**

- Purpose: rankings, clicks, impressions, conversions, AI citations, and health score previews.
- Catalog: https://21st.dev/@uilayout.contact/components/advanced-stats
- Install later: `npx shadcn@latest add "https://21st.dev/r/uilayout.contact/advanced-stats?api_key=$API_KEY_21ST"`

**Supporting: AnalyticsDashboard — dhileepkumargm — ID 7787**

- Catalog: https://21st.dev/@dhileepkumargm/components/analytics-dashboard
- Adaptation: reuse the existing chart stack rather than importing incompatible chart dependencies.

Measured results, forecasts, and agent hypotheses must be visually and textually distinct.

### Feature Storytelling

**Primary: Feature Showcase — ruixen.ui — ID 9309**

- Purpose: alternating product narrative with a live interface preview.
- Catalog: https://21st.dev/@ruixen.ui/components/feature-showcase
- Install later: `npx shadcn@latest add "https://21st.dev/r/ruixen.ui/feature-showcase?api_key=$API_KEY_21ST"`

**Supporting: Feature 108 — shadcnblockscom — ID 607**

- Purpose: tabbed feature explanation for Content Growth, Search Optimization, and Shared Delivery.
- Catalog: https://21st.dev/@shadcnblockscom/components/shadcnblocks-com-feature108

### Pricing

**Primary: Pricing Section — uilayout.contact — ID 6262**

- Purpose: Starter, Growth, and Agency pricing cards.
- Catalog: https://21st.dev/@uilayout.contact/components/pricing-section-4
- Install later: `npx shadcn@latest add "https://21st.dev/r/uilayout.contact/pricing-section-4?api_key=$API_KEY_21ST"`
- Required adaptation: remove free tiers, trial language, fake discounts, and invented urgency.

**Supporting: Pricing Section with Comparison — tommyjepsen — ID 1318**

- Purpose: complete plan entitlement matrix below the pricing cards.
- Catalog: https://21st.dev/@tommyjepsen/components/pricing-section-with-comparison

### Product and Competitor Comparisons

**Primary: Comparison Table — ruixen.ui — ID 7469**

- Purpose: fair feature-by-feature platform comparisons and alternatives pages.
- Catalog: https://21st.dev/@ruixen.ui/components/comparison-table
- Content must be sourced, dated, and reviewed. Never state unsupported competitor limitations.

**Supporting: Comparison Slider with Highlights — ziegfiroyt — ID 19262**

- Purpose: before/after product screenshots or content improvements.
- Catalog: https://21st.dev/@ziegfiroyt/components/reveal2
- Only use real screenshots with accurate captions and dates.

### Testimonials and Case Studies

**Primary: Testimonials Section — sshahaider — ID 7267**

- Catalog: https://21st.dev/@sshahaider/components/testimonials-section
- Install later: `npx shadcn@latest add "https://21st.dev/r/sshahaider/testimonials-section?api_key=$API_KEY_21ST"`

**Supporting: MultiMedia Testimonial — ruixen.ui — ID 9491**

- Catalog: https://21st.dev/@ruixen.ui/components/multi-media-testimonial
- Use only for customer-approved text or video evidence.

**Case-study index: Bento Grid — shadcnblockscom — ID 2201**

- Catalog: https://21st.dev/@shadcnblockscom/components/casestudy-5
- Cards should display challenge, intervention, measured outcome, observation period, and evidence source.

### FAQ

**Primary: FAQ Accordion — moumensoliman — ID 10579**

- Catalog: https://21st.dev/@moumensoliman/components/faq-accordion-block-shadcnui
- Install later: `npx shadcn@latest add "https://21st.dev/r/moumensoliman/faq-accordion-block-shadcnui?api_key=$API_KEY_21ST"`
- Use one visible, crawlable FAQ set per page; do not use FAQ schema unless the visible content and current search guidelines support it.

### Calls to Action

**Primary: CTA Section — shadcnstore — ID 19355**

- Purpose: final paid-plan/demo CTA with supporting workflow and documentation links.
- Catalog: https://21st.dev/@shadcnstore/components/cta-section-3
- Install later: `npx shadcn@latest add "https://21st.dev/r/shadcnstore/cta-section-3?api_key=$API_KEY_21ST"`
- Required copy: Deploy My SEO Team, Choose Your Plan, or Book a Demo. Never “Start Free.”

### Footer

**Primary: Footer 7 — shadcnblockscom — ID 2223**

- Purpose: full sitemap, social, legal, status, docs, and contact destinations.
- Catalog: https://21st.dev/@shadcnblockscom/components/footer-7
- Install later: `npx shadcn@latest add "https://21st.dev/r/shadcnblockscom/footer-7?api_key=$API_KEY_21ST"`

### Integrations Directory

**Primary: Integrations Grid — sshahaider — ID 18984**

- Purpose: GitHub, WordPress, Google Search Console, GA4, DataForSEO, Bing, IndexNow, Cloudflare, Slack, and webhook connections.
- Catalog: https://21st.dev/@sshahaider/components/integrations-4-2
- Install later: `npx shadcn@latest add "https://21st.dev/r/sshahaider/integrations-4-2?api_key=$API_KEY_21ST"`

**Supporting: IntegrationHero — ruixen.ui — ID 5611**

- Catalog: https://21st.dev/@ruixen.ui/components/integration-hero
- Prefer a static or reduced-motion version for performance.

### Blog and Resource Indexes

**Primary: Blog Section — sshahaider — ID 7059**

- Purpose: blog, guides, templates, comparisons, and research indexes.
- Catalog: https://21st.dev/@sshahaider/components/blog-section
- Install later: `npx shadcn@latest add "https://21st.dev/r/sshahaider/blog-section?api_key=$API_KEY_21ST"`

**Supporting: Blog Posts — aymanch-03 — ID 5622**

- Catalog: https://21st.dev/@aymanch-03/components/blog-posts
- Use for one featured article followed by a standard card grid.

### Article and Guide Layout

**Primary: Table of Contents — larsen66 — ID 13588**

- Purpose: sticky desktop outline, scroll spy, and mobile collapsible TOC.
- Catalog: https://21st.dev/@larsen66/components/table-of-contents
- Install later: `npx shadcn@latest add "https://21st.dev/r/larsen66/table-of-contents?api_key=$API_KEY_21ST"`

The final article template also requires breadcrumbs, author/reviewer block, publish/update dates, source citations, callout blocks, related articles, inline product CTA, and article schema generated from real page data.

### Documentation and Developer Portal

**Primary: Sidebar 1 — uiable — ID 19371**

- Purpose: searchable grouped documentation navigation.
- Catalog: https://21st.dev/@uiable/components/uiable-sidebar-1
- Install later: `npx shadcn@latest add "https://21st.dev/r/uiable/uiable-sidebar-1?api_key=$API_KEY_21ST"`

**Supporting: Command Palette — rafa-porto — ID 2075**

- Purpose: keyboard-first search across docs, API, SDK, MCP, CLI, and guides.
- Catalog: https://21st.dev/@rafa-porto/components/command-palette

### Demo and Contact

**Primary: Book A Demo 3 — designali-in — ID 8954**

- Purpose: demo request form with verified proof or integration logos.
- Catalog: https://21st.dev/@designali-in/components/book-a-demo-3
- Install later: `npx shadcn@latest add "https://21st.dev/r/designali-in/book-a-demo-3?api_key=$API_KEY_21ST"`
- Request only necessary business information. Include consent, privacy link, success state, validation, and spam protection.

**Supporting: Contact 2 — shadcnblockscom — ID 2199**

- Catalog: https://21st.dev/@shadcnblockscom/components/contact-2

### Security and Trust

**Primary building block: Security Card — amanshakya1808 — ID 6662**

- Catalog: https://21st.dev/@amanshakya1808/components/security-card
- Use as a visual card primitive only; build the actual trust center around documented controls, subprocessors, data retention, uptime, incident history, and security contacts.
- Never display certification badges unless SEOForge has the certification.

### ROI and Interactive Tools

**Primary interaction reference: PricingSlider Loops — radu — ID 4533**

- Purpose: adapt its range/input/result behavior for an SEO operations cost or content capacity estimator.
- Catalog: https://21st.dev/@radu/components/pricing-slider-loops
- Calculations must expose assumptions and must not promise ranking outcomes.

### Changelog

**Primary: Changelog 1 — shadcnblockscom — ID 2203**

- Purpose: dated product releases with version, summary, image, affected capability, and documentation link.
- Catalog: https://21st.dev/@shadcnblockscom/components/changelog-1

### Legal and Consent

**Cookie consent: Cookies — prebuiltui — ID 7178**

- Catalog: https://21st.dev/@prebuiltui/components/cookies
- Use only with a real consent model and regional requirements.

Legal pages themselves should remain readable server-rendered documents, not modal-only interfaces. The Privacy Policy Modal (ID 5740) may be used only for contextual summaries, never as the canonical policy page.

### Error Page

**Primary: Error Page 2 — shadcnstore — ID 19370**

- Purpose: accessible 404 with links to home, platform, pricing, docs, and search.
- Catalog: https://21st.dev/@shadcnstore/components/error-page-2

## 4. Page-Family Recipes

The public site should be assembled from a controlled set of reusable sections. Do not design every page independently.

### Homepage `/`

1. Navigation Menu 7854.
2. Hero AI Value Proposition 19048 with real control-room preview.
3. Logo Cloud 18355 for supported providers.
4. N8N Workflow Block 10645 showing the two pipelines and Supervisor.
5. Bento Grid 9594 for four agents and safety boundaries.
6. Feature Showcase 9309 for Content Growth and Search Optimization.
7. Data Stream 18429 for a labeled product demonstration.
8. Advanced Stats 19070 for measured outcomes.
9. Testimonials Section 7267 only when verified proof exists.
10. Pricing Section 6262.
11. FAQ Accordion 10579.
12. CTA Section 19355.
13. Footer 7 2223.

### Platform Overview `/platform`

Use the standard page hero, Workflow Block 10645, Bento Grid 9594, Feature 108 tabs 607, Advanced Stats 19070, Process Timeline 1943, FAQ 10579, CTA 19355, and the shared footer.

### Agent Pages

Routes:

- `/agents/workflow-supervisor`
- `/agents/content-growth`
- `/agents/search-optimization`
- `/agents/site-experience-engineer`

Recipe: standard feature hero, Agent Plan 2127, AI Agent Processing States 14940, tool/evidence cards, Feature Showcase 9309, responsibility boundaries, approval behavior, FAQs, CTA, and footer.

### Content Growth Feature Pages

Routes include content strategy, keyword discovery, briefs, article generation, editorial calendar, brand voice, media generation, and content refresh.

Recipe: feature hero, Feature Showcase 9309, Process Timeline 1943, relevant product screenshots, evidence/source explanation, integration strip, FAQ, CTA, footer.

### Search Optimization Feature Pages

Routes include technical SEO, rank tracking, content decay, cannibalization, internal linking, backlinks, competitor intelligence, experiments, and performance.

Recipe: feature hero, Advanced Stats 19070, Feature Showcase 9309, Data Stream 18429, comparison or before/after visualization where truthful, workflow timeline, FAQ, CTA, footer.

### GEO and AI Visibility Pages

Routes include AI Overview visibility, ChatGPT citations, Perplexity citations, entity clarity, topical authority, and answer-first content.

Recipe: feature hero, measured-versus-probed explanation, Advanced Stats 19070, evidence cards, Feature Showcase 9309, methodology section, FAQ, CTA, footer. Synthetic prompts must be labeled as probes, not user traffic.

### Publishing and Managed Blog Pages

Routes include GitHub publishing, WordPress publishing, protected approvals, repository previews, managed blog hosting, theme matching, and media placement.

Recipe: feature hero, Workflow Block 10645, Process Timeline 1943, code/site preview, before/after comparison, integration grid, rollback and safety section, FAQ, CTA, footer.

### Use-Case and Persona Pages

Routes include SaaS, agencies, ecommerce, local businesses, publishers, marketing teams, SEO teams, founders, and developers.

Recipe: audience-specific hero, problem/outcome cards using Bento Grid 9594, relevant agent workflow, tailored product screenshots, relevant integration logos, verified case study, plan recommendation, FAQ, CTA, footer.

Every use-case page must contain unique audience evidence and workflow detail. Do not publish thin pages produced by swapping a persona name.

### Integration Index `/integrations`

Use IntegrationHero 5611, Integrations Grid 18984, category filters, connection safety explanation, requested-integration CTA, FAQ, and footer.

### Integration Detail Pages

Recipe: integration-specific hero, connection requirements, supported data/actions, permission scope, workflow examples, security notes, setup steps, limitations, related integrations, FAQ, CTA, footer.

### Comparison and Alternative Pages

Recipe: comparison hero, dated methodology, Comparison Table 8992, workflow differences, pricing facts, migration section, verified evidence, FAQs, balanced CTA, footer. Cite primary sources and display “last verified” dates.

### Pricing `/pricing`

Use Pricing Section 6262, complete comparison 1318, clear usage definitions, cost-control explanation, paid onboarding flow, FAQ 10579, CTA 19355, and footer. No free plan or free trial.

### How It Works `/how-it-works`

Use standard hero, N8N Workflow Block 10645, Process Timeline 1943, Agent Plan 2127, approval-gate section, live-to-production explanation, post-deployment measurement, FAQ, CTA, footer.

### Blog, Guides, Templates, Research, and Comparisons Indexes

Use Blog Posts 5622 for one featured item, Blog Section 7059 for the remaining library, topic/format filters, search, newsletter only if an email program exists, CTA, and footer.

### Article, Guide, and Research Detail

Use breadcrumbs, editorial metadata, Table of Contents 13588, semantic article body, source citations, figures, related resources, author/reviewer information, contextual product CTA, and footer. Research pages additionally require methodology, dataset scope, limitations, and update history.

### Template and Tool Detail Pages

Use a clear value hero, interactive preview, instructions, assumptions, related content, optional email capture only when necessary, product connection, FAQ, CTA, footer. Tools must provide standalone value and must not manipulate users into an undisclosed sales flow.

### Case Studies

Index uses Bento Grid 2201. Detail pages use challenge → baseline → intervention → observation period → measured result → evidence → limitations → customer quote → related product capability → CTA.

### Developer, API, SDK, CLI, and MCP Pages

Use Sidebar 1 19371, Command Palette 2075, language tabs, copyable examples, version selector, authentication/scopes, rate limits, error states, changelog links, and security boundaries. Public MCP documentation must clearly state that approval, merge, deploy, credential retrieval, and branch-protection bypass are never exposed as MCP tools.

### Security and Trust Center

Use a restrained hero, Security Card 6662 as a base primitive, data-flow diagram, control categories, subprocessors, data retention, incident response, responsible disclosure, uptime/status link, audit-log explanation, and contact. Never imply certifications that do not exist.

### About, Contact, Demo, and Company Pages

About uses mission, product principles, safety model, and authentic team/company information. Demo uses Book A Demo 3 ID 8954. Contact uses Contact 2 ID 2199. Careers and press pages use simple editorial layouts rather than additional marketplace components.

### Legal Pages

Privacy, Terms, Cookie Policy, Acceptable Use, AI/Data Processing, and Subprocessors use readable document layouts with effective date, update history, anchored navigation, and contact details. Cookie consent may use ID 7178 after legal review.

### Utility Pages

404 uses Error Page 2 ID 19370. Status and changelog use factual operational data. Search uses Command Palette 2075. Sign-in is an application boundary and should retain the existing Clerk-based implementation rather than importing a marketplace authentication form.

## 5. Reusable SEOForge Components to Derive

During implementation, retrieve marketplace components only as references and convert them into these owned SEOForge primitives:

- `MarketingHeader`
- `MarketingMegaMenu`
- `MarketingFooter`
- `PageHero`
- `ProductPreviewFrame`
- `AgentRoleCard`
- `PipelineWorkflow`
- `EvidenceStream`
- `MeasuredOutcomePanel`
- `FeatureBento`
- `FeatureShowcase`
- `IntegrationGrid`
- `ProofLogoCloud`
- `CaseStudyCard`
- `PricingCards`
- `EntitlementComparison`
- `FairComparisonTable`
- `ArticleCard`
- `ArticleLayout`
- `TableOfContents`
- `DocsSidebar`
- `GlobalSearch`
- `FaqSection`
- `FinalCta`
- `DemoForm`
- `SecurityControlCard`
- `ConsentBanner`
- `ErrorPage`

This prevents component drift and keeps programmatic page families visually consistent.

## 6. Component Retrieval Priority

Retrieve and adapt components in this order when coding is authorized:

### Phase 1 — Shared Conversion Shell

1. Navigation Menu 7854.
2. Hero AI Value Proposition 19048.
3. CTA Section 19355.
4. Footer 7 2223.
5. FAQ Accordion 10579.

### Phase 2 — Product Story

1. N8N Workflow Block 10645.
2. Bento Grid 9594.
3. Feature Showcase 9309.
4. Agent Plan 2127.
5. Data Stream 18429.
6. Advanced Stats 19070.

### Phase 3 — Commercial Proof

1. Pricing Section 6262.
2. Pricing Comparison 1318.
3. Testimonials Section 7267.
4. Case-study Bento 2201.
5. Comparison Table 7469.

### Phase 4 — Content and Developer Surfaces

1. Blog Posts 5622.
2. Blog Section 7059.
3. Table of Contents 13588.
4. Sidebar 1 19371.
5. Command Palette 2075.
6. Integrations Grid 18984.

### Phase 5 — Supporting Surfaces

1. Book A Demo 3 ID 8954.
2. Security Card 6662.
3. Changelog 1 ID 2203.
4. Cookies ID 7178.
5. Error Page 2 ID 19370.

## 7. Acceptance Checklist

Before any component ships:

- Marketplace code and dependencies have been reviewed.
- The component uses SEOForge tokens and owned copy.
- Sample/fake content has been completely removed.
- There is no free-trial messaging.
- Desktop, tablet, and mobile layouts are verified.
- Keyboard navigation and visible focus states work.
- Reduced-motion behavior is implemented.
- Images have dimensions, alt text, optimization, and no layout shift.
- Interactive sections do not block server rendering of primary content.
- Performance is tested against page budgets.
- Component links and CTAs match the page’s buyer stage.
- Claims, metrics, quotes, comparisons, and logos have evidence and permission.
- Structured data matches visible content.
- Analytics events distinguish page view, content engagement, pricing view, demo request, checkout start, and paid conversion.
- The final implementation does not expose the 21st.dev API key.

## 8. Explicitly Rejected Patterns

- Free-plan or free-trial cards.
- Fake “trusted by” logos.
- Fabricated testimonials or review ratings.
- Guaranteed ranking claims.
- Constant motion, autoplay video, or decorative animation that harms reading.
- Large client-rendered sections for static marketing copy.
- Thin programmatic pages with only entity-name substitutions.
- Multiple competing CTA labels on the same page.
- Generic human portraits for software agents.
- Exposing private chain-of-thought as “agent reasoning.”
- Using comparison UI without sourced and dated facts.
- Installing every retrieved component independently instead of consolidating owned primitives.

## 9. Retrieval Note

The 21st.dev MCP search operation returns component metadata for free. Full code retrieval through `get_component` is metered. Because this task explicitly requested documentation and no coding, only metadata was retrieved. Code should be retrieved selectively in the phased order above when implementation is approved.
