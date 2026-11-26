# srijit.me

The personal site of Srijit Ghosh, set as a component datasheet. Each project is a part in the catalogue, with
specifications from its own README.

## Stack

- Next.js 16 (App Router, Cache Components) and React 19
- Bun
- Archivo, IBM Plex Mono and Newsreader (OFL)

## Run

```bash
bun install
bun run dev
```

Build for production with `bun run build`, then serve with `bun run start`.

## Scripts

- `scripts/construct-glyphs.ts` and `scripts/colophon-glyphs.ts` extract the glyph outlines for the intro and the
  footer from the built font. Run a build first.
- `scripts/og-die.ts` makes the dithered die for the share cards.
- `scripts/favicon.tsx` draws the favicon.
- `scripts/og-samples.tsx` renders sample share cards for review.

## Fonts

Archivo, IBM Plex Mono and Newsreader are under the SIL Open Font License. Their licence files are in
`assets/fonts/`.
