#!/usr/bin/env python3
"""Link declared dependencies from the pinned Domicile build, without install."""
from pathlib import Path
import json
import sys

project, workspace = map(Path, sys.argv[1:])
manifest = json.loads((project / "package.json").read_text())
installed = {}
for path in (workspace / "packages").glob("*/package.json"):
    package = json.loads(path.read_text())
    installed[package["name"]] = path.parent

for name in manifest["dependencies"] | manifest.get("devDependencies", {}):
    target = installed.get(name)
    if target is None:
        for anchor in (
            workspace / "packages/shell-manganese/node_modules",
            workspace / "packages/domicile-builder/node_modules",
            workspace / "node_modules",
        ):
            if (anchor / name / "package.json").is_file():
                target = (anchor / name).resolve()
                break
    if target is None:
        raise SystemExit(f"Pinned workspace does not provide {name}")
    actual = json.loads((target / "package.json").read_text())["version"]
    expected = (manifest["dependencies"] | manifest.get("devDependencies", {}))[name]
    if actual != expected:
        raise SystemExit(f"Dependency {name}: expected {expected}, got {actual}")
    link = project / "node_modules" / name
    link.parent.mkdir(parents=True, exist_ok=True)
    link.symlink_to(target, target_is_directory=True)
print("Linked declared dependencies from the paired Domicile workspace")
