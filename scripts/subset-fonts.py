"""Cut the self-hosted fonts in src/fonts down to what jvm-yore.com renders.

Usage, from the repo root:
    python scripts/subset-fonts.py              Google's files (from git) -> src/fonts, and the exact
                                                unicode-range of each file -> src/fonts/fonts.scss
    python scripts/subset-fonts.py --from DIR   read Google's files from DIR instead (a newer download)
    python scripts/subset-fonts.py --out DIR    write the woff2 files to DIR and leave the repo alone
    python scripts/subset-fonts.py --check      write nothing; fail unless src/fonts and fonts.scss are
                                                exactly what this script makes

Needs Python 3.10+ and `pip install fonttools==4.63.0 brotli==1.2.0`. The shipped files are those
versions' output byte for byte; other versions make equivalent files, not identical ones.

Input: the woff2 subsets Google Fonts serves (latin, latin-ext, cyrillic) of Geologica, Inter,
JetBrains Mono and Caveat, as committed at SOURCE_COMMIT. Every output keeps its file name. Per file:
  1. it keeps the code points of its subset (SUBSETS) that the font has;
  2. it keeps the OpenType features browsers apply on their own, plus tabular figures where the CSS
     asks for them (FEATURES, FIGURES). Fractions, stylistic sets and the like go;
  3. it trims the weight axis to the weights the SCSS uses (WEIGHTS): a narrower variable font, or a
     static instance where a family renders one weight;
  4. it keeps the vertical metrics (the metric-matched fallbacks in base/_typography.scss rely on
     them), the copyright notice and the licence URL, and refuses a face with a Reserved Font Name.
It then reports any character the site prints that a font doesn't have.
"""

from __future__ import annotations

import argparse
import io
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import NoReturn

import brotli
from fontTools import subset
from fontTools import version as fonttools_version
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables.otBase import USE_HARFBUZZ_REPACKER
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'src' / 'fonts'
SCSS = FONTS / 'fonts.scss'
LICENCES = ROOT / 'public' / 'licenses' / 'fonts.txt'

# The last commit with Google's files exactly as Google Fonts served them
SOURCE_COMMIT = '85b924754510ef2ec085e40af828b3378b52c7fe'


def span(first: int, last: int) -> set[int]:
    return set(range(first, last + 1))


# The code points each subset may hold; a file keeps those its font has. The subsets don't overlap,
# so each character has exactly one file per family.
SUBSETS = {
    # Google's latin range without the control characters: Latin-1, punctuation, € ™ − and friends
    'latin': span(0x20, 0x7E) | span(0xA0, 0xFF) | {0x131, 0x152, 0x153, 0x2BB, 0x2BC, 0x2C6, 0x2DA, 0x2DC}
    | {0x304, 0x308, 0x329} | span(0x2000, 0x206F) | {0x20AC, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215, 0xFEFF, 0xFFFD},
    # Latin Extended-A (Czech, Slovak, Polish, Hungarian, Baltic, Turkish…) and Romanian Ș ș Ț ț, in place
    # of Google's latin-ext, which adds Vietnamese, Extended-B and IPA; ı Œ œ are in latin
    'latin-ext': (span(0x100, 0x17F) - {0x131, 0x152, 0x153}) | span(0x218, 0x21B),
    # Google's cyrillic range: Ukrainian, Russian, Belarusian, Bulgarian, Serbian, Macedonian
    'cyrillic': {0x301} | span(0x400, 0x45F) | {0x490, 0x491, 0x4B0, 0x4B1, 0x2116},
}

# The weights the SCSS gives each family (font-weight and font shorthands, the $weight-* tokens).
# A pair keeps a variable font over that range; one weight makes a static instance. Bolder text
# (<b> in running text) clamps to the top of the range, as it did before the cut. Widen a range
# here and in fonts.scss before styling text in another weight.
WEIGHTS = {
    'geologica': (500, 700),  # 500 footer note, lock-screen time, team bios; 600 headings; 700 initials
    'inter': (400, 600),  # 400 body; 500 tabs, labels and register values; 600 buttons and emphasis
    'jetbrains-mono': (400, 500),  # 400 code lines; 500 chips, board tags and code labels
    'caveat': 600,  # .hand: the board's notes, the sketch's name, the signature
}

