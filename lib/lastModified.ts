import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// The last-updated date of a page, for the sitemap: the date of the last
// commit that changed any of the files the page's content comes from. It is
// read from git at build time, so nobody keeps it by hand.
//
// A shallow clone holds only the recent history. There, git reports the
// oldest commit it has for every file older than that, which would be a
// wrong date; that case returns undefined, and the sitemap leaves the date
// out instead of guessing.

let boundary: Set<string> | undefined;

function shallowBoundary(): Set<string> {
  if (boundary) return boundary;
  try {
    const file = execFileSync("git", ["rev-parse", "--git-path", "shallow"], { encoding: "utf8" }).trim();
    boundary = new Set(readFileSync(file, "utf8").split("\n").filter(Boolean));
  } catch {
    boundary = new Set(); // not shallow: the file does not exist
  }
  return boundary;
}

export function lastModified(paths: string[]): Date | undefined {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%H %cI", "--", ...paths], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!out) return undefined;
    const [sha, iso] = out.split(" ");
    if (shallowBoundary().has(sha)) return undefined;
    return new Date(iso);
  } catch {
    return undefined; // no git on this machine
  }
}
