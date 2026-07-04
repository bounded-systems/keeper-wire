# @bounded-systems/keeper-wire

The **pinned agreement** between `keeperd` (the git-signing door daemon in
[`door-keeper`](https://github.com/bounded-systems/door-keeper)) and its in-box
client (in [`door-kit`](https://github.com/bounded-systems/door-kit)) — a
**contract-only repo**.

## Why it's its own repo

The daemon *implements* this wire surface; the client *calls* it. If either owned
the contract, the two would depend on each other — a build cycle, and two
agreements across one pair (the wire + door-keeper's vendoring of door-kit). By
extracting the agreement here, **both** door-keeper and door-kit depend on
`keeper-wire`, not on each other:

```
     keeper-wire  (this repo — the agreement)
      ▲        ▲
 door-keeper  door-kit
 (implements) (calls)
```

That breaks the cycle *and* the one-agreement-per-pair violation the
[trellis](https://github.com/bounded-systems/trellis) lattice check flags — the
single move its `check/lattice.ts` prescribes.

## What's here

- **`mod.ts`** — the agreement, authored once as [`@bounded-systems/verbspec`](https://github.com/bounded-systems/verbspec)
  verbs: keeperd's 8 methods (`commit`, `push`, `import-and-push`,
  `attest-launch`, `sign`, `verify`, `status`, `getPublicKey`) with Zod
  input/output. The single source of truth both sides check against.
- **`manifest.json`** — the dependency-free projection (`deno task gen`) trellis
  reads for its offline conformance check.

## License

Source-available under **PolyForm Noncommercial 1.0.0**.
