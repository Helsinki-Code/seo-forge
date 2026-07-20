export type MarketingPageKind =
  | "hub"
  | "agent"
  | "feature"
  | "solution"
  | "use-case"
  | "integration"
  | "comparison"
  | "resource"
  | "trust";

export type MarketingFeature = {
  title: string;
  body: string;
};

export type MarketingPageSpec = {
  path: string;
  kind: MarketingPageKind;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta?: string;
  secondaryHref?: string;
  features: MarketingFeature[];
  steps: string[];
  integrations: string[];
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ href: string; label: string }>;
};

type PageInput = Omit<MarketingPageSpec, "features" | "steps" | "integrations" | "faqs" | "related"> &
  Partial<Pick<MarketingPageSpec, "features" | "steps" | "integrations" | "faqs" | "related">>;

const kindDefaults: Record<
  MarketingPageKind,
  Pick<MarketingPageSpec, "features" | "steps" | "integrations" | "faqs">
> = {
  hub: {
    features: [
      { title: "Two operating pipelines", body: "Content Growth creates new demand while Search Optimization compounds the value of pages already published." },
      { title: "One accountable supervisor", body: "The Workflow Supervisor schedules work, controls budgets, resolves conflicts and routes every production proposal to a human." },
      { title: "Production delivery", body: "The Site Experience Engineer turns approved work into validated GitHub or WordPress changes and observes what happens next." },
    ],
    steps: ["Connect the website and publishing destination", "Establish markets, brand rules and measurement", "Run both autonomous pipelines", "Review evidence-backed proposals", "Publish approved changes and measure outcomes"],
    integrations: ["GitHub", "WordPress", "Google Search Console", "GA4", "DataForSEO"],
    faqs: [
      { question: "Does SEOForge publish without permission?", answer: "No. Agents can research and prepare production work, but a signed-in human must approve every publishing action." },
      { question: "Does SEOForge guarantee rank one?", answer: "No search platform can guarantee a position. SEOForge continuously investigates, experiments and measures progress toward stronger organic visibility." },
    ],
  },
  agent: {
    features: [
      { title: "Structured assignment", body: "The agent receives a bounded objective, site context, budget and explicit production restrictions." },
      { title: "Evidence before action", body: "Recommendations are tied to provider observations, source URLs, timestamps and visible website content." },
      { title: "Auditable handoffs", body: "Every handoff records what was found, what is proposed, who owns the next step and what still needs approval." },
    ],
    steps: ["Receive an assignment from the Supervisor", "Investigate with approved tools", "Store evidence and a concise decision summary", "Prepare a finding or production proposal", "Hand off without self-approval"],
    integrations: ["Anthropic Agents", "DataForSEO", "Firecrawl", "GitHub", "WordPress"],
    faqs: [
      { question: "Can this agent approve its own work?", answer: "No. Agent execution and human production approval are separate controls." },
      { question: "Can I see what it used?", answer: "SEOForge shows structured decision summaries, evidence, tool activity, costs, retries and outcomes without exposing private chain-of-thought." },
    ],
  },
  feature: {
    features: [
      { title: "Continuous detection", body: "Scheduled and event-triggered checks look for meaningful change instead of spending model credits on empty polling." },
      { title: "Prioritized evidence", body: "Impact, confidence, effort and risk determine whether an observation becomes a finding or proposal." },
      { title: "Human-controlled implementation", body: "Production work enters the approval queue with evidence, expected impact, validation and rollback guidance." },
    ],
    steps: ["Detect a trigger or opportunity", "Collect current evidence", "Prioritize against other work", "Prepare the exact change", "Validate, approve, publish and measure"],
    integrations: ["Google Search Console", "GA4", "DataForSEO", "GitHub", "WordPress"],
    faqs: [
      { question: "Is this a one-time audit?", answer: "No. SEOForge monitors, investigates, proposes, measures and revisits the work as search conditions change." },
      { question: "What happens when evidence is weak?", answer: "The system records a hypothesis or defers the finding instead of presenting speculation as measured fact." },
    ],
  },
  solution: {
    features: [
      { title: "A workflow shaped around your business", body: "Markets, page types, conversion goals and publishing constraints determine what the agents prioritize." },
      { title: "Creation and optimization together", body: "SEOForge avoids treating new content and existing-content performance as separate disconnected projects." },
      { title: "Capacity you can govern", body: "Schedules, plan limits, approvals and spend controls keep autonomous work aligned with the workspace." },
    ],
    steps: ["Map the business and search market", "Connect publishing and analytics", "Choose targets and guardrails", "Operate both pipelines", "Review results by site and objective"],
    integrations: ["GitHub", "WordPress", "GA4", "Search Console", "Slack"],
    faqs: [
      { question: "Will this fit our existing website?", answer: "SEOForge first detects the repository or WordPress structure, visual system and publishing constraints before proposing implementation work." },
      { question: "Can a team manage several sites?", answer: "Agency workspaces are designed for multiple isolated sites with portfolio-level visibility and site-specific approvals." },
    ],
  },
  "use-case": {
    features: [
      { title: "Clear trigger", body: "The workflow begins from a schedule, provider anomaly, ranking movement, deployment event or direct human request." },
      { title: "Defined owner", body: "The Supervisor assigns the right specialist and prevents overlapping work from creating duplicate or conflicting proposals." },
      { title: "Measured conclusion", body: "Every production change receives a baseline, observation window and recommendation to keep, iterate or revert." },
    ],
    steps: ["Recognize the trigger", "Assign the specialist", "Collect evidence", "Prepare and validate the response", "Approve production work", "Measure the outcome"],
    integrations: ["Search Console", "GA4", "DataForSEO", "GitHub", "WordPress"],
    faqs: [
      { question: "Can I request this workflow manually?", answer: "Yes. Natural-language requests and on-demand runs use the same evidence, quota and approval controls as scheduled work." },
      { question: "How is success judged?", answer: "The result uses the metric appropriate to the objective—visibility, traffic, conversion, technical health or validated publishing quality." },
    ],
  },
  integration: {
    features: [
      { title: "Least-privilege connection", body: "SEOForge requests only the permissions needed for the selected workflow and keeps identity separate from publishing authority." },
      { title: "Encrypted credentials", body: "Provider credentials are encrypted, redacted from agent context and revocable from the workspace." },
      { title: "Visible connection health", body: "Freshness, permission errors, revocation and recovery instructions are displayed for each connected provider." },
    ],
    steps: ["Authorize the provider", "Select the property or repository", "Validate permissions", "Run a readiness check", "Begin tenant-scoped ingestion"],
    integrations: ["OAuth", "Signed webhooks", "Tenant isolation", "Audit events"],
    faqs: [
      { question: "Do agents receive my credentials?", answer: "No. Credentials stay in the platform integration layer; agents receive only scoped tool results and redacted context." },
      { question: "Can I revoke the connection?", answer: "Yes. Revocation stops new provider work and the connection card explains any affected workflows." },
    ],
  },
  comparison: {
    features: [
      { title: "Creation plus optimization", body: "SEOForge coordinates new content, existing-content improvement and production delivery as one operating system." },
      { title: "Evidence-backed production", body: "Recommendations can become validated GitHub or WordPress proposals instead of stopping at a score or editor suggestion." },
      { title: "Human authority", body: "Autonomy covers investigation and preparation; the customer retains explicit control over what reaches production." },
    ],
    steps: ["Define the evaluation criteria", "Verify current product information", "Compare workflows and boundaries", "Identify the best-fit customer for each option", "Review migration and pricing"],
    integrations: ["GitHub", "WordPress", "GA4", "DataForSEO"],
    faqs: [
      { question: "Is this comparison independent?", answer: "SEOForge publishes the comparison, so readers should treat it as vendor-authored. Product facts must be sourced and dated, and competitor strengths must remain visible." },
      { question: "When should I choose another product?", answer: "A focused editor or research tool can be the better choice when you do not need continuous monitoring, production proposals or multi-agent operations." },
    ],
  },
  resource: {
    features: [
      { title: "Actionable education", body: "Every resource explains the problem, evidence, workflow, limitations and a practical next step." },
      { title: "Search and AI ready", body: "Clear entities, answer-first passages, citations and deliberate internal links make the material useful to people and retrieval systems." },
      { title: "Connected to execution", body: "Readers can move from learning into the exact SEOForge capability that operates the workflow." },
    ],
    steps: ["Understand the problem", "Review evidence and examples", "Apply the checklist", "Connect the relevant product workflow", "Measure the result"],
    integrations: ["Guides", "Templates", "Tools", "Glossary", "Product workflows"],
    faqs: [
      { question: "Is the resource gated?", answer: "Core educational value remains visible. SEOForge does not disguise a product trial as a resource download." },
      { question: "How often is it updated?", answer: "Material carries an update date and should be reviewed when search guidance, provider behavior or product capabilities change." },
    ],
  },
  trust: {
    features: [
      { title: "Human production authority", body: "Agents cannot approve, merge, deploy or bypass branch protection through public APIs, CLI commands or MCP tools." },
      { title: "Tenant and credential isolation", body: "Workspace data, provider access, repositories and artifacts stay scoped to the authorized customer environment." },
      { title: "Traceable operations", body: "Runs, evidence, tool calls, approvals, publishing actions and failures create an auditable history." },
    ],
    steps: ["Authenticate the user", "Authorize a scoped provider", "Validate site ownership", "Reserve budget and execute", "Require explicit approval", "Audit and observe production"],
    integrations: ["Clerk", "Supabase", "GitHub", "WordPress", "Signed webhooks"],
    faqs: [
      { question: "Does SEOForge claim security certifications?", answer: "Only certifications that have actually been completed and can be supported by documentation are displayed." },
      { question: "How are incidents handled?", answer: "The trust program documents response ownership, customer communication, containment, recovery and post-incident review." },
    ],
  },
};

