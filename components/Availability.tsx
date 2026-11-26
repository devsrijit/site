import { AVAILABILITY, EMAIL, RESUME } from "@/lib/work";
import { Arrow } from "./Arrow";

/**
 * The status of the device: a green LED, the status and the plain English,
 * with the ways to act on it. Green has one job on the site, and this is it.
 * It appears once, on the cover.
 */
export function Availability() {
  return (
    <div className="avail" data-construct="block">
      <p className="avail-line">
        <span className="avail-k t-label">
          <i className="avail-led" aria-hidden />
          {AVAILABILITY.status}
        </span>
        <span className="avail-plain">{AVAILABILITY.plain}</span>
      </p>
      <p className="avail-line avail-sub">
        <span className="avail-terms">{AVAILABILITY.terms}</span>
        <a className="avail-link" href={`mailto:${EMAIL}`}>
          Email
          <Arrow dir="right" />
        </a>
        <a className="avail-link" href={RESUME} target="_blank" rel="noopener">
          Resume
          <Arrow dir="right" />
        </a>
        <a className="avail-link" href="#history">
          History
          <Arrow dir="down" />
        </a>
      </p>
    </div>
  );
}
