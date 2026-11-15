# Optional first run onboarding

The onboarding panel is configured by the host. It has no built-in account,
device or network identity. A host-selected helper supplies a sanitized
journey and coarse status, and keeps progress in the user's writable state.
Credentials remain in Chrome, the system keyring, NetworkManager, Tailscale
and each CLI's own store.

The panel yields to native account login windows and authentication dialogs.
It can be minimized and resumed, and completed steps remain different from
deferred steps. Lock and existing modal ownership take precedence over every
launch or progress update. Network setup uses Imagine's existing native quick
settings; launcher and workspace lessons use its existing actions.

The example laptop journey connects a network, then makes Chrome profile
sign-in the first account action. This ordering belongs to the host manifest,
so other installations can choose another journey without forking Imagine.
