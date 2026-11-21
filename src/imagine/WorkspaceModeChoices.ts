import type { WorkspaceMode, WorkspaceModeMemory, WorkspaceModeRecord } from "./WorkspaceModes";

const LIMIT = 16 * 1024;
const workspaceName = (name: string): string => {
  if (!/^(?:[1-9]|10)$/.test(name)) throw Error("Invalid workspace mode choice name");
  return name;
};
const modeChoice = (value: unknown): WorkspaceMode => {
  if (value === "scrolling") return "tiling";
  if (value !== "tiling" && value !== "floating") throw Error("Invalid workspace mode choice");
  return value;
};
const object = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw Error("Invalid workspace mode choices");
  return value as Record<string, unknown>;
};

/** Save only the selected modes across desktop incarnations. Window IDs,
 * floating rectangles, zoom state and tiled checkpoints stay process-scoped. */
export function encodeWorkspaceModeChoices(memory: WorkspaceModeMemory): string {
  const modes: Record<string, WorkspaceMode> = {};
  for (const [name, record] of Object.entries(memory)) modes[workspaceName(name)] = modeChoice(record.mode);
  return JSON.stringify({version: 1, modes}) + "\n";
}

/** Seed fresh mode records without reusing any prior desktop's native IDs. */
export function decodeWorkspaceModeChoices(text: string): WorkspaceModeMemory {
  if (text.length > LIMIT || new TextEncoder().encode(text).byteLength > LIMIT) throw Error("Workspace mode choices limit");
  const payload = object(JSON.parse(text));
  if (Object.keys(payload).sort().join(",") !== "modes,version" || payload.version !== 1)
    throw Error("Invalid workspace mode choices version or fields");
  const memory: Record<string, WorkspaceModeRecord> = {};
  for (const [name, value] of Object.entries(object(payload.modes))) memory[workspaceName(name)] = {
    mode: modeChoice(value), automatic: [], floating: [], zoom: {},
  };
  return memory;
}