# OpenType features browsers apply without being asked, as far as these fonts have them. The rest
# (fractions, numerators, stylistic sets…) only works through CSS this site doesn't use.
FEATURES = ['abvm', 'blwm', 'calt', 'ccmp', 'clig', 'curs', 'dist', 'kern', 'liga', 'locl', 'ltra', 'ltrm',
            'mark', 'mkmk', 'rclt', 'rlig', 'rvrn']
# font-variant-numeric: tabular-nums, on the legal pages' section numbers (Geologica headings).
# Add a family here before giving its text tabular or proportional figures.
FIGURES = {'geologica': ['pnum', 'tnum']}

# Copyright (the OFL notice), family and style names, version, licence description and URL
NAME_IDS = [0, 1, 2, 3, 4, 5, 6, 13, 14]

# What Intl prints beyond the locale files' characters (dates and euros in en-GB, cs-CZ, sk-SK and
# uk-UA): ʼ in the Ukrainian 'пʼятниця', and €
INTL = {0x2BC, 0x20AC}

# Letters a visitor may type in their idea's name: Latin-1, Latin Extended-A, Romanian, Cyrillic
NAME_LETTERS = ({cp for cp in span(0xC0, 0xFF) if cp not in (0xD7, 0xF7)} | span(0x100, 0x17F)
                | span(0x218, 0x21B) | span(0x400, 0x45F) | {0x490, 0x491})

METRICS = [('head', 'unitsPerEm'), ('hhea', 'ascent'), ('hhea', 'descent'), ('hhea', 'lineGap'),
           ('OS/2', 'sTypoAscender'), ('OS/2', 'sTypoDescender'), ('OS/2', 'sTypoLineGap'),
           ('OS/2', 'usWinAscent'), ('OS/2', 'usWinDescent')]
USE_TYPO_METRICS = 1 << 7  # OS/2 fsSelection bit 7

RANGES_BLOCK = re.compile(r'^(\$ranges: \()\n(?:.*?\n)?(\);)$', re.M | re.S)
FACE = re.compile(r"\('[^']+', '([a-z-]+)', (\d+)(?: (\d+))?\)")
COMMENTS = re.compile(r'<!--.*?-->|/\*.*?\*/|(?<!:)//[^\n]*', re.S)


def fail(message: str) -> NoReturn:
    sys.exit(f'subset-fonts: {message}')


def read_source(name: str, source: Path | None) -> bytes:
    if source:
        return (source / name).read_bytes()
    git = subprocess.run(['git', '-C', str(ROOT), 'show', f'{SOURCE_COMMIT}:src/fonts/{name}'],
                         capture_output=True, check=False)
    if git.returncode:
        fail(f'cannot read {name} at {SOURCE_COMMIT[:7]} ({git.stderr.decode().strip()}); pass --from DIR')
    return git.stdout


def refuse_reserved_names(font: TTFont, label: str) -> None:
    """The OFL lets anyone cut a font down, but a modified font may not keep a Reserved Font Name."""
    if not font['name'].getDebugName(0):
        fail(f'{label}: no copyright notice (name ID 0) to keep')
    for name_id in (0, 13):
        if 'reserved font name' in (font['name'].getDebugName(name_id) or '').lower():
            fail(f'{label}: declares a Reserved Font Name, so it must not be modified; leave this face uncut')


def refuse_reserved_names_in_notices() -> None:
    """The same for the notices we publish: each font's header, above its copy of the licence."""
    text = LICENCES.read_text(encoding='utf-8')
    for header in re.findall(r'^=== .+? ===$(.*?)^-{10,}$', text, re.M | re.S):
        if 'reserved font name' in header.lower():
            fail(f'{LICENCES.name} declares a Reserved Font Name: leave that face uncut')


def notices(font: TTFont) -> dict[int, str]:
    """The copyright notice and the licence URL (name IDs 0 and 14), which the cut must keep."""
    return {record.nameID: record.toUnicode() for record in font['name'].names if record.nameID in (0, 14)}


