#!/usr/bin/env python3
"""Check that shared files carry no one person's machine setup.

Usage:
  python3 tools/verify-public.py [--root ROOT] [--patterns FILE] [PATH ...]

With no PATH, every text file under ROOT is scanned, except the immutable
Manganese reference, provenance records, the pinned generated stylesheet,
lock and licence files, and this script. With PATHs, only those files or
directories (relative to ROOT) are scanned.

The built-in patterns are generic: home directory paths and per-user helper
paths. A contributor may add their own host names and helper names with
--patterns FILE, one "label<TAB>regular expression" per line, kept outside
this repository so the list itself is never published.

A hit means a line names a particular person's machine setup. Shared files
state the general rule instead, for example "run heavy builds on a build host
with enough free disk" or "run compositor tests in an isolated runtime".
"""
from pathlib import Path
import re
import sys

PATTERNS = {
    "a home directory path": re.compile(r"/home/[A-Za-z0-9_.-]+"),
    "a per-user helper path": re.compile(r"~/\.local/bin/"),
}
SKIP_DIRS = {".git", "node_modules", "dist", "result", ".direnv", "reference", "provenance"}
SKIP_FILES = {"flake.lock", "LICENSE", "tools/verify-public.py", "src/styles/manganese-75708d7.css"}
TEXT_SUFFIXES = {".md", ".ts", ".tsx", ".css", ".nix", ".py", ".json", ".toml", ".txt", ""}


def candidates(root: Path, targets: list[str]):
    starts = [root / t for t in targets] if targets else [root]
    for start in starts:
        if not start.exists():
            raise SystemExit(f"no such path: {start.relative_to(root)}")
        paths = [start] if start.is_file() else sorted(start.rglob("*"))
        for path in paths:
            relative = path.relative_to(root)
            if not path.is_file() or any(part in SKIP_DIRS for part in relative.parts):
                continue
            if str(relative) in SKIP_FILES or relative.name == "LICENSE" or path.suffix not in TEXT_SUFFIXES:
                continue
            yield path, str(relative)


def main() -> int:
    argv = sys.argv[1:]
    root = Path(__file__).resolve().parents[1]
    patterns = dict(PATTERNS)
    while argv[:1] in (["--root"], ["--patterns"]):
        if argv[0] == "--root":
            root = Path(argv[1])
        else:
            for row in Path(argv[1]).read_text().splitlines():
                if row.strip() and not row.startswith("#"):
                    label, expression = row.split("\t", 1)
                    patterns[label] = re.compile(expression)
        argv = argv[2:]
    hits = 0
    for path, relative in candidates(root, argv):
        try:
            lines = path.read_text().splitlines()
        except UnicodeDecodeError:
            continue
        for number, line in enumerate(lines, 1):
            for label, pattern in patterns.items():
                if pattern.search(line):
                    hits += 1
                    print(f"FAIL {relative}:{number}: {label}: {line.strip()[:120]}")
    if hits:
        print(f"{hits} line(s) name one person's setup")
        return 1
    print("No personal setup found in shared files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
