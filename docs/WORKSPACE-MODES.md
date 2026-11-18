# Workspace modes

Imagine owns two layouts on Domicile. Enable them with
`runImagine({ workspaceModes: true, layoutPersistence: { identity: "host-layout-identity" } })`.
The host supplies the fixed identity helper; it must return the current desktop
process incarnation and create the private Imagine state directory.

## Scrolling

Windows occupy columns on a horizontal ribbon. A column can contain vertically
stacked rows. Tabbed and stacked groups are projected into separate visible
columns or rows, without changing their underlying recoverable topology.
Every tiled window reclaims the titlebar area. There are no overlapping tabs.

Widths and heights cycle through 1/3, 1/2, 2/3 and 1 of the usable workspace.
Native application minimum sizes take precedence. A full-width column leaves
its neighbors on the ribbon; it never enters fullscreen. Focus navigation
reveals the selected column and row. Meta-wheel pans horizontally and
Meta+Shift-wheel pans vertically without scrolling the application beneath it.
Each display has its own viewport, including any space reserved for the rail.
Native windows and modifier-drag sheets are clipped to that viewport.

Explicit floating windows, dialogs and normal fullscreen remain independent
of the ribbon. Entering scrolling mode retiles only groups that the workspace
mode automatically floated.

## Floating

The mode turns the workspace's tiled columns/groups into actual floating
groups. Existing explicit floats keep their geometry. New normal windows join
the selected mode. Switching back restores the tiled ordering and groups,
pruning closed, hidden or moved-away windows instead of recreating them.

The controls sit at the top left of the visible floating titlebar:

| Control | Action |
| --- | --- |
| Red | Close the selected window through its existing lifecycle handler. |
| Yellow | Minimize through the existing scratchpad; the process keeps running. |
| Green | Zoom to the usable workspace, then restore the previous rectangle. |

Restore minimized windows with the rail's restore button or the host's
scratchpad-show binding. Green zoom changes geometry without telling the app
it entered fullscreen. The existing titlebar and tab group retain their drag,
restack and tab-selection behavior; controls do not create replacement windows.

The rail names the current layout and offers both choices. Hosts can bind
`send-shell agency workspace-mode toggle` to a shortcut. Size commands are
`send-shell agency size-preset width|height next|prev`.

A workspace with one visible window/group has no focus outline or colored
shell edge. Scrolling counts all of its ribbon's windows, including offscreen
neighbors. Floating counts one visible tab group as one window. Border paint
changes without changing resize handles or native content bounds.

## Recovery and updates

The existing process-scoped layout checkpoint now stores mode-created group
topology and floating geometry. Scrolling sizes and viewport offsets use a
separate checkpoint under the same desktop identity. Global preferences store
only workspace names and mode strings. Native IDs and rectangles never cross
desktop incarnations through that global file.

A shell-only update uses the watched source/config or Domicile's load-shell
path. It must keep Chromium, the compositor, native clients, PTYs and browser
guests alive. Validate that exact source graph against the loaded SDK/engine
pair and exercise it in runtime isolation before updating a working desktop.
An engine upgrade remains a separate operation.

## Fullscreen and references

Keep real fullscreen separate from size presets and green-button zoom.
Domicile's native fullscreen state and browser page-fullscreen state can be
independent of the box Imagine gives the content. That permits a future
fullscreen-content-in-a-floating-box feature; it is not implemented here.
It does not by itself extract video or guarantee always-on-top behavior.
See the [native shell API](https://github.com/cprussin/domicile/blob/e2b4bc54df6c377596dec3c8228aba64b3144a97/docs/WRITING-A-SHELL.md#L458)
and [webview fullscreen API](https://github.com/cprussin/domicile/blob/e2b4bc54df6c377596dec3c8228aba64b3144a97/packages/chrome-sdk/src/webview-element.ts#L870).

The per-workspace mode reference is
[Omarchy's navigation manual](https://github.com/omacom/omarchy/blob/quattro/manual/04-navigation.md).
The left-side controls and geometric zoom reference is
[Otto's window management](https://github.com/nongio/otto/blob/main/docs/user/window-management.md).
Tab grouping remains Imagine's own retained functionality; Otto's tiling does
not supply it.