def vertical_metrics(font: TTFont) -> dict[str, int | bool]:
    found: dict[str, int | bool] = {f'{table}.{field}': getattr(font[table], field) for table, field in METRICS}
    found['USE_TYPO_METRICS'] = bool(font['OS/2'].fsSelection & USE_TYPO_METRICS)
    return found


def features(font: TTFont) -> set[str]:
    tags: set[str] = set()
    for table in ('GSUB', 'GPOS'):
        if table in font and font[table].table.FeatureList:
            tags |= {record.FeatureTag for record in font[table].table.FeatureList.FeatureRecord}
    return tags


def cut(data: bytes, family: str, name: str) -> tuple[bytes, set[int]]:
    label = f'{family}-{name}'
    font = TTFont(io.BytesIO(data), recalcTimestamp=False)
    refuse_reserved_names(font, label)
    metrics, licence = vertical_metrics(font), notices(font)
    keep = SUBSETS[name] & set(font.getBestCmap())

    options = subset.Options()
    options.layout_features = FEATURES + FIGURES.get(family, [])
    options.name_IDs = NAME_IDS
    options.notdef_outline = True  # as Google ships it
    options.glyph_names = False
    options.harfbuzz_repacker = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=keep)
    subsetter.subset(font)  # first, so the instancer only re-encodes the glyphs that stay

    weights = WEIGHTS[family]
    # Explicit deltas for every point: optimising them again would add up to half a unit to the
    # outlines' drift from the originals, to save under 1 kB in all
    instancer.instantiateVariableFont(font, {'wght': weights}, inplace=True, optimize=False)
    font['name'].removeUnusedNames(font)

    if vertical_metrics(font) != metrics:
        fail(f'{label}: vertical metrics changed ({metrics} -> {vertical_metrics(font)})')
    if isinstance(weights, tuple):
        axis = next(axis for axis in font['fvar'].axes if axis.axisTag == 'wght')
        if (axis.minValue, axis.maxValue) != weights:
            fail(f'{label}: weight axis is {axis.minValue:g}-{axis.maxValue:g}, not {weights[0]}-{weights[1]}')
    elif 'fvar' in font or font['OS/2'].usWeightClass != weights:
        fail(f'{label}: not a static {weights} instance')
    extra = features(font) - set(options.layout_features)
    if extra:
        fail(f'{label}: kept features {sorted(extra)}')
    if set(font.getBestCmap()) != keep:
        fail(f'{label}: lost code points {ranges_of(keep - set(font.getBestCmap()))}')
    if notices(font) != licence:
        fail(f'{label}: the copyright notice or the licence URL changed')

    font.cfg[USE_HARFBUZZ_REPACKER] = False  # the same bytes with or without uharfbuzz installed
    font.flavor = 'woff2'
    out = io.BytesIO()
    font.save(out)
    return out.getvalue(), keep


def ranges_of(code_points: set[int]) -> list[str]:
    """U+0020-007E, U+00A0, … for a set of code points."""
    found, run = [], []
    for cp in sorted(code_points):
        if run and cp != run[-1] + 1:
            found.append(run)
            run = []
        run.append(cp)
    if run:
        found.append(run)
    return [f'U+{r[0]:04X}' if len(r) == 1 else f'U+{r[0]:04X}-{r[-1]:04X}' for r in found]


def wrap(items: list[str], width: int = 96) -> list[str]:
    lines, line = [], ''
    for i, item in enumerate(items):
        piece = item + (',' if i < len(items) - 1 else '')
        if line and len(line) + 1 + len(piece) > width:
            lines.append(line)
            line = piece
        else:
            line = f'{line} {piece}' if line else piece
    return lines + [line]


