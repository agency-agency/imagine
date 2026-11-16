# Imagine

Imagine owns its shell, reducer composition, policy and presentation. Use the
public Domicile SDK and components; do not patch the engine here. Preserve the
Manganese reference and MIT notices.

Device identities, account names, credentials, fonts and onboarding journeys
belong to consuming configurations. Keep those facts out of shared defaults.
An onboarding helper is an explicitly selected host executable; no arbitrary
commands or credentials belong in its manifest or shell state.

Keep SDK, builder and engine paired. Ship and validate the full source graph.
Run heavy builds on a machine with enough free disk; check free space before
each Nix build and stop when it is low. Tests that launch compositors or touch
runtime state run in an isolated runtime or a disposable VM, never against a
live desktop. Never restart an existing desktop, user manager or agent service
to run or repair a test; keep unexpected failures for inspection. A package
build is not physical desktop acceptance.
