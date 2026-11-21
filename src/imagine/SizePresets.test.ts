import { expect, test } from "bun:test";
import { Axis } from "@domicile-desktop/manganese-window-management/direction";
import { cycleTiledSize, cycleWindowSize, nextSizePreset } from "./SizePresets";
import { initialAgencyState } from "./policy";
import type { WindowState } from "@domicile-desktop/manganese-window-management/window-state";

type Node = NonNullable<WindowState["workspaces"][number]["tiling"]["root"]>;
const leaf = (id: string): Node => ({ kind: 1, id, focusedAt: 0 });
const group = (layout: 0 | 1 | 2 | 3, children: readonly Node[], fractions = children.map(() => 1 / children.length)): Node =>
  ({ kind: 0, layout, children, fractions, focused: 0 });

test("tiling cycles quarter, half and three quarters in either direction", () => {
  expect([.25, .5, .75].map(value => nextSizePreset(value))).toEqual([.5, .75, .25]);
  expect([.25, .5, .75].map(value => nextSizePreset(value, true))).toEqual([.75, .25, .5]);
  expect(nextSizePreset(1)).toBe(.25);
  expect(nextSizePreset(1, false, true)).toBe(1 / 3);
});

test("resizes the nearest matching split and divides the remainder proportionally", () => {
  const inner = group(0, [leaf("a"), leaf("b"), leaf("c")], [.5, .3, .2]);
  const outer = group(0, [inner, leaf("d")]);
  const resized = cycleTiledSize(outer, "a", Axis.Horizontal);
  expect(resized).toMatchObject({fractions: [.5, .5], children: [{fractions: [.75, .15, .1]}, {}]});
  expect(outer).toMatchObject({children: [{fractions: [.5, .3, .2]}, {}]});
  if (resized.kind === 0 && outer.kind === 0) expect(resized.children[1]).toBe(outer.children[1]);
});

test("height traverses a tab group to its vertical parent without splitting tabs", () => {
  const tabs = group(3, [leaf("a"), leaf("b")]);
  const root = group(1, [tabs, leaf("c")]);
  const result = cycleTiledSize(root, "b", Axis.Vertical, true);
  expect(result).toMatchObject({fractions: [.25, .75], children: [{layout: 3}, {}]});
  if (result.kind === 0) expect(result.children[0]).toBe(tabs);
  expect(cycleTiledSize(root, "b", Axis.Horizontal)).toBe(root);
  expect(cycleTiledSize(root, "missing", Axis.Vertical)).toBe(root);
});

test("state resizing preserves native windows and unrelated workspaces", () => {
  const state = initialAgencyState();
  const first = state.workspaces[0]!;
  const before = {...state, workspaces: [{...first, tiling: {root: group(0, [leaf("a"), leaf("b")]), depth: 1}}, ...state.workspaces.slice(1)]};
  const after = cycleWindowSize(before, "a", Axis.Horizontal, false, {x: 0, y: 0, width: 1200, height: 800});
  expect(after.windows).toBe(before.windows);
  expect(after.workspaces[1]).toBe(before.workspaces[1]);
  expect(after.workspaces[0]!.tiling.root).toMatchObject({fractions: [.75, .25]});
});