function page(input: PageInput): MarketingPageSpec {
  const defaults = kindDefaults[input.kind];
  return {
    ...input,
    features: input.features ?? defaults.features,
    steps: input.steps ?? defaults.steps,
    integrations: input.integrations ?? defaults.integrations,
    faqs: input.faqs ?? defaults.faqs,
    related: input.related ?? [
      { href: "/how-it-works", label: "See the complete workflow" },
      { href: "/pricing", label: "Choose a plan" },
      { href: "/security", label: "Review the safety model" },
    ],
  };
}

const platformPages: MarketingPageSpec[] = [
  page({ path: "platform", kind: "hub", eyebrow: "The platform", title: "One supervisor. Two continuous pipelines. Four accountable agents.", description: "SEOForge discovers and creates new content while independently protecting and improving the content you already own—then prepares validated production work for your approval.", primaryCta: "Choose Your Plan", primaryHref: "/pricing", secondaryCta: "See How It Works", secondaryHref: "/how-it-works" }),
  page({ path: "platform/content-growth", kind: "feature", eyebrow: "Content Growth pipeline", title: "Turn search opportunities into published, measurable content.", description: "Research, clusters, briefs, articles, media and publishing proposals move through one governed pipeline instead of a stack of disconnected writing tools.", primaryCta: "Deploy My Content Pipeline", primaryHref: "/pricing", secondaryCta: "Book a Demo", secondaryHref: "/demo" }),
  page({ path: "platform/search-optimization", kind: "feature", eyebrow: "Search Optimization pipeline", title: "Your existing content should never be left to decay.", description: "SEOForge watches technical health, rankings, competitors, internal links, backlinks and AI citations, then proposes the highest-impact improvement supported by evidence.", primaryCta: "Deploy My Optimization Pipeline", primaryHref: "/pricing", secondaryCta: "See the Workflow", secondaryHref: "/how-it-works" }),
  page({ path: "platform/workflow-supervisor", kind: "agent", eyebrow: "Workflow Supervisor", title: "The operating layer that keeps autonomous work useful, safe and on budget.", description: "The Supervisor schedules both pipelines, resolves conflicts, controls retries and spend, prevents duplicate work and enforces the human approval boundary.", primaryCta: "See the Supervisor in Action", primaryHref: "/demo" }),
  page({ path: "platform/site-experience-engineer", kind: "agent", eyebrow: "Site Experience Engineer", title: "From approved idea to website-native production change.", description: "Repository and WordPress structure, design tokens, page architecture, build commands and rollback constraints are understood before SEOForge prepares implementation work.", primaryCta: "Choose Your Publishing Plan", primaryHref: "/pricing" }),
  page({ path: "platform/human-approval", kind: "trust", eyebrow: "Human approval", title: "Autonomous work stops exactly where human authority begins.", description: "Every production proposal presents evidence, diff, preview, validation, risk and rollback information. Spoken approval, agent output or API access cannot publish a change.", primaryCta: "See the Approval Workflow", primaryHref: "/demo" }),
  page({ path: "platform/production-validation", kind: "feature", eyebrow: "Production validation", title: "Publishing is the midpoint, not the finish line.", description: "SEOForge checks the live deployment, crawls affected pages, validates schema and links, compares performance and creates a revert proposal when evidence shows regression.", primaryCta: "Protect My Production Site", primaryHref: "/pricing" }),
  page({ path: "platform/geo", kind: "feature", eyebrow: "GEO and AI visibility", title: "Measure where your brand appears across answer engines.", description: "Track approved AI visibility probes, citations, answer-ready passages, entity clarity and topical authority without presenting synthetic prompts as genuine customer traffic.", primaryCta: "Deploy My AI Visibility Workflow", primaryHref: "/pricing" }),
  page({ path: "platform/managed-blog", kind: "feature", eyebrow: "Managed blog", title: "Connect your website. SEOForge builds and operates the blog.", description: "A website-native blog can match the existing visual system, run on the customer domain, publish approved content and feed performance evidence back into both pipelines.", primaryCta: "Book a Managed Blog Demo", primaryHref: "/demo", secondaryCta: "Review Publishing Options", secondaryHref: "/integrations" }),
];

