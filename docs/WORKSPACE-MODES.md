# Workspace modes

Imagine offers Tiling and Floating. Enable the selector with
`runImagine({ workspaceModes: true, tiling: { gap: 13 }, layoutPersistence: { identity: "host-layout-identity" } })`.
The host supplies the process-incarnation identity helper.

## Tiling

Plain split-tree tiling is the default. Tom retracted scrolling on 2026-11-19:
"i retract the scrolling window mgmt logic. prefer good old tiling."
There is no scrolling ribbon, Meta-wheel handler, viewport clipping or scroll
checkpoint. Both global and process-scoped `scrolling` mode values migrate to
`tiling`, preserving existing native identities, groups and floating ownership.

Plain tiles hide only their individual title bars. Tabbed and stacked groups
keep their strips and inactive content stays hidden. Every bar-less decorated
tile restores the top border that the title bar otherwise draws. Solo groups
suppress border paint without changing native content bounds or resize handles.

`tiling.gap` sets inner split gaps in logical pixels (default zero), with no
outer margin. The consuming Zenbook config chooses 13 pixels, approximately
3 mm on its scale-2 5K monitor. Fullscreen uses the entire output without gaps.

Size commands are `agency size-preset width|height next|prev`. Tiling cycles
the focused window/group's share of its nearest horizontal or vertical split
through 1/4, 1/2 and 3/4. Siblings divide the remainder proportionally. A missing
split on the chosen axis is a no-op. Tabs and other splits remain intact.

## Floating

Floating converts tiled groups into floating groups; explicit floats retain
their geometry. Switching back restores tiled ordering and groups, pruning
closed or moved windows. Floating size commands retain the geometric presets
1/3, 1/2, 2/3 and full workspace.

Window titles and tab strips use Manganese's native float/tile,
maximize/restore and close controls. This follows Tom's November 21 correction
rejecting the custom three-circle controls. Native components own their icon
alignment, hover behavior, tab interactions and actions. A host may supply its
existing red palette role as `windowBorders.close` for the native close X.

Explicit floats on a Tiling workspace keep the same native controls. The
paired generated stylesheet keeps title names visible. Scratchpad minimize
and restore remain available through the host's shortcuts and workspace rail;
there is no custom yellow minimize or green geometric-zoom button.
Mode selection uses the rail or `agency workspace-mode toggle|tiling|floating`.

## Recovery and updates

Global preferences contain only workspace names and mode strings. Process-scoped
checkpoints retain tree topology, floating geometry and minimized ownership.
Old scrolling-position files are no longer read or written.

Use the watched source/config or `domicile load-shell` for a shell-only update.
Keep Chromium, compositor, native clients, browser guests and PTYs alive. Match
the SDK, builder and official engine, and validate in runtime isolation first.
Engine updates remain separate physical login transitions.

## Fullscreen and references

True fullscreen remains separate from size presets and geometric zoom.
Fullscreen content in a small floating viewport remains a future feature;
it is not implemented by these layout changes.
