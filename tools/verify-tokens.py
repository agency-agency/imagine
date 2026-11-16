#!/usr/bin/env python3
"""Check that Imagine's own stylesheets take colours and radii from one token sheet.

Usage:
  python3 tools/verify-tokens.py [ROOT]
  python3 tools/verify-tokens.py [ROOT] --write-baseline   (maintainers only)

The check passes when, for src/imagine/rail.css and src/onboarding/onboarding.css:
  1. the file defines no custom properties (no "--name: value" declarations);
  2. no declaration value contains a colour literal (#hex, rgb(), rgba(),
     hsl(), hsla(), or the words black or white);
  3. every border-radius value is var(--imagine-radius-...), 50% or 0;
  4. every var() refers to a name defined in src/styles/imagine-tokens.css;
  5. after replacing each var() with its token value, the ordered list of
     declarations equals tools/fixtures/imagine-css-baseline.json, so the
     rendered look is unchanged;
and the token sheet defines exactly the expected names, each used at least
once, and the components that load these stylesheets also load the sheet.
"""
from pathlib import Path
import json
import re
import sys

STYLESHEETS = ("src/imagine/rail.css", "src/onboarding/onboarding.css")
TOKENS = "src/styles/imagine-tokens.css"
BASELINE = "tools/fixtures/imagine-css-baseline.json"
IMPORTERS = {
    "src/imagine/WorkspaceRail.tsx": "../styles/imagine-tokens.css",
    "src/imagine/Finder.tsx": "../styles/imagine-tokens.css",
    "src/onboarding/Onboarding.tsx": "../styles/imagine-tokens.css",
}
EXPECTED_TOKENS = {
    "--imagine-color-ground", "--imagine-color-hover", "--imagine-color-selected",
    "--imagine-color-control", "--imagine-color-control-hover", "--imagine-color-scrim",
    "--imagine-color-text", "--imagine-color-text-secondary", "--imagine-color-text-muted",
    "--imagine-color-text-emphasis", "--imagine-color-outline", "--imagine-color-outline-strong",
    "--imagine-color-control-accent", "--imagine-color-attention",
    "--imagine-radius-control", "--imagine-radius-row", "--imagine-radius-panel",
}
COLOUR_LITERAL = re.compile(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:black|white)\b")
VAR = re.compile(r"var\(\s*(--[A-Za-z0-9_-]+)\s*\)")


def strip_comments(text: str) -> str:
    return re.sub(r"/\*.*?\*/", "", text, flags=re.S)


def blocks(text: str, context: str = ""):
    """Yield (context, selector, body) for each rule; one level of @media nesting."""
    i = 0
    while i < len(text):
        start = text.find("{", i)
        if start < 0:
            if text[i:].strip():
                raise SystemExit(f"unparsed trailing text: {text[i:].strip()[:60]!r}")
            return
        head = text[i:start].strip()
        depth, j = 1, start + 1
        while depth and j < len(text):
            depth += {"{": 1, "}": -1}.get(text[j], 0)
            j += 1
        if depth:
            raise SystemExit(f"unbalanced braces after {head[:60]!r}")
        body = text[start + 1:j - 1]
        if head.startswith("@"):
            yield from blocks(body, " ".join(head.split()))
        else:
            yield context, head, body
        i = j


def normal_value(value: str) -> str:
    value = " ".join(value.split())
    value = re.sub(r"\s*!\s*important", " !important", value)

    def expand(match: re.Match) -> str:
        digits = match.group(1).lower()
        if len(digits) == 3:
            digits = "".join(c * 2 for c in digits)
        return "#" + digits

    return re.sub(r"#([0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)\b", expand, value)


def normal_selector(selector: str) -> str:
    return ", ".join(" ".join(part.split()) for part in selector.split(","))


def declarations(path: Path):
    out = []
    for context, selector, body in blocks(strip_comments(path.read_text())):
        for item in body.split(";"):
            if not item.strip():
                continue
            if ":" not in item:
                raise SystemExit(f"{path}: cannot parse declaration {item.strip()!r}")
            prop, value = item.split(":", 1)
            out.append((context, normal_selector(selector), prop.strip(), value.strip()))
    return out


def resolve(value: str, table: dict) -> str:
    for _ in range(5):
        new = VAR.sub(lambda m: table.get(m.group(1), m.group(0)), value)
        if new == value:
            break
        value = new
    return normal_value(value)


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    root = Path(args[0]) if args else Path(__file__).resolve().parents[1]
    write = "--write-baseline" in sys.argv
    problems = []

    token_decls = declarations(root / TOKENS)
    tokens = {p: v for c, s, p, v in token_decls if s == ":root" and p.startswith("--")}
    if set(tokens) != EXPECTED_TOKENS:
        problems.append(f"{TOKENS}: names differ from the expected set "
                        f"(missing {sorted(EXPECTED_TOKENS - set(tokens))}, extra {sorted(set(tokens) - EXPECTED_TOKENS)})")

    if write:
        rows = []
        for name in STYLESHEETS:
            decls = declarations(root / name)
            local = {p: v for c, s, p, v in decls if p.startswith("--")}
            for c, s, p, v in decls:
                if not p.startswith("--"):
                    rows.append([name, c, s, p, resolve(v, local)])
        (root / BASELINE).parent.mkdir(parents=True, exist_ok=True)
        (root / BASELINE).write_text("[\n" + ",\n".join(json.dumps(row) for row in rows) + "\n]\n")
        print(f"wrote {len(rows)} baseline declarations to {BASELINE}")
        return 0

    baseline = json.loads((root / BASELINE).read_text())
    used = set()
    for name in STYLESHEETS:
        decls = declarations(root / name)
        actual = []
        for context, selector, prop, value in decls:
            where = f"{name}: {selector} {{ {prop} }}"
            if prop.startswith("--"):
                problems.append(f"{where}: defines a custom property; move the value into {TOKENS}")
                continue
            if COLOUR_LITERAL.search(value):
                problems.append(f"{where}: colour literal {value!r}; use a var(--imagine-color-...) token")
            if prop == "border-radius" and not (value in ("50%", "0") or re.fullmatch(r"var\(--imagine-radius-[a-z-]+\)", value)):
                problems.append(f"{where}: radius {value!r}; use var(--imagine-radius-...), 50% or 0")
            for ref in VAR.findall(value):
                used.add(ref)
                if ref not in tokens:
                    problems.append(f"{where}: var({ref}) is not defined in {TOKENS}")
            actual.append([name, context, selector, prop, resolve(value, tokens)])
        expected = [row for row in baseline if row[0] == name]
        if actual != expected:
            for index, (a, e) in enumerate(zip(actual, expected)):
                if a != e:
                    problems.append(f"{name}: declaration {index + 1} renders differently: got {a[2:]} expected {e[2:]}")
                    break
            else:
                problems.append(f"{name}: {len(actual)} declarations, baseline has {len(expected)}")

    unused = EXPECTED_TOKENS & set(tokens) - used
    if unused and not any("custom property" in p for p in problems):
        problems.append(f"tokens defined but never used: {sorted(unused)}")
    for name, spec in IMPORTERS.items():
        if f'import "{spec}";' not in (root / name).read_text():
            problems.append(f'{name}: missing import "{spec}";')

    for problem in problems:
        print("FAIL", problem)
    if problems:
        print(f"{len(problems)} problem(s)")
        return 1
    print(f"Verified {len(baseline)} declarations in {len(STYLESHEETS)} stylesheets against {len(tokens)} tokens")
    return 0


if __name__ == "__main__":
    sys.exit(main())
