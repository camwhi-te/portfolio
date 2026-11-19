// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

const stix = "./src/assets/fonts/stix-two";

// Arrows and keyboard symbols are not in STIX Two Text; they come from a tiny
// STIX Two Math subset declared as extra faces of the same family, limited by
// unicode-range so it only downloads when one of these characters appears.
/** @type {[string, ...string[]]} */
const arrowRange = [
  "U+2190-2199",
  "U+21A9-21AA",
  "U+21B5",
  "U+21E7",
  "U+2318",
  "U+2325",
  "U+23CE",
  "U+2713",
  "U+27F5-27F6",
];

export default defineConfig({
  site: "https://cameronwhite.co.uk",
  // Astro 7 strips whitespace JSX-style by default; typeset prose needs the
  // HTML rule that keeps one space between inline elements.
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: "STIX Two Text",
      cssVariable: "--font-text",
      fallbacks: ["Times New Roman", "serif"],
      options: {
        variants: [
          { src: [`${stix}/stix-two-text-regular.woff2`], weight: 400, style: "normal", display: "swap" },
          { src: [`${stix}/stix-two-text-italic.woff2`], weight: 400, style: "italic", display: "swap" },
          { src: [`${stix}/stix-two-text-semibold.woff2`], weight: 600, style: "normal", display: "swap" },
          {
            src: [`${stix}/stix-two-math-arrows.woff2`],
            weight: "400 600",
            style: "normal",
            display: "swap",
            unicodeRange: arrowRange,
          },
          {
            src: [`${stix}/stix-two-math-arrows.woff2`],
            weight: "400 600",
            style: "italic",
            display: "swap",
            unicodeRange: arrowRange,
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Courier Prime",
      cssVariable: "--font-mono",
      fallbacks: ["Courier New", "monospace"],
      options: {
        variants: [
          {
            src: ["@fontsource/courier-prime/files/courier-prime-latin-400-normal.woff2"],
            weight: 400,
            style: "normal",
            display: "swap",
          },
          {
            src: ["@fontsource/courier-prime/files/courier-prime-latin-700-normal.woff2"],
            weight: 700,
            style: "normal",
            display: "swap",
          },
        ],
      },
    },
  ],
});
