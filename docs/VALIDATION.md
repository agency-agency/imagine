# Validation of the initial standalone package

The standalone source was built on 15 November 2026 with Domicile source,
builder and official engine selected together at
`8115d932b41be551ca7769fc2e89e323e5692c8c`.

The Nix checks passed:

- 133 pure and server-rendered component tests, with 625 assertions.
- All 50 pristine Manganese reference files and original MIT notices verified.
- The production stylesheet hash and independent Imagine imports verified.
- Host TSX evaluated and checked by the native Domicile config validator.
- The complete Imagine graph bundled into a prebuilt shell, and the resulting
  JSON checked again with its immutable shell path.
- All flake outputs evaluated, including the source derivation, modules and
  development shell.

The five onboarding rendering tests cover a hidden/minimized panel, Chrome's
explicit acknowledgement, prerequisite blocking, observed network readiness,
and the distinction between checked, confirmed and deferred work. Account
adapters are owned and tested by the consuming host configuration.

No compositor, physical desktop, keyring or personal account was changed by
these checks. Physical input, native focus handoff, screen locking and device
acceptance require their own isolated runtime or physical-seat qualification.
The package's build result does not claim that a running desktop was upgraded.
