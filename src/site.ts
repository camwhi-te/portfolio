/**
 * Who the site is about. Empty strings are blanks left for Cam to fill in:
 * the page renders each one as a ruled blank until it has a value.
 */
export interface Site {
  name: string;
  /** GitHub handle; also used to measure contributions in the GitHub figures. */
  handle: string;
  url: string;
  github: string;
  /** A short line under your name, e.g. your current title. */
  role: string;
  /** Where you are based. */
  location: string;
  /** Public contact address. Shown as a mailto: link. */
  email: string;
  /** Full LinkedIn profile URL. */
  linkedin: string;
}

export const site: Site = {
  name: "Cameron White",
  handle: "camwhi-te",
  url: "https://cameronwhite.co.uk",
  github: "https://github.com/camwhi-te",

  // Yours to write -----------------------------------------------------------
  role: "",
  location: "",
  email: "",
  linkedin: "",
};
