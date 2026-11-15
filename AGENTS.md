# Imagine

Imagine owns its shell, reducer composition, policy and presentation. Use the
public Domicile SDK and components; do not patch the engine here. Preserve the
Manganese reference and MIT notices.

Device identities, account names, credentials, fonts and onboarding journeys
belong to consuming configurations. Keep those facts out of shared defaults.
An onboarding helper is an explicitly selected host executable; no arbitrary
commands or credentials belong in its manifest or shell state.

Keep SDK, builder and engine paired. Ship and validate the full source graph.
On Tom's fleet heavy work runs on strix-coordinator, after checking at least
25 GiB free. Tests launching compositors or touching runtime state use target
`~/.local/bin/runtime-test -- command args...`. Never restart an existing
desktop, user manager or agent service for a test. A package build is not
physical desktop acceptance.
