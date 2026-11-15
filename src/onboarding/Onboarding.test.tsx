import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Onboarding, useOnboarding } from "./Onboarding";

const bounds = { x: 0, y: 0, width: 1440, height: 900 };
const network = { id: "network", title: "Connect", body: "Choose a network.", action: "network.open",
  status: "complete", completion: { kind: "probe" } };
const chrome = { id: "chrome", title: "Sign in to Chrome", body: "Use your own account.",
  action: "chrome.open-profile", requires: ["network"], status: "pending",
  completion: { kind: "acknowledgement", text: "My profile is available." } };

const controller = (overrides: Record<string, unknown> = {}) => ({
  open: true, busy: false, error: undefined, current: chrome,
  state: { schema: 1, visibility: "open", currentStep: "chrome", steps: [network, chrome] },
  status: { state: "acknowledgement", message: "Confirm in the browser." },
  minimize() {}, refresh: async () => {}, select: async () => {}, complete: async () => {},
  defer: async () => {}, check: async () => {}, yieldAction: async () => {}, finish: async () => {},
  ...overrides,
}) as unknown as ReturnType<typeof useOnboarding>;

const render = (value: ReturnType<typeof controller>, region = bounds) =>
  renderToStaticMarkup(<Onboarding controller={value} bounds={region} onShellAction={() => {}} />);

describe("host-configured first-run panel", () => {
  test("a minimized or blocked controller paints no account panel", () => {
    expect(render(controller({ open: false }))).toBe("");
  });

  test("Chrome sign-in requires the person's confirmation", () => {
    const html = render(controller());
    expect(html).toContain('aria-label="Set up your computer"');
    expect(html).toContain("My profile is available.");
    expect(html).toContain('disabled="">Continue');
    expect(html).toContain("Open Chrome");
  });

  test("missing prerequisites disable the native account action", () => {
    const html = render(controller({ state: {
      schema: 1, visibility: "open", currentStep: "chrome",
      steps: [{ ...network, status: "pending" }, chrome],
    } }));
    expect(html).toContain("First finish Connect.");
    expect(html).toContain('disabled="">Open Chrome');
  });

  test("a probed connection enables Continue only when ready", () => {
    const value = controller({ current: network, status: { state: "ready", message: "Connected" } });
    expect(render(value)).toContain('type="button">Continue');
    expect(render(controller({ current: network, status: { state: "unavailable", message: "Offline" } })))
      .toContain('disabled="">Continue');
  });

  test("review distinguishes observed, acknowledged and deferred work", () => {
    const finish = { id: "finish", title: "Review", body: "Review your setup.",
      action: "onboarding.finish", status: "pending" };
    const html = render(controller({ current: finish, state: {
      schema: 1, visibility: "open", currentStep: "finish", steps: [
        { ...network, status: "complete", evidence: "observed" },
        { ...chrome, status: "complete", evidence: "acknowledged" },
        { id: "optional", title: "Optional account", status: "deferred" }, finish,
      ],
    } }));
    expect(html).toContain("Checked");
    expect(html).toContain("Confirmed");
    expect(html).toContain("Later");
  });
});
