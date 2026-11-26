import { CatalogueIndex } from "@/components/CatalogueIndex";
import { Colophon } from "@/components/Colophon";
import { Cover } from "@/components/Cover";
import { SiteJsonLd } from "@/components/JsonLd";
import { WorkHistory } from "@/components/WorkHistory";

export default function Home() {
  return (
    <main>
      <SiteJsonLd />
      <Cover />
      <CatalogueIndex />
      <WorkHistory />
      <Colophon />
    </main>
  );
}
