#!/usr/bin/env python3
"""Check preserved Manganese provenance and the maintained import boundary."""
from pathlib import Path
import hashlib
import json
import re
import sys

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
upstream = json.loads((root / "provenance/upstream.json").read_text())
expected = set()
for record in upstream["files"]:
    path = root / record["path"]
    expected.add(record["path"])
    assert path.is_file() and not path.is_symlink(), record["path"]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == record["sha256"], record["path"]
    assert bool(path.stat().st_mode & 0o111) == (record["mode"] == "100755"), record["path"]
actual = {str(p.relative_to(root)) for p in (root / "reference/manganese").rglob("*") if p.is_file()}
assert actual == expected | {"reference/manganese/LICENSE"}, "Pristine baseline file set changed"
for name in ("LICENSE", "reference/manganese/LICENSE", "src/imagine/LICENSE"):
    assert hashlib.sha256((root / name).read_bytes()).hexdigest() == upstream["license"]["sha256"], name
styles = json.loads((root / "provenance/generated-styles.json").read_text())
assert hashlib.sha256((root / styles["path"]).read_bytes()).hexdigest() == styles["sha256"], "Pinned CSS changed"
manifest = json.loads((root / "package.json").read_text())
assert manifest["name"] == "@agency-agency/imagine"
assert "@domicile-desktop/manganese" not in manifest["dependencies"]
for path in (root / "src").rglob("*"):
    if path.suffix not in (".ts", ".tsx"):
        continue
    source = path.read_text()
    for spec in re.findall(r'(?:from|import)\s*["\']([^"\']+)', source):
        assert spec != "@domicile-desktop/manganese" and not spec.startswith("@domicile-desktop/manganese/"), path
        assert "reference/" not in spec, path
        if spec.startswith(".") or spec == "bun:test":
            continue
        package = "/".join(spec.split("/")[:2]) if spec.startswith("@") else spec.split("/")[0]
        assert package in manifest["dependencies"], (path, package)
    assert not re.search(r"\brunManganese\s*\(", source), path
print(f"Verified {len(expected)} pristine Manganese files, licenses, stylesheet and independent imports")