def with_ranges(scss: str, held: dict[str, set[int]]) -> str:
    """fonts.scss with its $ranges map rewritten from what each file holds."""
    lines = []
    for key, code_points in held.items():
        lines += [f"  '{key}': ("] + [f'    {line}' for line in wrap(ranges_of(code_points))] + ['  ),']
    scss, count = RANGES_BLOCK.subn(lambda m: '\n'.join([m.group(1), *lines, m.group(2)]), scss)
    if count != 1:
        fail(f'{SCSS.name} has no "$ranges: (" … ");" block to write the ranges into')
    return scss


def declared_weights(scss: str) -> dict[str, int | tuple[int, int]]:
    return {file: (int(low), int(high)) if high else int(low) for file, low, high in FACE.findall(scss)}


def printed_code_points() -> set[int]:
    """What the site can print: the locale files, the text in templates and code, and Intl's extras."""
    found = set(INTL)

    def collect(value: object) -> None:
        if isinstance(value, dict):
            for item in value.values():
                collect(item)
        elif isinstance(value, list):
            for item in value:
                collect(item)
        elif isinstance(value, str):
            found.update(map(ord, value))

    for path in sorted((ROOT / 'public' / 'i18n').rglob('*.json')):
        collect(json.loads(path.read_text(encoding='utf-8')))
    for path in sorted((ROOT / 'src' / 'app').rglob('*')):
        if path.suffix in ('.ts', '.html') and not path.name.endswith('.spec.ts'):
            found.update(map(ord, COMMENTS.sub(' ', path.read_text(encoding='utf-8'))))
    return {cp for cp in found if cp >= 0x20 and not 0x7F <= cp < 0xA0}


def report(held: dict[str, set[int]]) -> None:
    printed = printed_code_points()
    subsets = set().union(*SUBSETS.values())
    outside = printed - subsets
    if outside:
        print(f'note: in no subset, so system fonts draw them: {", ".join(ranges_of(outside))}')
    for family in WEIGHTS:
        has = set().union(*(held[f'{family}-{name}'] for name in SUBSETS))
        missing = (printed & subsets) - has
        if missing:
            print(f'warning: the site prints {", ".join(ranges_of(missing))}, which {family} lacks (fallback font)')
        lacking = NAME_LETTERS - has
        if lacking:
            print(f'note: {family} has no {", ".join(ranges_of(lacking))} for typed names (nor has its design)')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--from', dest='source', type=Path, help="a folder with Google's 12 woff2 files")
    parser.add_argument('--out', type=Path, help='write the woff2 files here instead of src/fonts')
    parser.add_argument('--check', action='store_true', help='write nothing; fail if the repo differs')
    args = parser.parse_args()
    print(f'fontTools {fonttools_version}, brotli {brotli.__version__}')

    refuse_reserved_names_in_notices()
    scss = SCSS.read_text(encoding='utf-8')
    if declared_weights(scss) != WEIGHTS:
        fail(f'{SCSS.name} declares weights {declared_weights(scss)}, the script cuts {WEIGHTS}')

    built: dict[str, bytes] = {}
    held: dict[str, set[int]] = {}
    for family in WEIGHTS:
        for name in SUBSETS:
            file = f'{family}-{name}.woff2'
            original = read_source(file, args.source)
            built[file], held[f'{family}-{name}'] = cut(original, family, name)
            print(f'{file}: {len(original):,} -> {len(built[file]):,} bytes')
    print(f'total: {sum(len(data) for data in built.values()):,} bytes')
    report(held)
    ranged = with_ranges(scss, held)

    if args.check:
        stale = [name for name, data in built.items() if (FONTS / name).read_bytes() != data]
        if ranged != scss:
            stale.append(SCSS.name)
        if stale:
            fail(f'out of date: {", ".join(stale)} (run python scripts/subset-fonts.py)')
        print('src/fonts and fonts.scss are up to date')
        return 0

    out = args.out or FONTS
    out.mkdir(parents=True, exist_ok=True)
    for name, data in built.items():
        (out / name).write_bytes(data)
    if args.out:
        print(f'written to {out}; fonts.scss left as it is. Its $ranges would be:')
        print(RANGES_BLOCK.search(ranged).group(0))
    else:
        SCSS.write_text(ranged, encoding='utf-8')
        print(f'written to {out}, ranges updated in {SCSS.name}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
