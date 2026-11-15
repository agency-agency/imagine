{ pkgs, source, builder, bun }:
pkgs.runCommand "imagine-unit-tests" {
  nativeBuildInputs = [ pkgs.python3 bun ];
} ''
  set -euo pipefail
  export HOME="$TMPDIR"
  cp -R ${source} package
  chmod -R u+w package
  # The public builder fixes the paired Domicile workspace. No registry
  # installation or dependency resolution occurs in this check.
  workspace=$(awk '/--domicile / { print $2; exit }' ${builder})
  test -d "$workspace/packages"
  python3 ${../tools/link-workspace.py} package "$workspace"
  cd package
  bun test ./src
  touch "$out"
''
