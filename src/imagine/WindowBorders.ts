/** Border roles come from the consuming desktop's palette. */
export type WindowBorderColors = {
  readonly active: string;
  readonly inactive: string;
};

const cssString = (value: string): string => `"${[...value].map(character =>
  /[A-Za-z0-9_-]/.test(character) ? character : `\\${character.codePointAt(0)!.toString(16)} `).join("")}"`;

/** Paint the actual frame: a focus outline behind an opaque native surface
 * does not reliably show a focus change. Preserve solo-border suppression. */
export function windowBorderCss(ids: readonly string[], activeId: string | undefined,
  colors: WindowBorderColors | undefined, borderless: ReadonlySet<string>): string {
  if (colors === undefined) return "";
  const rules = ids.flatMap(id => {
    if (borderless.has(id)) return [];
    const surface = id.startsWith("app:")
      ? `div:has(> app[app-id=${cssString(id.slice(4))}])`
      : id.startsWith("browser:")
        ? `section[aria-label="Browser"]:has(webview[window=${cssString(id.slice(8))}])`
        : undefined;
    if (surface === undefined) return [];
    const title = `.agency-desktop [data-window=${cssString(id)}]`;
    return [`.agency-desktop [data-window-frame] ${surface},${title},${title} [data-face]`
      + `{border-color:${id === activeId ? colors.active : colors.inactive}!important}`];
  });
  return `@layer base{.agency-desktop [data-focus-box]{outline:none!important;box-shadow:none!important}${rules.join("\n")}}`;
}
