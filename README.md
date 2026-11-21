# Imagine

Imagine is a desktop shell for [Domicile](https://github.com/cprussin/domicile),
maintained independently by agency-agency. It is a fork of Manganese's shell
implementation, with its own desktop, reducer composition, window presentation
and options. It reuses Domicile's public SDK, React bindings, native controls
and Manganese component packages.

The shared defaults are a black desktop, no top bar, zero gaps, rounded window
chrome, split-first placement, a workspace rail and Finder. Devices, display
profiles, fonts, application commands, account names and onboarding journeys
are supplied by the consuming dotfiles.

## Use from Nix

Add this input alongside the same Domicile input that runs the desktop:

```nix
imagine = {
  url = "github:agency-agency/imagine";
  inputs.domicile.follows = "domicile";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

Keep `flake.lock` committed. Both users can follow the same shared shell while
updating their pins deliberately; a fresh pull must not replace a running
compositor or provider session.

`imagine.lib.mkConfig` builds a host entry against the selected Domicile SDK:

```nix
checked = inputs.imagine.lib.mkConfig {
  inherit pkgs;
  configSource = ./domicile.tsx;
  domicilePackage = config.programs.domicile.package;
};
```

The host-owned entry imports the shared shell from its bundled companion:

```tsx
import { runImagine } from "./imagine/src/index";
export const Shell = runImagine({
  workspaceModes: true,
  tiling: { gap: 13 },
  webBrowser: { command: ["google-chrome-stable"] },
});
export const terminal = ["kitty"];
```

The result contains `domicile.json` with a **prebuilt** `shell/shell.js`, plus
the checked `domicile.tsx` and its complete `imagine` source directory. Install
the JSON for an offline first login. For watched source development, install
the TSX and companion directory instead. Never install both configuration
forms together.

The Home Manager module implements either choice:

```nix
imports = [ inputs.imagine.homeManagerModules.default ];
programs.imagine = {
  enable = true;
  configSource = ./domicile.tsx;
  prebuilt = true;
};
```

Enable Domicile's machine-level NixOS module separately, or import
`imagine.nixosModules.default` and set `programs.imagine.enable = true`.
Choose a normal display-manager session and configure its PAM/keyring policy
in the machine's dotfiles. Imagine selects no login manager, user or password.

## Workspace modes

Enable `workspaceModes: true` to choose **Tiling** or **Floating** per workspace.
Tiling is the default: windows share the available space through a split tree;
tabbed and stacked groups retain their strips. Plain tiles reclaim their title
area and keep a complete border. `tiling: { gap: 13 }` adds inner gaps in logical
pixels without outer margins; the shared default remains zero.

Width and height commands (`agency size-preset width|height next|prev`) cycle
the nearest matching split through one quarter, one half and three quarters.
Shift-bound `prev` commands reverse the cycle; no matching split is a no-op.
Floating retains its geometric one-third, half, two-thirds and full-size cycle.
Its controls are on the right: green zoom, yellow minimize, red close.

`agency workspace-mode toggle|tiling|floating` selects the layout. Minimized
windows use the existing scratchpad and the rail's restore button. Mode choices
persist across desktop starts, while native identities and layout checkpoints
stay scoped to the running desktop. Old `scrolling` choices migrate to tiling.
The scrolling ribbon, viewport clipping, panning and scroll-position persistence
have been removed following the November 19 retraction.

See [workspace modes](docs/WORKSPACE-MODES.md) for controls, recovery and the
fullscreen distinction. Native audio/call menus can be enabled separately with
`audioControls: true` when the host provides `imagine-audio-control`.
The [desktop intent](docs/DESKTOP-INTENT.md) records the requested behavior,
qualified platform, remaining physical acceptance and future fake fullscreen.

## Source and validation

The fork baseline is Domicile commit
`67c29a9906905bd5e1679803232c2f510b3fed9e`, directory
`packages/shell-manganese`. `reference/manganese` preserves that package
unchanged. Its Git blobs and file hashes are recorded in
`provenance/upstream.json`; the original MIT notices remain intact.

The initial standalone source is the production payload from
`mecattaf/dotfiles` commit `435e61f084fce5f4892dad608703eb10a5ad8d49`.
`provenance/source.json` records the source selection and standalone changes.
The separate original working checkout was preserved without modification.

The supported SDK, builder and engine pair is pinned by this flake. Source
compatibility, package checks, isolated compositor behavior and physical device
acceptance are distinct results. A package build does not replace the engine
already running in someone's desktop.

```sh
nix build .#default
nix flake check
```

`packages.x86_64-linux.source` contains only production source and notices.
`default`/`shell` contains the checked configuration and prebuilt shell.
`checks` covers provenance, pure unit tests and a checked native config/bundle.
These use the pinned Domicile workspace without an npm install at first login.

See [CONTRIBUTING.md](CONTRIBUTING.md) for shared development and
[docs/ONBOARDING.md](docs/ONBOARDING.md) for the optional first-run interface.
