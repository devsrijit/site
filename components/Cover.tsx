import Link from "next/link";
import { Availability } from "./Availability";
import { Schematic } from "./Schematic";

// The UTM tags let CommSync's PostHog count visits that start on this site.
// The link sends the referrer too (no "noreferrer"), as a second signal.
const COMMSYNC_URL =
  "https://commsync.ai/?utm_source=srijit.me&utm_medium=referral&utm_campaign=portfolio&utm_content=cover";

const FEATURES = [
  ["Full-stack operation", "web, mobile, backend, infra and AI, end to end"],
  ["Integrated designer’s eye", "no external reviewer required"],
  ["Deep engine, familiar format", "a spreadsheet, a flight recorder, a video framework"],
  ["Night-rated", "20:00 to 08:00 IST operating window"],
  ["Bun-native", "pin-compatible with Next.js, React and Expo"],
  ["Hobbyist inputs", "Arduino, ESP8266, salvaged parts"],
];

const APPLICATIONS = [
  "Developer tools",
  "Interface design",
  "Agentic AI",
  "Electrical engineering",
];

export function Cover() {
  return (
    <section className="cover page" data-construct-frame aria-label="SRJT-0001 datasheet, page 1">

      <h1 className="name t-display" data-construct="type">
        <span className="name-line name-line--one">Srijit Ghosh</span>
        <span className="name-line name-line--a" aria-hidden>Srijit</span>
        <span className="name-line name-line--b" aria-hidden>Ghosh</span>
      </h1>

      <p className="title" data-construct="block">
        <span className="title-part t-label">SRJT-0001</span>
        <span className="title-main">Single-chip, full-stack product engineer</span>{" "}
        <span className="title-voice t-voice">with an integrated “designer’s eye”</span>
      </p>

      <div className="cover-body">
        <Availability />
        <div className="cover-text" data-construct="group">
          <section className="sec" data-construct="block">
            <h2 className="sec-h">
              Features
            </h2>
            <ul className="feat">
              {FEATURES.map(([k, v]) => (
                <li key={k}>
                  <b>{k}</b>: {v}
                </li>
              ))}
            </ul>
          </section>
          <section className="sec" data-construct="block">
            <h2 className="sec-h">
              Applications
            </h2>
            <ul className="apps">
              {APPLICATIONS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
          <section className="sec" data-construct="block">
            <h2 className="sec-h">
              Description
            </h2>
            <p className="desc t-voice">
              The SRJT-0001 is a single-channel product engineer. It takes an
              idea from first sketch to shipped product, and it builds the deep
              engine under a familiar format. Cofounder and CTO of{" "}
              <a href={COMMSYNC_URL} target="_blank" rel="noopener">
                CommSync
              </a>.
              Runs on IST. Best results at night.
            </p>
          </section>
          {/* Easter egg: the four face buttons, on the ledge under the last rule.
              It opens the DualSense part. */}
          <Link className="egg" href="/srj-005" aria-label="DualSense Studio, part SRJT-005" data-construct="block">
            <svg viewBox="0 0 96 20" width="96" height="20" aria-hidden>
              <path className="egg-tri" d="M10 3 18 17H2Z" />
              <circle className="egg-cir" cx="35" cy="10" r="7.5" />
              <path className="egg-x" d="m54 3 14 14M68 3 54 17" />
              <rect className="egg-sq" x="79" y="3" width="14" height="14" />
            </svg>
          </Link>
        </div>
        <Schematic />
      </div>

    </section>
  );
}