const contentFeatures = [
  ["keyword-research", "Keyword opportunity research", "Prioritize queries by intent, business value, competition, SERP composition and the authority the site can realistically build."],
  ["content-gaps", "Content-gap intelligence", "Compare topical coverage, competitor pages and the customer journey to find missing content that deserves to exist."],
  ["content-calendar", "Evidence-backed content calendar", "Turn priority opportunities into an ordered editorial system with briefs, dependencies, owners, approvals and publishing windows."],
  ["article-generation", "Article generation", "Create source-backed, brand-aligned drafts with answer-first structure, internal-link intent and clear editorial review boundaries."],
  ["editorial-review", "Editorial review", "Review claims, sources, tone, duplication, accessibility, intent match and conversion purpose before an article reaches production."],
  ["media-generation", "Article-native media generation", "Create useful diagrams, heroes, social variants and accessibility metadata that match the approved brand profile and article purpose."],
  ["monetization", "Content monetization", "Connect content opportunities to qualified demand, product education, affiliate governance and measurable conversion outcomes."],
].map(([slug, title, description]) => page({ path: `platform/content-growth/${slug}`, kind: "feature", eyebrow: "Content Growth capability", title, description, primaryCta: "Choose a Content Plan", primaryHref: "/pricing", related: [{ href: "/platform/content-growth", label: "Explore Content Growth" }, { href: "/agents/content-growth", label: "Meet the Content Growth Agent" }, { href: "/pricing", label: "Compare plan capacity" }] }));

