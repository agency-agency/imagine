{ pkgs, configSource, domicilePackage, source }:
pkgs.runCommand "imagine-config" {
  nativeBuildInputs = [ pkgs.jq ];
  passthru = { inherit source domicilePackage; };
} ''
  set -euo pipefail
  export HOME="$TMPDIR"
  mkdir -p config
  printf '%s\n' '// Imagine source: ${source}' > config/domicile.tsx
  cat ${configSource} >> config/domicile.tsx
  cp -R ${source} config/imagine
  chmod -R u+w config
  ${domicilePackage}/libexec/domicile/builder \
    --evaluate config/domicile.tsx --cache "$TMPDIR/cache" > evaluated.log
  cat evaluated.log
  evaluated=$(jq -rR 'fromjson? | select(.step == "evaluated") | .config' evaluated.log)
  test -n "$evaluated"
  ${domicilePackage}/bin/domicile check-config "$evaluated"
  ${domicilePackage}/libexec/domicile/builder \
    --entry config/domicile.tsx --cache "$TMPDIR/cache" > built.log
  cat built.log
  built=$(jq -rR 'fromjson? | select(.step == "built") | .root' built.log)
  test -f "$built/shell.js"
  mkdir -p "$out/shell"
  cp config/domicile.tsx "$out/"
  cp -R config/imagine "$out/imagine"
  cp -R "$built/." "$out/shell/"
  jq --arg shell "$out/shell/shell.js" '.shell = $shell' "$evaluated" > "$out/domicile.json"
  ${domicilePackage}/bin/domicile check-config "$out/domicile.json"
''
