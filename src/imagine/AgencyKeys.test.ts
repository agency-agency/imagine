import { expect, test } from "bun:test";
import { Err, Ok } from "@cprussin/option-result";
import type { Domicile } from "@domicile-desktop/sdk/desktop/desktop";
import { listenAgencyCommands } from "./AgencyKeys";

test("numbered Imagine CLI requests are handled and acknowledged; stock requests pass through", async () => {
  const requests = [{sent: 4, words: ["agency", "size-preset", "width", "next"]}, {sent: 5, words: ["get-tree"]}];
  const replies: unknown[] = [], heard: unknown[] = [], forwarded: unknown[] = [];
  const stop = () => {};
  const shell = {
    commands: async (...args: unknown[]) => {forwarded.push(args); return Ok({stop, items: new ReadableStream({start(controller) {
      requests.forEach(item => controller.enqueue(item)); controller.close();
    }})});},
    answer: async (sent: number, result: unknown) => {replies.push({sent, result}); return Ok(undefined);},
  } as unknown as Domicile["shell"];
  const help = [{usage: "test", description: "Test"}];
  const result = await listenAgencyCommands(shell, words => {heard.push(words); return words[0] === "agency";}, help, []);
  const listening = result.match({Ok: value => value, Err: why => {throw Error(String(why));}});
  const passed = []; for await (const item of listening.items) passed.push(item);
  expect(passed).toEqual([requests[1]]);
  expect(heard).toEqual(requests.map(item => item.words));
  expect(replies).toEqual([{sent: 4, result: Ok("ran")}]);
  expect(forwarded).toEqual([[help, []]]);
  expect(listening.stop).toBe(stop);
});

test("a refused SDK listener remains a refusal", async () => {
  const shell = {commands: async () => Err("refused")} as unknown as Domicile["shell"];
  const result = await listenAgencyCommands(shell, () => {throw Error("must not handle");}, [], []);
  expect(result).toEqual(Err("refused"));
});