const optimizationFeatures = [
  ["rank-tracking", "Rank tracking with production context", "Track keyword, location, device, engine and SERP features, with deployment and experiment annotations explaining when the site changed."],
  ["technical-seo", "Continuous technical SEO", "Monitor crawlability, canonicals, redirects, sitemaps, robots, structured data, performance and internal links as a living system."],
  ["content-decay", "Content-decay detection", "Find pages losing visibility or conversion value before decline becomes a quarterly reporting surprise."],
  ["content-refresh", "Evidence-backed content refreshes", "Decide whether to update, consolidate, redirect or leave a page alone based on intent, rankings, traffic and conversion evidence."],
  ["cannibalization", "Cannibalization detection", "Identify pages competing for the same intent and prepare consolidation or differentiation proposals with redirect and link implications."],
  ["internal-linking", "Internal-link intelligence", "Model topic relationships and page authority to propose natural links that improve discovery and user navigation."],
  ["competitors", "Competitor movement intelligence", "Monitor ranking pages, SERP features, gaps and visibility changes without copying competitor content or treating correlation as causation."],
  ["backlinks", "Backlink monitoring", "Track referring domains, anchors, growth and evidence-backed risk signals while avoiding unsupported toxicity labels."],
].map(([slug, title, description]) => page({ path: `platform/search-optimization/${slug}`, kind: "feature", eyebrow: "Search Optimization capability", title, description, primaryCta: "Choose an Optimization Plan", primaryHref: "/pricing", related: [{ href: "/platform/search-optimization", label: "Explore Search Optimization" }, { href: "/agents/search-optimization", label: "Meet the Search Optimization Agent" }, { href: "/pricing", label: "Compare tracked keyword capacity" }] }));

const agents: MarketingPageSpec[] = [
  page({ path: "agents", kind: "hub", eyebrow: "The autonomous team", title: "Four agents operating as one accountable SEO system.", description: "Each role owns a clear part of the workflow, but the Supervisor coordinates priorities and the human remains the only production authority.", primaryCta: "Deploy the Team", primaryHref: "/pricing" }),
  page({ path: "agents/workflow-supervisor", kind: "agent", eyebrow: "Agent 01", title: "Workflow Supervisor", description: "Routes work across both pipelines, manages schedules, budgets, conflicts, retries and approval state without becoming a production backdoor.", primaryCta: "Deploy the Team", primaryHref: "/pricing" }),
  page({ path: "agents/content-growth", kind: "agent", eyebrow: "Agent 02", title: "Content Growth Agent", description: "Finds qualified search opportunities and turns them into briefs, articles, media and governed publishing proposals that fit the brand and site.", primaryCta: "Deploy Content Growth", primaryHref: "/pricing" }),
  page({ path: "agents/search-optimization", kind: "agent", eyebrow: "Agent 03", title: "Search Optimization Agent", description: "Continuously reviews rankings, existing content, technical health, competitors, links and AI citations to prepare prioritized improvements.", primaryCta: "Deploy Search Optimization", primaryHref: "/pricing" }),
  page({ path: "agents/site-experience-engineer", kind: "agent", eyebrow: "Agent 04", title: "Site Experience Engineer", description: "Understands GitHub repositories or WordPress installations and prepares website-native code, content and media changes with validation and rollback context.", primaryCta: "Review Publishing Plans", primaryHref: "/pricing" }),
];

const solutionData = [
  ["saas", "SEOForge for SaaS", "Build a compounding content and optimization system around product categories, use cases, comparisons, integrations and technical buyer education."],
  ["ecommerce", "SEOForge for ecommerce", "Coordinate category, product, guide and seasonal content while monitoring duplication, faceting, schema, internal links and organic revenue."],
  ["agencies", "SEOForge for agencies", "Operate isolated client sites from one portfolio, with site-specific evidence, approvals, budgets, schedules and optional within-workspace learning."],
  ["publishers", "SEOForge for publishers", "Plan editorial growth, refresh decaying archives, strengthen topic relationships and protect publishing quality at scale."],
  ["affiliates", "SEOForge for affiliate publishers", "Create useful comparison and commercial content with disclosure, source, freshness and monetization governance built into the workflow."],
  ["local-business", "SEOForge for local businesses", "Coordinate service, location and educational content with local intent, entity clarity, reviews, citations and conversion measurement."],
  ["developers", "SEOForge for developer-led teams", "Use GitHub-native proposals, previews, protected branches, API access, MCP and audit history without turning SEO into another manual backlog."],
];

const solutions: MarketingPageSpec[] = [
  page({ path: "solutions", kind: "hub", eyebrow: "Solutions", title: "Choose the operating model that matches your website.", description: "SEOForge adapts priorities, page types, integrations and approvals to the business—not just the keyword list.", primaryCta: "Book a Product Walkthrough", primaryHref: "/demo" }),
  ...solutionData.map(([slug, title, description]) => page({ path: `solutions/${slug}`, kind: "solution", eyebrow: "Industry solution", title, description, primaryCta: "Choose My SEOForge Plan", primaryHref: "/pricing", secondaryCta: "Book a Demo", secondaryHref: "/demo" })),
];

const useCaseData = [
  ["create-new-content", "Create new content continuously", "Move from opportunity detection to approved, published and measured articles without rebuilding the workflow for every topic."],
  ["improve-existing-content", "Improve existing content continuously", "Find decay, mismatch, weak coverage and conversion friction, then prepare the smallest change supported by evidence."],
  ["fix-technical-seo", "Fix technical SEO problems", "Turn crawl, schema, canonical, link and performance findings into validated repository or WordPress proposals."],
  ["increase-ai-visibility", "Increase AI search visibility", "Improve answer-ready passages, entity consistency and citation evidence while measuring approved probes separately from real traffic."],
  ["publish-safely", "Publish AI-assisted work safely", "Keep research and preparation autonomous while requiring explicit human approval for the exact production change."],
  ["manage-multiple-websites", "Manage multiple websites", "Coordinate schedules, budgets, findings and approvals across a portfolio without leaking data or memory between workspaces."],
];

