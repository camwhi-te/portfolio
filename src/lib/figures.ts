/**
 * Reference signs: every numeral a drawing uses and the part it names.
 * One list per drawing; the same numeral always names the same thing.
 */

export interface Sign {
  n: number | string;
  name: string;
  /** Defined in another figure or section: listed for the reader, not anchored here. */
  cross?: boolean;
  href?: string;
}

export const jexpanelSigns: Sign[] = [
  { n: 102, name: "panel (web application)" },
  { n: 104, name: "billing" },
  { n: 106, name: "node daemon" },
  { n: 108, name: "game-server containers 108a to 108c" },
  { n: 110, name: "database" },
  { n: 112, name: "web interface" },
  { n: 114, name: "application and API" },
  { n: 116, name: "cache and queue" },
  { n: 120, name: "node" },
  { n: 130, name: "user's browser" },
  { n: 140, name: "payment providers" },
];

export const falconSigns = (jexpanelHref: string): Sign[] => [
  { n: 200, name: "Falcon Hosting Ltd", cross: true, href: "#ref-200" },
  { n: 210, name: "game servers" },
  { n: 212, name: "Minecraft servers" },
  { n: 214, name: "Rust servers" },
  { n: 216, name: "Hytale servers" },
  { n: 220, name: "infrastructure" },
  { n: 222, name: "virtual private servers" },
  { n: 224, name: "container hosting" },
  { n: 226, name: "web-app hosting" },
  { n: 230, name: "managed IT" },
  { n: 100, name: "Jexpanel", cross: true, href: jexpanelHref },
];
