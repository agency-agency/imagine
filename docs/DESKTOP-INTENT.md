# Desktop intent

The requested Imagine desktop is a bespoke shell over Domicile's public
platform. Its implementation belongs in `agency-agency/imagine`. Consuming
dotfiles own the package pin, device configuration, fonts, application commands
and personal shortcuts. The upstream Manganese entry is not the desktop owner.

## Requested behavior

- Use Scroll/Niri-style scrolling as the primary tiled layout. A full-width
  column leaves its neighbors on the ribbon rather than replacing them with
  fullscreen. Cycle width and height through 1/3, 1/2, 2/3 and full size;
  Shift reverses the cycle.
- Offer a clear choice on each workspace between Scrolling and Floating.
  Scrolling has no overlapping tabs and reclaims window/tab-header space.
  Floating is a macOS/Otto-inspired desktop that retains Imagine's tab groups.
- Preserve keyboard focus, movement and splitting interactions with existing
  window groups. Changing presentation must not replace the native clients.
- Put three controls at the top left: close, minimize and geometric zoom/restore.
  Remove duplicate stock controls on the right. Minimize keeps the program
  running and provides an explicit restore route.
- Suppress colored focus/border paint when a workspace has only one visible
  window/group. Preserve resize handles and content geometry. Offscreen
  scrolling neighbors still count as workspace windows.
- Preserve layout, selected workspace, floating geometry, column/row sizes
  and scrolling position across ordinary shell reloads. Keep native clients,
  terminal PTYs and coding-agent processes alive. Never restart the compositor,
  user manager or agent services to apply or repair an ordinary shell change.

The resize chords supplied by the consuming configuration are Mod+F for width,
Mod+G for height and their Shift variants. Real fullscreen remains a separate
action. A workspace selector and a dedicated toggle shortcut expose the two
layouts. Omarchy's workspace modes and Otto's left-side controls are behavior
references; Imagine retains its own grouping implementation.

## Implemented and qualified in this branch

The two layouts, presets, focus-following scroll, viewport clipping, controls,
minimize/restore, per-workspace preferences, solo-window borders and shell
recovery are implemented. The isolated runtime proof exercised two real native
terminal programs through both modes, resizing, shell reloads and control
clicks. Their Chromium/compositor identities, native IDs and PTYs remained
stable; closing one disposable terminal left the other running.

The qualified platform is SDK source
`e2b4bc54df6c377596dec3c8228aba64b3144a97` with official engine
`f658eb352b91004c588ab47300360aee92b3ee2b`, series
`81e711f6038d9f40359548b3d1bf6312298dba155a9a5e0b668b13296e115d3a`.
This records the tested pair, rather than claiming compatibility with every
later Domicile release. The working physical desktop was left untouched.

## Remaining acceptance and future functionality

- Test the branch on the user's selected latest Domicile. Keep its SDK,
  builder and official engine together; verify the loaded pair rather than
  inferring it from a source pin. Repeat isolated reload/PTY checks first.
- Complete physical keyboard/trackpad and multi-display acceptance, including
  viewport edges, workspace switching, tab-group movement, control placement,
  and recovery with the user's coding-agent terminals. Do not inject test input
  into a working desktop.
- Run full Nix derivation checks when the build host meets the storage guard.
  Source/config bundling, unit checks and Nix evaluation are separate results.
- Fake fullscreen is an intended future feature, explicitly not required in
  this change. Let content believe it is fullscreen while Imagine keeps it in
  a small floating viewport for a picture-in-picture-like experience. Keep it
  separate from true fullscreen, size cycling and the green zoom button. This
  needs an owned shell integration; it is not video extraction or an automatic
  always-on-top guarantee. See [the fullscreen notes](WORKSPACE-MODES.md#fullscreen-and-references).

No automatic desktop update, restart or next-day job is part of this handoff.