const useCases: MarketingPageSpec[] = [
  page({ path: "use-cases", kind: "hub", eyebrow: "Use cases", title: "Start with the search problem you need solved.", description: "Every SEOForge workflow has a trigger, accountable agent, evidence trail, approval boundary and measurable conclusion.", primaryCta: "Book a Workflow Demo", primaryHref: "/demo" }),
  ...useCaseData.map(([slug, title, description]) => page({ path: `use-cases/${slug}`, kind: "use-case", eyebrow: "Autonomous workflow", title, description, primaryCta: "Deploy This Workflow", primaryHref: "/pricing" })),
];

const integrationData = [
  ["github", "GitHub", "Authorize selected repositories through a GitHub App, prepare protected branches and pull requests, and preserve human review and branch protection."],
  ["wordpress", "WordPress", "Connect an authorized WordPress site for governed draft, update, media and publishing workflows with explicit approval."],
  ["google-search-console", "Google Search Console", "Ingest query, page, click, impression, CTR, average-position and property evidence for authorized sites."],
  ["google-analytics", "Google Analytics 4", "Connect customer-owned GA4 properties through OAuth to measure organic sessions, conversions, revenue and landing-page outcomes."],
  ["dataforseo", "DataForSEO", "Use customer-owned credentials for rankings, SERPs, features, competitors, keywords, backlinks and gap intelligence."],
  ["bing-webmaster", "Bing Webmaster Tools", "Connect Bing search performance and site diagnostics while keeping IndexNow workflows separate from unsupported indexing promises."],
  ["indexnow", "IndexNow", "Notify participating search engines about eligible changed URLs without claiming guaranteed crawl or indexing."],
  ["slack", "Slack", "Deliver ranking, indexing, failure, quota and approval notifications to authorized workspace destinations."],
  ["webhooks", "Signed webhooks", "Send scoped event notifications with signatures, delivery attempts, retries and customer-controlled endpoints."],
  ["mcp", "Remote MCP", "Let approved AI clients inspect sites, evidence and proposals or request controlled workflows without exposing approval, merge, deploy or credential tools."],
];

const integrations: MarketingPageSpec[] = [
  page({ path: "integrations", kind: "hub", eyebrow: "Integrations", title: "Connect the systems that know your search performance and publish your website.", description: "Every connection has a clear permission boundary, health state and explanation of what SEOForge can and cannot do.", primaryCta: "Choose a Connected Plan", primaryHref: "/pricing" }),
  ...integrationData.map(([slug, title, description]) => page({ path: `integrations/${slug}`, kind: "integration", eyebrow: "Integration", title: `${title} for SEOForge`, description, primaryCta: "Choose Your Plan", primaryHref: "/pricing", secondaryCta: "Review Security", secondaryHref: "/security" })),
];

const platformFrameworks = [
  ["nextjs", "Next.js blogs", "Match an existing Next.js design system, routes, metadata, image behavior, build commands and protected GitHub workflow."],
  ["wordpress", "WordPress blogs", "Work with the current theme, editor structure, media library, taxonomies, SEO plugins and approval expectations."],
  ["webflow", "Webflow blogs", "Model collections, fields, templates and publishing constraints before proposing a supported content workflow."],
  ["shopify", "Shopify blogs", "Coordinate blog content with storefront themes, products, collections and ecommerce measurement."],
  ["astro", "Astro blogs", "Generate framework-native content and layouts while preserving static build performance and repository conventions."],
  ["headless-cms", "Headless CMS blogs", "Map content models, previews, localization, references and deployment hooks before autonomous publishing begins."],
];

const blogPlatforms = platformFrameworks.map(([slug, title, description]) => page({ path: `blog-platforms/${slug}`, kind: "solution", eyebrow: "Managed blog platform", title, description, primaryCta: "Book a Managed Blog Demo", primaryHref: "/demo", integrations: [slug === "wordpress" ? "WordPress" : "GitHub", "SEOForge Brand DNA", "Analytics", "Human approval"] }));

const comparisonData = [
  ["surfer-seo", "SEOForge vs Surfer SEO", "Compare a continuous multi-agent production workflow with a focused content optimization platform."],
  ["search-atlas", "SEOForge vs Search Atlas", "Compare autonomous creation, optimization and production controls with a broader SEO software suite."],
  ["jasper", "SEOForge vs Jasper", "Compare a search-operations system with a general AI marketing content platform."],
  ["frase", "SEOForge vs Frase", "Compare continuous site operations and production proposals with research, brief and content optimization workflows."],
];

const comparisons = comparisonData.map(([slug, title, description]) => page({ path: `compare/${slug}`, kind: "comparison", eyebrow: "Vendor-authored comparison", title, description, primaryCta: "Choose SEOForge", primaryHref: "/pricing", secondaryCta: "See the Workflow", secondaryHref: "/how-it-works" }));

