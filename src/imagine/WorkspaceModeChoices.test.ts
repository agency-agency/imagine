import { expect, test } from "bun:test";
import type { WorkspaceModeMemory } from "./WorkspaceModes";
import { decodeWorkspaceModeChoices, encodeWorkspaceModeChoices } from "./WorkspaceModeChoices";

test("global choices retain modes without carrying native IDs or geometry into a new desktop", () => {
  const memory: WorkspaceModeMemory = {
    "2": {mode: "floating", automatic: ["app:previous-desktop"], floating: [{
      root: {kind: 1, id: "app:previous-desktop", focusedAt: 4}, depth: 0,
      x: 32, y: 41, width: 800, height: 600, bare: false, scratchpad: false,
    }], tiled: {depth: 1, root: {kind: 1, id: "app:old-tile", focusedAt: 3}},
      zoom: {"app:previous-desktop": {x: 12, y: 24, width: 700, height: 480}}},
    "10": {mode: "scrolling", automatic: [], floating: [], zoom: {}},
  };
  const encoded = encodeWorkspaceModeChoices(memory);
  expect(JSON.parse(encoded)).toEqual({version: 1, modes: {"2": "floating", "10": "scrolling"}});
  expect(encoded).not.toContain("app:");
  expect(encoded).not.toContain("width");
  const fresh = decodeWorkspaceModeChoices(encoded);
  expect(fresh["2"]).toEqual({mode: "floating", automatic: [], floating: [], zoom: {}});
  expect(Object.hasOwn(fresh["2"]!, "tiled")).toBe(false);
  expect(fresh["10"]!.mode).toBe("scrolling");
  expect(memory["2"]!.automatic).toEqual(["app:previous-desktop"]);
});

test("empty choices are a valid initial desktop preference", () => {
  expect(decodeWorkspaceModeChoices(encodeWorkspaceModeChoices({}))).toEqual({});
});

test("invalid names, mode values, versions and unknown state fields are rejected", () => {
  const invalid = [
    null, [], {}, {version: 2, modes: {}}, {version: 1, modes: []},
    {version: 1, modes: {"0": "floating"}}, {version: 1, modes: {"11": "floating"}},
    {version: 1, modes: {"01": "scrolling"}}, {version: 1, modes: {"one": "scrolling"}},
    {version: 1, modes: {"1": "tabbed"}}, {version: 1, modes: {"1": 1}},
    {version: 1, modes: {"1": {mode: "floating", automatic: ["app:old"]}}},
    {version: 1, modes: {}, automatic: ["app:old"]},
  ];
  for (const value of invalid) expect(() => decodeWorkspaceModeChoices(JSON.stringify(value))).toThrow();
  expect(() => decodeWorkspaceModeChoices("{broken")).toThrow();
});

test("the global file is bounded by UTF-8 bytes", () => {
  expect(() => decodeWorkspaceModeChoices(" ".repeat(16 * 1024 + 1))).toThrow("limit");
  expect(() => decodeWorkspaceModeChoices("é".repeat(9 * 1024))).toThrow("limit");
});

test("encoding refuses invalid internal mode records instead of writing an unusable global file", () => {
  expect(() => encodeWorkspaceModeChoices({"11": {mode: "floating", automatic: [], floating: [], zoom: {}}})).toThrow();
  expect(() => encodeWorkspaceModeChoices({"1": {mode: "tabs", automatic: [], floating: [], zoom: {}}} as unknown as WorkspaceModeMemory)).toThrow();
});
