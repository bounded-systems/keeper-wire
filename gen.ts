/**
 * @module
 * Project the keeper-wire VerbSpec (mod.ts) to the dependency-free manifest.json
 * trellis's offline check reads. Uses the ONE canonical projection from
 * @bounded-systems/trellis-kit, so every wire repo derives its manifest
 * identically (0.3.0 accepts a VerbSpec registry directly — no cast).
 *
 *   deno run --allow-read --allow-write gen.ts
 */

import { projectVerbSpec } from "@bounded-systems/trellis-kit";
import { KEEPER_WIRE } from "./mod.ts";

if (import.meta.main) {
  const out = new URL("./manifest.json", import.meta.url).pathname;
  await Deno.writeTextFile(
    out,
    JSON.stringify(projectVerbSpec("keeper-wire", KEEPER_WIRE), null, 2) + "\n",
  );
  console.log(`wrote ${out}`);
}
