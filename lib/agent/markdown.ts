// Plain-text views of the site for AI agents, crawlers and readers that do not
// run the page. Every fact here comes from the same part files that draw the
// datasheets, so the text and the page cannot drift apart.

import { PARTS, pageOf, type Part } from "@/lib/parts";
import { AVAILABILITY, COMMUNITY, ROLES, plain } from "@/lib/work";

export const SITE = "https://srijit.me";

export const PERSON = {
  name: "Srijit Ghosh",
  title: "Single-chip, full-stack product engineer with an integrated “designer’s eye”",
  summary:
    "Product engineer who ships whole products alone, from the first sketch to production. Cofounder and CTO of CommSync. Builds a deep, custom engine under a familiar format: a spreadsheet, a flight recorder, a video framework.",
  email: "srijitghosh.dev@gmail.com",
  github: "https://github.com/DevSrijit",
  x: "https://x.com/devsrijit",
  resume: `${SITE}/resume.pdf`,
  availability: `${AVAILABILITY.plain}: ${AVAILABILITY.terms}. ${AVAILABILITY.detail}`,
};

const cell = (s?: string) => (s && s.trim() ? s.replace(/\|/g, "\\|") : "–");

/** One part as a Markdown datasheet. */
export function partMarkdown(p: Part): string {
  const out: string[] = [];
  out.push(`## ${p.part} ${p.name.toUpperCase()}`);
  out.push("");
  out.push(`> ${p.oneLiner}`);
  out.push("");
  out.push(`- Datasheet: ${SITE}/${p.slug} (page ${pageOf(p)})`);
  out.push(`- Function: ${p.fn}`);
  out.push(`- Stack: ${p.stack}`);
  out.push(`- Package: ${p.pkg}`);
  out.push(`- Status: ${p.status} (${p.avail})`);
  if (p.live) out.push(`- ${p.live.key ?? "Live"}: ${p.live.href}`);
  out.push(`- Source: ${p.source}`);
  out.push("");
  out.push("### Features");
  out.push("");
  for (const f of p.features) out.push(`- ${f}`);
  out.push("");
  out.push("### Pin configuration and functions");
  out.push("");
  out.push("| Pin | Name | I/O | Description |");
  out.push("| --- | --- | --- | --- |");
  for (const pin of p.pins) {
    out.push(`| ${pin.n} | ${cell(pin.name)} | ${pin.io} | ${cell(pin.desc)}${pin.file ? ` (\`${pin.file}\`)` : ""} |`);
  }
  out.push("");
  out.push("### Electrical characteristics");
  out.push("");
  if (p.conditions) out.push(`Test conditions: ${p.conditions}`), out.push("");
  out.push("| Parameter | Conditions | Min | Typ | Max | Unit |");
  out.push("| --- | --- | --- | --- | --- | --- |");
  for (const g of p.chars) {
    out.push(`| **${cell(g.group)}** | | | | | |`);
    for (const r of g.rows) {
      out.push(`| ${cell(r.param)} | ${cell(r.cond)} | ${cell(r.min)} | ${cell(r.typ)} | ${cell(r.max)} | ${cell(r.unit)} |`);
    }
  }
  if (p.footnotes.length) {
    out.push("");
    for (const n of p.footnotes) out.push(`${n.n ? `(${n.n}) ` : ""}${n.text}`);
  }
  out.push("");
  out.push("### Ordering information");
  out.push("");
  for (const o of p.ordering) out.push(`- ${o.k}: ${o.href ? `[${o.v}](${o.href})` : o.v}`);
  return out.join("\n");
}

/** The work history, short (one line per role) or full (with bullets). */
function workMarkdown(full: boolean): string[] {
  const out: string[] = [];
  for (const r of ROLES) {
    const award = r.award ? ` ${r.award.label} (${r.award.href}).` : "";
    const links = r.links.map((l) => ` ${l.label}: ${l.href}.`).join("");
    out.push(`- ${r.name}, ${r.role}, ${r.dates}. ${r.note}${award}${links}`);
    if (full) for (const b of r.bullets) out.push(`  - ${plain(b)}`);
  }
  out.push("", "Community service, pro bono:", "");
  for (const c of COMMUNITY) out.push(`- ${c.org}, ${c.role}, ${c.dates}. ${c.text}`);
  return out;
}

/** The llms.txt index (https://llmstxt.org): a short map of the site. */
export function llmsIndex(): string {
  const lines = [
    `# ${PERSON.name}`,
    "",
    `> ${PERSON.title}. ${PERSON.summary}`,
    "",
    `${PERSON.availability} Email: ${PERSON.email}.`,
    "",
    "The site is a component datasheet: Srijit is the device SRJ-0001, and each public project is a part in the catalogue with real specifications from its README.",
    "",
    "## Parts",
    "",
    ...PARTS.map((p) => `- [${p.part} ${p.name}](${SITE}/${p.slug}): ${p.oneLiner} Source: ${p.source}`),
    "",
    "## Work",
    "",
    ...workMarkdown(false),
    "",
    `Full history: ${SITE}/#history and ${PERSON.resume}`,
    "",
    "## Contact",
    "",
    `- [Email](mailto:${PERSON.email})`,
    `- [Resume (PDF, one page)](${PERSON.resume})`,
    `- [GitHub](${PERSON.github})`,
    `- [X](${PERSON.x})`,
    "",
    "## Optional",
    "",
    `- [Full text of every datasheet](${SITE}/llms-full.txt)`,
  ];
  return lines.join("\n") + "\n";
}

/** Every datasheet in one Markdown file. */
export function llmsFull(): string {
  const head = [
    `# ${PERSON.name}: SRJ-0001 datasheet`,
    "",
    `> ${PERSON.title}.`,
    "",
    PERSON.summary,
    "",
    PERSON.availability,
    "",
    `- Email: ${PERSON.email}`,
    `- Resume: ${PERSON.resume}`,
    `- GitHub: ${PERSON.github}`,
    `- X: ${PERSON.x}`,
    "",
    "## Work",
    "",
    ...workMarkdown(true),
    "",
    "## Parts",
    "",
    "Every value below comes from that project's public README.",
  ];
  return [head.join("\n"), ...PARTS.map(partMarkdown)].join("\n\n") + "\n";
}
