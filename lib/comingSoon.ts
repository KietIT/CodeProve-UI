// Audiences the team hasn't launched yet. Their links stay visible but locked,
// and their pages redirect to /students. Remove an entry here to re-enable it.
const COMING_SOON_HREFS: ReadonlySet<string> = new Set(["/universities", "/employers"]);

export const isComingSoon = (href: string): boolean => COMING_SOON_HREFS.has(href);