const guidesData = [
  ["autonomous-content-operations", "The complete guide to autonomous content operations", "Design a content system that connects opportunity discovery, editorial quality, publishing and measurement."],
  ["continuous-seo-optimization", "The complete guide to continuous SEO optimization", "Replace occasional audits with monitoring, prioritization, controlled implementation and outcome measurement."],
  ["generative-engine-optimization", "The complete guide to generative-engine optimization", "Improve how machines understand, retrieve and cite your brand while separating evidence from speculation."],
  ["programmatic-content-publishing", "The complete guide to programmatic content publishing", "Scale useful page systems with uniqueness gates, validation, approvals and index-quality controls."],
  ["seo-operations", "The complete guide to SEO operations", "Coordinate people, agents, providers, repositories, approvals, budgets and experiments as one accountable operating system."],
];

const guides = guidesData.map(([slug, title, description]) => page({ path: `guides/${slug}`, kind: "resource", eyebrow: "SEOForge guide", title, description, primaryCta: "Let SEOForge Run This Workflow", primaryHref: "/pricing" }));

const templatesData = [
  ["content-brief", "Evidence-backed content brief template", "Plan intent, sources, entities, questions, internal links, conversion purpose and editorial validation before drafting."],
  ["content-refresh", "Content refresh decision template", "Choose update, consolidate, redirect or no-change using performance, intent, duplication and conversion evidence."],
  ["seo-experiment", "SEO experiment template", "Define a hypothesis, cohort, baseline, production change, observation window and keep-or-revert criteria."],
  ["editorial-calendar", "Autonomous editorial calendar template", "Coordinate keyword clusters, dependencies, owners, approvals, media and publishing capacity."],
  ["technical-audit", "Continuous technical SEO checklist", "Review indexability, canonicals, sitemaps, structured data, links, performance and production validation."],
];

const templates = templatesData.map(([slug, title, description]) => page({ path: `templates/${slug}`, kind: "resource", eyebrow: "Practical template", title, description, primaryCta: "Automate This Template", primaryHref: "/pricing" }));

const toolsData = [
  ["seo-capacity-calculator", "SEO operations capacity calculator", "Estimate the monitored keywords, publishing volume, optimization work and approval capacity appropriate for a workspace."],
  ["content-decay-checker", "Content-decay readiness checker", "Understand the evidence required to detect declining pages reliably and connect the continuous workflow."],
  ["ai-visibility-methodology", "AI visibility methodology explorer", "Compare citation probes, answer-engine observations and real analytics without mixing synthetic prompts with traffic."],
  ["programmatic-quality-scorecard", "Programmatic SEO quality scorecard", "Evaluate uniqueness, search purpose, data value, internal links, index controls and rollout safety before scaling pages."],
];

const tools = toolsData.map(([slug, title, description]) => page({ path: `tools/${slug}`, kind: "resource", eyebrow: "SEOForge tool", title, description, primaryCta: "Deploy the Full Workflow", primaryHref: "/pricing" }));

const glossaryTerms = [
  ["content-decay", "Content decay", "A sustained loss of organic visibility, engagement or conversion value that requires evidence before a page is changed."],
  ["keyword-cannibalization", "Keyword cannibalization", "When multiple pages compete for materially overlapping intent and weaken the site’s preferred search result."],
  ["generative-engine-optimization", "Generative-engine optimization", "Practices that improve how answer engines understand, retrieve and cite accurate brand information."],
  ["search-intent", "Search intent", "The task or outcome a searcher expects the result page to help complete."],
  ["topical-authority", "Topical authority", "A site’s demonstrated depth, consistency, relationships and trust signals around a subject—not a single numeric Google score."],
  ["internal-link-graph", "Internal-link graph", "A model of pages and links used to understand discovery, hierarchy, topic relationships and authority flow."],
  ["serp-feature", "SERP feature", "A search-result element beyond a standard blue link, such as a local pack, video result or AI-generated answer."],
  ["index-coverage", "Index coverage", "The relationship between eligible site URLs and the pages a search engine has crawled, processed and chosen to index."],
  ["inp", "Interaction to Next Paint", "A Core Web Vital that measures responsiveness across user interactions using field data."],
  ["human-in-the-loop", "Human in the loop", "A workflow boundary where a person reviews and authorizes consequential production actions prepared by automation."],
];

const glossary = glossaryTerms.map(([slug, title, description]) => page({ path: `glossary/${slug}`, kind: "resource", eyebrow: "SEO glossary", title, description, primaryCta: "See How SEOForge Handles This", primaryHref: "/platform" }));

