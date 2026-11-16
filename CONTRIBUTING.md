# Contributing

Both Tom and Tarek contribute to this repository. Application and hardware
preferences belong in their dotfiles; reusable shell behavior belongs here.
Keep changes reviewable in branches and pull requests. A change to the paired
Domicile input must include the SDK/engine compatibility checks it needs.

Use public Domicile capabilities and existing shell components. Imagine owns
one reducer and one shell-command dispatcher. The Touch Bar, onboarding and
agent integrations dispatch through those owners, rather than keeping another
window model or bypassing lock/modal policy.

Run `nix flake check` for source, bundle and pure unit coverage. Check ordinary
source refresh separately from an engine/session transition. Runtime tests
must use an isolated runtime or disposable VM; preserve unexpected failures
and never restart a live desktop or agent service to repair a test.

Run heavy builds on a machine with enough free disk, and check free space
before each Nix build; stop when it is low. Run test compositors only in an
isolated runtime or a disposable virtual machine, never against a live desktop
session.

The upstream Manganese reference is immutable provenance. Adapt its behavior
in `src`, preserve MIT notices and record material source changes. Do not add
private history, fonts, device identities, account credentials or tokens.
