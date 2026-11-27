"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Page views and a few clicks, sent to PostHog. It runs only when
// NEXT_PUBLIC_POSTHOG_KEY is set, so local builds and previews send nothing.
//
// Privacy: PostHog's cookieless mode. No cookies, no local or session
// storage, so the site needs no consent banner. PostHog counts unique
// visitors with a privacy-preserving hash on its servers, so a reload or a
// new tab is not a new visitor. The project must have "Enable cookieless
// tracking" on, or PostHog drops the events. No autocapture, no session
// recording, and Do Not Track is respected.
//
// Events:
//   $pageview        every page, client-side navigations included
//   resume_download  a click on any link to /resume.pdf
//   email_click      a click on a mailto: link
//   outbound_click   a click on a link to another site (live demos, GitHub,
//                    npm, X, CommSync), with its host and its URL
//
// The events go through /ingest on this site (see next.config.ts), so ad
// blockers that block the PostHog host do not drop them.

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "https://eu.posthog.com" : "https://us.posthog.com";

export function Analytics() {
  useEffect(() => {
    if (!KEY) return;
    // React's development mode runs this effect twice; init only once.
    if (!posthog.__loaded) posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: UI_HOST,
      cookieless_mode: "always",
      autocapture: false,
      capture_dead_clicks: false,
      capture_performance: false,
      capture_pageview: "history_change",
      capture_pageleave: true,
      disable_session_recording: true,
      respect_dnt: true,
      person_profiles: "identified_only",
    });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const from = window.location.pathname;
      if (href === "/resume.pdf") {
        posthog.capture("resume_download", { from });
      } else if (href.startsWith("mailto:")) {
        posthog.capture("email_click", { from });
      } else if (a.host && a.host !== window.location.host) {
        posthog.capture("outbound_click", { from, host: a.host, url: a.href });
      }
    };
    // Capture phase, so a link that opens in a new tab is still counted.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
