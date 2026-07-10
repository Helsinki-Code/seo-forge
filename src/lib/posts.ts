export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMinutes: number;
  tag: string;
  body: string[]; // paragraphs
};

export const posts: Post[] = [
  {
    slug: "autonomous-seo-agents-explained",
    title: "Autonomous SEO Agents, Explained: What They Do and Where Humans Stay in Charge",
    description:
      "A plain-English tour of agentic SEO: continuous site review, live SERP analysis, and why the deploy button should stay human.",
    date: "2026-07-01",
    readMinutes: 7,
    tag: "Agentic SEO",
    body: [
      "Search optimization has always been a loop: audit the site, study the results pages, change something, measure, repeat. What's new is that the repetitive middle of that loop — the crawling, the SERP reading, the rewrite drafting — can now run continuously without a human driving every step.",
      "An autonomous SEO agent team splits the discipline into specialists. One agent maintains the marketing context so every piece of output stays on-brand. Another owns information architecture: URL patterns, hub-and-spoke internal links, navigation. A strategy agent runs fresh SERP analysis per keyword and turns patterns into briefs. A writer produces complete drafts against those briefs, and a media agent generates images that match each article's tone rather than generic stock lookalikes.",
      "The critical design decision is where autonomy stops. In SEO Forge, agents never push to production. Every proposed change — a rewritten title tag, an internal-linking pass, a refreshed article — lands as a pull request on the website's GitHub repository. A human reviews the diff and decides. Approval merges the PR; the site's normal deploy pipeline takes it live.",
      "This human-in-the-loop gate isn't a limitation, it's the point. It keeps editorial judgment, brand risk, and rollback authority with the site owner while the machine handles volume and vigilance. Rejected changes are signals too: they teach the operator what the team should stop proposing.",
      "The payoff is compounding: reviews get sharper because every SERP snapshot is recorded, optimizations get safer because every deploy is reviewed, and the site improves on a cadence no manual workflow can sustain.",
    ],
  },
  {
    slug: "serp-monitoring-that-actually-drives-action",
    title: "SERP Monitoring That Actually Drives Action (Not Just Dashboards)",
    description:
      "Position tracking is table stakes. The value is in what happens within hours of a movement: hypothesis, rewrite, pull request.",
    date: "2026-06-18",
    readMinutes: 6,
    tag: "Rankings",
    body: [
      "Most rank trackers end at the chart. You see a keyword slip from #4 to #9, feel bad, and add a task to a backlog. The signal decays while the work waits.",
      "A monitoring system earns its keep when a movement triggers a response. When a tracked keyword drops, the useful questions are mechanical: who took the position, what does their page have that yours lacks, did a SERP feature (AI overview, featured snippet, video pack) eat the click-through, and is your title still competitive against the new top ten?",
      "That analysis is exactly the kind of bounded, evidence-based work agents do well. In SEO Forge, a position drop can kick off a fresh SERP sweep: the strategy agent reads the current top ten, compares title patterns and content depth, and drafts a specific fix — usually a title/meta rewrite or a content-section addition — with the reasoning attached.",
      "The fix arrives as a pull request with the before and after visible in the diff. The human decision takes a minute; the response time from 'ranking moved' to 'fix live' drops from weeks to hours.",
      "Two disciplines keep this honest. First, every claim in a rewrite must trace to something real — a cited source, a verified pattern in the SERP — never invented experience. Second, every deployed change is annotated in the ranking history, so you can see whether the fix actually moved the line it was supposed to move.",
    ],
  },
  {
    slug: "on-brand-images-at-scale",
    title: "On-Brand Article Images at Scale: Tone-Matching Beats Template-Filling",
    description:
      "Generic AI images scream 'generated'. The fix is making the media agent read the article first — tone, structure, style — before it draws.",
    date: "2026-06-05",
    readMinutes: 5,
    tag: "Media",
    body: [
      "Every content site hits the same wall: writing scales faster than art direction. The result is either articles with no imagery, or a feed of interchangeable gradient-hero images that readers have learned to ignore.",
      "The fix isn't better prompts, it's better inputs. Before generating anything, a media agent should read the article it's illustrating: the argument, the section structure, the tone (technical? editorial? playful?), and the site's existing visual conventions. The image spec falls out of the reading — a how-to gets step diagrams, a comparison gets a side-by-side visual, an opinion piece gets one strong hero and no filler.",
      "Alt text deserves the same care, because it's doing double duty: accessibility for readers and context for search engines. Good generated alt text describes the specific image, works the primary keyword in naturally at most once, stays under about 125 characters, and is never duplicated across images in the same article.",
      "In SEO Forge, the writer embeds an image specification — prompt plus alt text — at every point in a draft where a visual earns its place. The image generator honors those specs exactly, flags anything it had to skip, and returns a labeled manifest so a human can review every asset before it ships.",
      "Scale without sameness is the goal: a hundred articles, each illustrated like someone actually read it. Because something did.",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
