"""Build the web subsets of STIX Two used by the site.

Why this exists: the STIX Two Text files served by Google Fonts and Fontsource
drop the `smcp`, `c2sc` and `onum` OpenType features, so true small capitals
and old-style figures are unavailable from them (browsers fake small caps by
shrinking capitals). The production OTFs distributed on CTAN keep the full
feature set, so we subset those ourselves and keep every layout feature.

Source:  https://mirrors.ctan.org/fonts/stix2-otf.zip  (STIX Two v2.12 b168, SIL OFL 1.1)
Usage:   python tools/fonts/subset_stix.py <path-to-extracted-stix2-otf> [out-dir]
Needs:   pip install fonttools brotli
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

from fontTools import subset

# Latin text coverage: Basic Latin, Latin-1, Latin Extended-A, general
# punctuation, super/subscripts, euro, letterlike symbols, number forms and the
# handful of operators that turn up in technical prose.
TEXT_UNICODES = ",".join(
    [
        "U+0020-007E",
        "U+00A0-00FF",
        "U+0100-017F",
        "U+0192",
        "U+02BB-02BC",
        "U+02C6",
        "U+02DA",
        "U+02DC",
        "U+2000-206F",
        "U+2070-209F",
        "U+20AC",
        "U+2100-214F",
        "U+2150-218F",
        "U+2212",
        "U+2215",
        "U+221E",
        "U+2248",
        "U+2260",
        "U+2264-2265",
    ]
)

# Arrows and keyboard symbols exist only in STIX Two Math. They ship as a
# tiny companion face that the CSS stack pulls in through unicode-range.
ARROW_UNICODES = ",".join(
    [
        "U+2190-2199",
        "U+21A9-21AA",
        "U+21B5",
        "U+21E7",
        "U+2318",
        "U+2325",
        "U+23CE",
        "U+2713",
        "U+27F5-27F6",
    ]
)

FACES = {
    # output name: (source file, unicodes)
    "stix-two-text-regular": ("STIXTwoText-Regular.otf", TEXT_UNICODES),
    "stix-two-text-italic": ("STIXTwoText-Italic.otf", TEXT_UNICODES),
    "stix-two-text-semibold": ("STIXTwoText-SemiBold.otf", TEXT_UNICODES),
    "stix-two-math-arrows": ("STIXTwoMath-Regular.otf", ARROW_UNICODES),
}


def build(src_dir: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, (source, unicodes) in FACES.items():
        src = src_dir / source
        if not src.exists():
            raise SystemExit(f"missing source font: {src}")
        dest = out_dir / f"{name}.woff2"
        args = [
            str(src),
            f"--unicodes={unicodes}",
            "--layout-features=*",
            "--layout-scripts=*",
            "--flavor=woff2",
            "--desubroutinize",
            "--notdef-outline",
            "--name-IDs=*",
            "--name-languages=*",
            f"--output-file={dest}",
        ]
        if name == "stix-two-math-arrows":
            # The MATH table is meaningless for a few arrows and weighs a lot.
            args.append("--drop-tables+=MATH")
        subset.main(args)
        print(f"{dest.name}: {dest.stat().st_size / 1024:.1f} KiB")
    shutil.copyfile(src_dir / "OFL.txt", out_dir / "OFL.txt")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    source_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("src/assets/fonts/stix-two")
    build(source_dir, output_dir)
