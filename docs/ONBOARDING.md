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

## Host configuration

```tsx
export const Shell = runImagine({
  onboarding: { helper: ["/path/to/host-owned-setup-helper"] },
});
```

The helper receives one bounded JSON request on stdin and returns
`{ok:true,result:...}`. The controller uses the operations `state`, `probe`,
`visibility`, `select`, `record`, `launch` and `finish`; the host validates its
action allowlist and stores progress atomically. It must never return tokens,
cookies, command strings, private account data or arbitrary diagnostic output.

`domicile send-shell imagine onboarding open` and
`domicile send-shell imagine onboarding toggle` pass through the
existing shell command owner. Finder exposes **Set up this computer** whenever
onboarding is configured, including after initial setup was completed. A host
can bind that command to a shortcut without changing shared defaults.

The shell uses its existing native network, Finder and workspace-rail actions
for `network.open`, `tour.launcher` and `tour.workspaces`. Native account
launches wait for the minimized panel to paint before handing off focus.
