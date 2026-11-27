// Structured data for search engines and AI agents (schema.org JSON-LD).
// The "<" escape keeps a value from closing the script tag early.

import { PERSON, SITE } from "@/lib/agent/markdown";
import type { Part } from "@/lib/parts";

function Script({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const person = {
  "@type": "Person",
  "@id": `${SITE}/#person`,
  name: PERSON.name,
  url: SITE,
  email: `mailto:${PERSON.email}`,
  jobTitle: "Full-Stack Product Engineer",
  description: PERSON.summary,
  image: `${SITE}/avatar-dsphere.png`,
  sameAs: [PERSON.github, PERSON.x],
  knowsAbout: [
    "Product engineering",
    "Full-stack development",
    "Backend engineering",
    "Infrastructure",
    "TypeScript",
    "React",
    "Next.js",
    "Swift",
    "AI agents",
    "Retrieval-augmented generation",
    "Design systems",
    "Motion design",
  ],
};

/** On the home page: the site and the person it is about. */
export function SiteJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@graph": [
          person,
          {
            "@type": "WebSite",
            "@id": `${SITE}/#website`,
            url: SITE,
            name: "srijit.me",
            description: `${PERSON.name}: ${PERSON.title}.`,
            publisher: { "@id": `${SITE}/#person` },
            inLanguage: "en",
          },
          {
            "@type": "ProfilePage",
            "@id": `${SITE}/#profile`,
            url: SITE,
            name: `${PERSON.name} · Full-stack product engineer`,
            mainEntity: { "@id": `${SITE}/#person` },
            isPartOf: { "@id": `${SITE}/#website` },
          },
        ],
      }}
    />
  );
}

/** On a part page: the project as source code by the person. */
export function PartJsonLd({ part }: { part: Part }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@graph": [
          person,
          {
            "@type": "SoftwareSourceCode",
            "@id": `${SITE}/${part.slug}#code`,
            name: part.name,
            alternateName: part.part,
            description: part.oneLiner,
            url: `${SITE}/${part.slug}`,
            codeRepository: part.source,
            ...(part.live ? { sameAs: [part.live.href] } : {}),
            author: { "@id": `${SITE}/#person` },
            license: "https://opensource.org/licenses/MIT",
            keywords: part.stack.split("·").map((s) => s.trim()),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "SRJT-0001", item: SITE },
              { "@type": "ListItem", position: 2, name: `${part.part} ${part.name}`, item: `${SITE}/${part.slug}` },
            ],
          },
        ],
      }}
    />
  );
}
