# Desktop intent

Imagine owns shell presentation and window-management policy through Domicile's
public SDK. Consuming dotfiles own device configuration, fonts, application
commands and shortcuts. Keep the SDK, builder and engine paired.

## Current request

Tom, 2026-11-19: "i retract the scrolling window mgmt logic. prefer good old tiling."
This supersedes the earlier Scroll/Niri ribbon request. Tom reaffirmed it on
November 21 and asked for the Zenbook update.

- Tiling and Floating are the two workspace choices; Tiling is the default.
- Remove the scrolling layout, clipping, Meta-wheel panning and its persistence.
  Migrate old mode strings to tiling without replacing native windows.
- Keep plain tiles title-less, with a complete border including the top edge.
  Tabbed and stacked groups retain their strips and inactive content stays hidden.
- Configure 13 logical pixels of inner gap on the Zenbook (roughly 3 mm on the
  scale-2 PA27JCV). No outer margin was requested.
- Mod+F/Mod+G cycle the nearest horizontal/vertical split through 1/4, 1/2, 3/4;
  Shift reverses. Preserve floating geometry presets.
- Use Manganese’s native float/tile, maximize/restore and close icons. Tom
  rejected the custom three circles on November 21 because their icon alignment
  was unsatisfactory. Keep the repaired title rendering and the host palette.
- Preserve floating groups, scratchpad minimize/restore, solo-border
  suppression, layout persistence and all native clients across shell reloads.

## Validation boundary

The paired platform for this change is Domicile source
`6f4cabdcd3bb3b8992518a702e623972e1f07706`, the SDK/builder and official engine
already selected by the Zenbook configuration. Unit tests, source provenance,
config bundling and isolated runtime acceptance are separate results. Capture
runtime evidence before updating a working desktop; a package build alone
never establishes physical keyboard, trackpad or multi-monitor acceptance.

Do not restart the compositor, user manager or agent services to update a shell.
Fake fullscreen remains future work, separate from true fullscreen and zoom.
