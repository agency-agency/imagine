import { Axis } from "@domicile-desktop/manganese-window-management/direction";
import { pathTo } from "@domicile-desktop/manganese-window-management/tree/path";
import type { Rect } from "@domicile-desktop/manganese-window-management/rect";
import type { WindowState } from "@domicile-desktop/manganese-window-management/window-state";

type Node = NonNullable<WindowState["workspaces"][number]["tiling"]["root"]>;
export const nextSizePreset = (value: number, backward = false, floating = false): number => {
  const presets = floating ? [1 / 3, 1 / 2, 2 / 3, 1] : [1 / 4, 1 / 2, 3 / 4];
  return backward ? presets.toReversed().find(preset => preset < value - .005) ?? presets.at(-1)!
    : presets.find(preset => preset > value + .005) ?? presets[0]!;
};

/** Resize the nearest split on this axis; siblings share the remainder. */
export function cycleTiledSize(root: Node, id: string, axis: Axis, backward = false): Node {
  const path = pathTo(root, id);
  if (path === undefined) return root;
  const descend = (node: Node, rest: readonly number[]): Node => {
    if (node.kind === 1 || rest.length === 0) return node;
    const [index, ...tail] = rest;
    const child = node.children[index!]!;
    const changed = descend(child, tail);
    if (changed !== child) return { ...node, children: node.children.map((item, at) => at === index ? changed : item) };
    if (node.layout !== axis || node.children.length < 2) return node;
    const fraction = nextSizePreset(node.fractions[index!]!, backward);
    const other = node.fractions.reduce((sum, value, at) => sum + (at === index ? 0 : value), 0);
    return { ...node, fractions: node.fractions.map((value, at) => at === index ? fraction
      : other > 0 ? value / other * (1 - fraction) : (1 - fraction) / (node.children.length - 1)) };
  };
  return descend(root, path);
}

/** Pure state transition, using the existing tree and floating rectangles. */
export function cycleWindowSize(state: WindowState, id: string, axis: Axis, backward: boolean, area: Rect): WindowState {
  let changed = false;
  const workspaces = state.workspaces.map(workspace => {
    if (workspace.fullscreen !== undefined) return workspace;
    const float = workspace.floats.find(item => pathTo(item.root, id) !== undefined);
    if (float !== undefined) {
      const extent = axis === Axis.Horizontal ? area.width : area.height;
      if (extent <= 0) return workspace;
      const length = nextSizePreset((axis === Axis.Horizontal ? float.width : float.height) / extent, backward, true) * extent;
      const origin = axis === Axis.Horizontal ? area.x : area.y;
      const resized = axis === Axis.Horizontal
        ? { ...float, width: length, x: Math.max(origin, Math.min(float.x, origin + extent - length)) }
        : { ...float, height: length, y: Math.max(origin, Math.min(float.y, origin + extent - length)) };
      changed = true;
      return { ...workspace, floats: workspace.floats.map(item => item === float ? resized : item) };
    }
    const root = workspace.tiling.root;
    if (root === undefined) return workspace;
    const next = cycleTiledSize(root, id, axis, backward);
    if (next === root) return workspace;
    changed = true;
    return { ...workspace, tiling: { ...workspace.tiling, root: next } };
  });
  return changed ? { ...state, workspaces } : state;
}
