/**
 * @module
 * Project the keeper-wire VerbSpec (mod.ts — the pinned agreement) to a
 * dependency-free manifest.json that trellis's offline conformance check reads.
 * Regenerated from the spec, never hand-edited.
 *
 *   deno run --allow-read --allow-write gen.ts
 */

import { KEEPER_WIRE } from "./mod.ts";

const methods = Object.keys(KEEPER_WIRE);
const params: Record<string, string[]> = {};
for (const [id, verb] of Object.entries(KEEPER_WIRE)) {
  const shape = (verb.input as { shape?: Record<string, unknown> }).shape;
  params[id] = shape ? Object.keys(shape) : [];
}
if (import.meta.main) {
  const out = new URL("./manifest.json", import.meta.url).pathname;
  await Deno.writeTextFile(
    out,
    JSON.stringify({ type: "keeper-wire", methods, params }, null, 2) + "\n",
  );
  console.log(`wrote ${out}`);
}
