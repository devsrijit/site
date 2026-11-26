// The public work history and availability. The home page and the llms.txt
// text both read this file, so they cannot drift apart.

export const EMAIL = "srijitghosh.dev@gmail.com";
export const RESUME = "/resume.pdf";

/** The status of the device, in datasheet words and in plain English. */
export const AVAILABILITY = {
  status: "Available now",
  plain: "Open to new roles",
  terms: "Full-stack, design or product engineer · Full-time or contract · Remote",
  detail:
    "Overlaps US and EU hours. Works as an independent contractor or through an employer of record (EOR).",
};

export type Link = { label: string; href: string };

export type Role = {
  id: string;
  name: string;
  role: string;
  dates: string;
  note: string;
  award?: Link;
  links: Link[];
  /** Plain text. A **pair** of asterisks marks the number to set in bold. */
  bullets: string[];
};

export const ROLES: Role[] = [
  {
    id: "commsync",
    name: "CommSync",
    role: "Cofounder & CTO",
    dates: "Launched Aug 2026",
    note: "AI inbox for email and SMS. Sole engineer.",
    award: {
      label: "Winner, Google All Things Agentic Hackathon",
      href: "https://devpost.com/software/commsync",
    },
    links: [{ label: "App Store", href: "https://apps.apple.com/app/id6810334130" }],
    bullets: [
      "Designed and built the whole product alone across web (Next.js), iOS (Expo) and a Bun backend. **2,500+ commits**, **600+ PRs**, **~300 users**, **~500K messages** handled.",
      "Shipped **~20 App Store releases** with native tabs, Liquid Glass, StoreKit subscriptions and self-hosted signed over-the-air updates.",
      "Built the AI core. An Ask agent with 21 tools, reply agents with draft, supervised and auto modes, a Daily Brief, and an MCP server that ChatGPT and Cursor connect to.",
      "Put 10+ channels in one inbox, including Gmail, Outlook, Twilio, RingCentral, Quo and Aircall, plus a kit for third-party texting providers.",
      "Built the RAG layer, with hybrid search on pgvector and BM25 and an OCR pipeline for attachments. Runs on arm64 EC2 behind Cloudflare Tunnel with no open inbound ports.",
      "Kept LLM costs low with a model pinned per feature on OpenRouter and USD metering on every AI call.",
      "Made the design system and the WebGL website.",
    ],
  },
  {
    id: "contract",
    name: "Contract engineer",
    role: "AI agents and automation",
    dates: "Mar 2025 – present",
    note: "Builds AI products, agentic automations and tools.",
    links: [],
    bullets: [
      "Runs **~50 AI agents** in production on a fork of Nous Research’s hermes-agent, with long-term memory, browser login with 2FA takeover and a self-hosted iMessage gateway. Sole developer.",
      "Built an AI calling platform that has placed **~50K calls**, with lead enrichment, batch calling, multi-tenant billing and post-call analysis.",
      "Built a content autopilot that publishes **~200 posts a month** across **~20 sites**.",
      "Shipped **20+ sites and apps**, plus an email agent, an AI front desk, a self-service storefront and WooCommerce plugins.",
    ],
  },
];

export type Service = { org: string; role: string; dates: string; text: string };

/** Community work, pro bono. */
export const COMMUNITY: Service[] = [
  {
    org: "CodeDay",
    role: "Regional Manager",
    dates: "2022 – 2024",
    text: "Ran a 12-hour event with 15 volunteers and 60+ students.",
  },
  {
    org: "Hack Club",
    role: "Community team",
    dates: "2021 – 2025",
    text: "Helped run hackathons for 15,000+ student coders.",
  },
];

export const SKILLS: { group: string; items: string }[] = [
  { group: "Languages", items: "TypeScript, JavaScript, Swift, Kotlin, Python, SQL" },
  { group: "Frontend", items: "React 19, Next.js 16, Tailwind, shadcn / Radix, Motion, GSAP, Three.js, WebGL shaders" },
  { group: "Mobile & desktop", items: "Expo, React Native, Reanimated, Skia, StoreKit, OTA updates, SwiftUI, AppKit, Android" },
  { group: "Design", items: "Figma, design systems, motion design, Remotion" },
  { group: "AI and agents", items: "Agent harnesses, RAG, long-term memory, hybrid search, MCP, n8n, OpenRouter, Vercel AI SDK, Playwright, LLM cost control" },
  { group: "Backend", items: "Bun, Node.js, Postgres, pgvector, Prisma, Redis, Stripe" },
  { group: "Infra", items: "AWS (EC2, S3, KMS, CloudFormation), Cloudflare (Tunnel, Access, Workers), Docker, GitHub Actions, Blacksmith, Vercel, Proxmox, Linux, PostHog" },
];

/** Removes the bold marks, for plain text. */
export const plain = (s: string) => s.replace(/\*\*/g, "");