const commercialData = [
  ["seo-content-automation-software", "SEO content automation software that reaches production", "Research, briefs, articles, media, approvals and publishing operate as one measurable workflow."],
  ["autonomous-seo-platform", "An autonomous SEO platform with human production authority", "Keep monitoring and preparation continuous while retaining explicit control over every live change."],
  ["ai-blog-generation-platform", "AI blog generation connected to your real website", "Create website-native articles and media through GitHub or WordPress instead of exporting disconnected drafts."],
  ["continuous-seo-monitoring", "Continuous SEO monitoring that prepares the response", "Detect meaningful change, investigate evidence and route validated work into an approval queue."],
  ["ai-content-optimization-software", "AI content optimization for the pages you already own", "Monitor decay, intent, competitors, links and conversion evidence before proposing targeted improvements."],
  ["wordpress-seo-automation", "WordPress SEO automation with explicit publishing approval", "Connect an authorized WordPress site and govern research, drafts, updates, media and publication from one control room."],
  ["github-content-automation", "GitHub content automation through protected pull requests", "Prepare repository-native content and code changes with previews, checks, evidence and rollback guidance."],
  ["seo-automation-for-saas", "SEO automation for SaaS companies", "Coordinate category, integration, use-case, comparison and educational content with product-led conversion measurement."],
  ["seo-automation-for-agencies", "SEO automation for agencies", "Operate multiple isolated client sites with portfolio visibility, site-specific approvals and controlled capacity."],
  ["seo-automation-for-ecommerce", "SEO automation for ecommerce", "Coordinate category, product and editorial search growth with technical quality and revenue measurement."],
  ["seoforge-vs-surfer-seo", "SEOForge vs Surfer SEO", "A dated, fair comparison of continuous production operations and focused content optimization."],
  ["seoforge-vs-search-atlas", "SEOForge vs Search Atlas", "A dated, fair comparison of autonomous production workflows and broader SEO software capabilities."],
  ["seoforge-vs-jasper", "SEOForge vs Jasper", "A dated, fair comparison of search operations and general AI marketing content creation."],
  ["seoforge-vs-frase", "SEOForge vs Frase", "A dated, fair comparison of continuous site operations and research-led content workflows."],
  ["seoforge-alternatives", "SEOForge alternatives", "Understand when an editor, research platform, agency or internal team may fit better than an autonomous SEO operations system."],
  ["best-autonomous-seo-platforms", "How to evaluate autonomous SEO platforms", "A buyer’s framework for evidence, production boundaries, integrations, measurement, cost controls and operational reliability."],
];

const commercial = commercialData.map(([slug, title, description]) => page({ path: slug, kind: slug.includes("-vs-") ? "comparison" : "solution", eyebrow: "SEO operations", title, description, primaryCta: "Choose Your Plan", primaryHref: "/pricing", secondaryCta: "Book a Demo", secondaryHref: "/demo" }));

const supporting: MarketingPageSpec[] = [
  page({ path: "blog-platforms", kind: "hub", eyebrow: "Managed blog platforms", title: "Operate a blog that belongs inside the website.", description: "Compare website-native publishing workflows for Next.js, WordPress, Webflow, Shopify, Astro and headless CMS architectures.", primaryCta: "Book a Managed Blog Demo", primaryHref: "/demo" }),
  page({ path: "compare", kind: "hub", eyebrow: "Comparisons", title: "Choose the operating model—not just the feature checklist.", description: "Fair, dated comparisons explain where SEOForge fits, where focused tools may fit better and which production responsibilities remain with your team.", primaryCta: "See How SEOForge Works", primaryHref: "/how-it-works" }),
  page({ path: "guides", kind: "hub", eyebrow: "Guides", title: "Build a reliable content and search operating model.", description: "Long-form guidance on autonomous content, continuous SEO, GEO, programmatic publishing and accountable search operations.", primaryCta: "Explore the Platform", primaryHref: "/platform" }),
  page({ path: "templates", kind: "hub", eyebrow: "Templates", title: "Start with a useful operating artifact.", description: "Evidence-backed briefs, refresh decisions, experiments, editorial calendars and technical checklists designed for governed execution.", primaryCta: "Automate These Workflows", primaryHref: "/pricing" }),
  page({ path: "tools", kind: "hub", eyebrow: "Tools", title: "Plan capacity and evaluate search-operation readiness.", description: "Practical evaluators for operations capacity, content decay, AI visibility methodology and programmatic quality.", primaryCta: "Deploy the Full Workflow", primaryHref: "/pricing" }),
  page({ path: "glossary", kind: "hub", eyebrow: "Glossary", title: "A precise vocabulary for modern search operations.", description: "Understand content decay, cannibalization, GEO, intent, topical authority, internal-link graphs, SERP features, index coverage, INP and human-in-the-loop workflows.", primaryCta: "See SEOForge in Practice", primaryHref: "/platform" }),
  page({ path: "resources", kind: "hub", eyebrow: "Resources", title: "Learn the workflow. Then decide what SEOForge should operate.", description: "Guides, templates, tools, glossary entries, comparisons and field notes connect search education to accountable execution.", primaryCta: "Explore the Platform", primaryHref: "/platform" }),
  page({ path: "customers", kind: "hub", eyebrow: "Customer evidence", title: "Measured outcomes, with baselines and limitations visible.", description: "SEOForge will publish customer stories only after results, observation windows, screenshots and attribution have been verified. No fabricated logos or placeholder wins.", primaryCta: "Book a Product Walkthrough", primaryHref: "/demo" }),
  page({ path: "developers", kind: "hub", eyebrow: "Developers", title: "API, CLI, webhooks and remote MCP—without production backdoors.", description: "Inspect sites, runs, evidence, findings and proposals or request controlled workflows. Approval, merge, deploy and credential retrieval remain UI-restricted.", primaryCta: "Review Developer Workflows", primaryHref: "/docs" }),
  page({ path: "docs", kind: "resource", eyebrow: "Documentation", title: "Connect a site and reach a trustworthy first baseline.", description: "Implementation guidance for GitHub, WordPress, analytics, DataForSEO, agent operations, approvals, API tokens, MCP and troubleshooting.", primaryCta: "Choose Your Plan", primaryHref: "/pricing" }),
  page({ path: "api", kind: "resource", eyebrow: "REST API", title: "Build on scoped SEOForge operations.", description: "Use versioned endpoints for sites, health, rankings, runs, findings, evidence, experiments, proposals, usage and provider health without gaining production authority.", primaryCta: "Review Developer Workflows", primaryHref: "/developers" }),
  page({ path: "mcp", kind: "resource", eyebrow: "Remote MCP", title: "Connect approved AI clients to SEOForge safely.", description: "OAuth-protected MCP tools can inspect evidence and request controlled workflows, while approval, merge, deploy and credential retrieval remain unavailable.", primaryCta: "Review Developer Workflows", primaryHref: "/developers" }),
  page({ path: "webhooks", kind: "resource", eyebrow: "Webhooks", title: "Receive signed operational events.", description: "Subscribe to scoped site, run, finding, proposal, quota and provider-health events with signatures, idempotency, retries and delivery history.", primaryCta: "Review Developer Workflows", primaryHref: "/developers" }),
  page({ path: "sdk", kind: "resource", eyebrow: "SDKs", title: "Use typed SEOForge operations from your application.", description: "Versioned SDKs derive from the public OpenAPI contract and preserve environment, workspace, site and scope boundaries.", primaryCta: "Review Developer Workflows", primaryHref: "/developers" }),
  page({ path: "cli", kind: "resource", eyebrow: "CLI", title: "Inspect and request SEOForge work from the terminal.", description: "Authenticate through browser PKCE or a scoped service token, select test or live, request controlled workflows and watch progress without gaining merge or deploy tools.", primaryCta: "Review Developer Workflows", primaryHref: "/developers" }),
  page({ path: "demo", kind: "solution", eyebrow: "Product walkthrough", title: "See both autonomous pipelines and the human approval boundary.", description: "Walk through onboarding, live agent activity, content creation, optimization, proposal review, production delivery and outcome measurement using a representative workflow.", primaryCta: "Contact Sales", primaryHref: "/contact" }),
  page({ path: "contact-sales", kind: "solution", eyebrow: "Contact sales", title: "Design the right SEOForge operating capacity.", description: "Discuss sites, publishing systems, tracked markets, content volume, approvals, developer access, security and onboarding with the SEOForge team.", primaryCta: "Contact SEOForge", primaryHref: "/contact" }),
  page({ path: "security", kind: "trust", eyebrow: "Security", title: "Agents receive scoped tools—not credentials or production authority.", description: "Review credential encryption, tenant isolation, provider scopes, GitHub permissions, WordPress boundaries, prompt-injection defenses and human approval enforcement.", primaryCta: "Book a Security Review", primaryHref: "/contact-sales" }),
  page({ path: "trust", kind: "trust", eyebrow: "Trust center", title: "Operational trust should be documented, current and verifiable.", description: "Security policies, subprocessors, retention, responsible AI, service status, incident communication and legal documents live in one evaluation surface.", primaryCta: "Request Security Documents", primaryHref: "/contact-sales" }),
  page({ path: "changelog", kind: "resource", eyebrow: "Changelog", title: "What changed in SEOForge and why it matters.", description: "Dated releases will explain affected capabilities, migration notes, security impact and links to current documentation.", primaryCta: "Read the Documentation", primaryHref: "/docs" }),
  page({ path: "status", kind: "trust", eyebrow: "Service status", title: "Provider health, queue health and customer-facing incidents.", description: "Production status should separate SEOForge availability from third-party provider degradation and document incident history transparently.", primaryCta: "Review the Trust Center", primaryHref: "/trust" }),
  page({ path: "cookie-policy", kind: "trust", eyebrow: "Legal", title: "Cookie policy", description: "A clear explanation of essential, analytics and optional cookies, consent controls and retention will appear here after legal review.", primaryCta: "Read Privacy Policy", primaryHref: "/privacy" }),
  page({ path: "acceptable-use", kind: "trust", eyebrow: "Legal", title: "Acceptable use policy", description: "Rules for lawful provider access, content integrity, automation safety, abusive scraping, impersonation, deceptive claims and platform misuse.", primaryCta: "Read the Terms", primaryHref: "/terms" }),
  page({ path: "data-processing", kind: "trust", eyebrow: "Legal", title: "Data processing and retention", description: "How customer content, provider observations, credentials, artifacts and audit metadata are processed, isolated, retained and deleted.", primaryCta: "Review Security", primaryHref: "/security" }),
  page({ path: "subprocessors", kind: "trust", eyebrow: "Trust", title: "SEOForge subprocessors", description: "A current list of infrastructure, model, analytics, communications and storage providers, including processing purpose and relevant location information.", primaryCta: "Request Security Documents", primaryHref: "/contact-sales" }),
];

export const marketingPages = [
  ...platformPages,
  ...contentFeatures,
  ...optimizationFeatures,
  ...agents,
  ...solutions,
  ...useCases,
  ...integrations,
  ...blogPlatforms,
  ...comparisons,
  ...guides,
  ...templates,
  ...tools,
  ...glossary,
  ...commercial,
  ...supporting,
];

export const marketingPageMap = new Map(marketingPages.map((item) => [item.path, item]));

export function getMarketingPage(path: string) {
  return marketingPageMap.get(path);
}

export function getMarketingPagesByPrefix(prefix: string) {
  return marketingPages.filter((item) => item.path.startsWith(prefix));
}
