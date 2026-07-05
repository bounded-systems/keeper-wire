/**
 * @module
 * @bounded-systems/keeper-wire — the pinned agreement between keeperd (door-keeper)
 * and its in-box client (door-kit), authored once as VerbSpec verbs. Both sides
 * depend on THIS, not each other. Regenerate manifest.json with `deno task gen`.
 */

import { z } from "zod";
import { defineVerb, type VerbSpec } from "verbspec";

const AuthorshipSchema = z.object({
  model: z.string().optional(),
  aiAuthored: z.array(z.string()).optional(),
});

const AttestationSchema = z.object({
  statement: z.unknown().optional(),
  statementDigest: z.string(),
  signature: z.string(),
  keyId: z.string(),
});

// ── commit ───────────────────────────────────────────────────────────────────

const CommitInput = z.object({
  repo: z.string(),
  message: z.string(),
  author: z.string().optional(),
  files: z.array(z.string()).optional(),
  all: z.boolean().default(false),
  amend: z.boolean().default(false),
  authorship: AuthorshipSchema.optional(),
});
const CommitOutput = z.object({
  commit: z.string(),
  attestation: AttestationSchema.optional(),
});
const commit: VerbSpec<typeof CommitInput, typeof CommitOutput> = defineVerb({
  id: "commit",
  summary: "Create a signed commit via keeperd (the box holds no keys).",
  actor: "keeper",
  input: CommitInput,
  output: CommitOutput,
  run: () => ({ commit: "" }),
});

// ── push ─────────────────────────────────────────────────────────────────────

const PushInput = z.object({
  repo: z.string(),
  remote: z.string().default("origin"),
  branch: z.string().optional(),
  force: z.boolean().default(false),
  setUpstream: z.boolean().default(false),
});
const PushOutput = z.object({
  pushed: z.string(),
  commits: z.array(z.string()),
});
const push: VerbSpec<typeof PushInput, typeof PushOutput> = defineVerb({
  id: "push",
  summary: "Push to a remote via keeperd (the box holds no SSH keys).",
  actor: "keeper",
  input: PushInput,
  output: PushOutput,
  run: () => ({ pushed: "", commits: [] }),
});

// ── import-and-push ────────────────────────────────────────────────────────────
// The wire input is exactly what the in-box client sends. `manifestDigest` is
// NOT a wire param: keeperd computes it itself as sha256(CLAUDE_BOX_CAPABILITIES)
// from the box's environment. `ledgerRef` is the opt-in attestation output ref
// (keeperd emits a signed push/v1 derivation there) — a real, documented param.
const ImportAndPushInput = z.object({
  repo: z.string(),
  bundleBase64: z.string(),
  commitSha: z.string(),
  branch: z.string(),
  remote: z.string(),
  pushArgs: z.array(z.string()).optional(),
  ledgerRef: z.string().optional(),
  notesRef: z.string().optional(),
  l2LaunchDigest: z.string().optional(),
});
const ImportAndPushOutput = z.union([
  z.object({
    status: z.literal("ok"),
    commitSha: z.string(),
    pushedRef: z.string(),
    signedDerivation: z.unknown().optional(),
    note: z.object({
      ref: z.string(),
      written: z.boolean(),
      pushed: z.boolean(),
    }).optional(),
  }),
  z.object({
    status: z.literal("error"),
    code: z.string(),
    message: z.string(),
    exitCode: z.number().optional(),
  }),
]);
const importAndPush: VerbSpec<
  typeof ImportAndPushInput,
  typeof ImportAndPushOutput
> = defineVerb({
  id: "import-and-push",
  summary:
    "Import a host-built commit bundle and signed-push it (daemon holds only the push credential + key).",
  actor: "keeper",
  input: ImportAndPushInput,
  output: ImportAndPushOutput,
  run: () => ({ status: "ok" as const, commitSha: "", pushedRef: "" }),
});

// ── pr ───────────────────────────────────────────────────────────────────────
// The next rung after `push`/`import-and-push`: open the PR. keeperd leases a
// scoped, short-lived GitHub App installation token from prx's forge-d
// (host-to-host), calls POST /repos/{owner}/{repo}/pulls, then discards it. The
// box never holds a token — no credential field appears anywhere in this schema,
// which is the structural point.

const PrInput = z.object({
  repo: z.string(),
  head: z.string(),
  base: z.string().default("main"),
  title: z.string(),
  body: z.string().optional(),
});
const PrOutput = z.object({
  number: z.number(),
  url: z.string(),
});
const pr: VerbSpec<typeof PrInput, typeof PrOutput> = defineVerb({
  id: "pr",
  summary:
    "Open a GitHub PR via keeperd (leases a scoped token from forge-d; the box never holds one).",
  actor: "keeper",
  input: PrInput,
  output: PrOutput,
  run: () => ({ number: 0, url: "" }),
});

// ── attest-launch ──────────────────────────────────────────────────────────────

const AttestLaunchInput = z.object({
  subject: z.string(),
  manifest: z.unknown(),
});
const AttestLaunchOutput = z.union([
  z.object({
    status: z.literal("ok"),
    subject: z.string(),
    manifestDigest: z.string(),
    l2LaunchDigest: z.string(),
    attestation: z.unknown(),
  }),
  z.object({
    status: z.literal("error"),
    code: z.string(),
    message: z.string(),
  }),
]);
const attestLaunch: VerbSpec<
  typeof AttestLaunchInput,
  typeof AttestLaunchOutput
> = defineVerb({
  id: "attest-launch",
  summary:
    "Produce a signed L2 launch attestation over a room + the doors it holds.",
  actor: "keeper",
  input: AttestLaunchInput,
  output: AttestLaunchOutput,
  run: () => ({
    status: "error" as const,
    code: "UNIMPLEMENTED",
    message: "spec stub",
  }),
});

// ── sign ───────────────────────────────────────────────────────────────────────

const SignInput = z.object({ data: z.string() });
const SignOutput = z.object({ signature: z.string(), keyId: z.string() });
const sign: VerbSpec<typeof SignInput, typeof SignOutput> = defineVerb({
  id: "sign",
  summary: "Sign arbitrary (base64) data via keeperd.",
  actor: "keeper",
  input: SignInput,
  output: SignOutput,
  run: () => ({ signature: "", keyId: "" }),
});

// ── verify ─────────────────────────────────────────────────────────────────────

const VerifyInput = z.object({
  data: z.string(),
  signature: z.string(),
  publicKey: z.string().optional(),
});
const VerifyOutput = z.object({
  valid: z.boolean(),
  keyId: z.string().optional(),
});
const verify: VerbSpec<typeof VerifyInput, typeof VerifyOutput> = defineVerb({
  id: "verify",
  summary: "Verify a signature via keeperd.",
  actor: "keeper",
  input: VerifyInput,
  output: VerifyOutput,
  run: () => ({ valid: false }),
});

// ── status ─────────────────────────────────────────────────────────────────────

const StatusInput = z.object({});
const StatusOutput = z.object({
  version: z.string(),
  uptime: z.number(),
  signing: z.object({ enabled: z.boolean(), keyId: z.string().optional() }),
});
const status: VerbSpec<typeof StatusInput, typeof StatusOutput> = defineVerb({
  id: "status",
  summary: "keeperd health/status.",
  actor: "keeper",
  input: StatusInput,
  output: StatusOutput,
  run: () => ({ version: "", uptime: 0, signing: { enabled: false } }),
});

// ── getPublicKey ────────────────────────────────────────────────────────────────

const GetPublicKeyInput = z.object({});
const GetPublicKeyOutput = z.object({
  publicKey: z.string(),
  keyId: z.string(),
});
const getPublicKey: VerbSpec<
  typeof GetPublicKeyInput,
  typeof GetPublicKeyOutput
> = defineVerb({
  id: "getPublicKey",
  summary: "Return keeperd's signing public key.",
  actor: "keeper",
  input: GetPublicKeyInput,
  output: GetPublicKeyOutput,
  run: () => ({ publicKey: "", keyId: "" }),
});

/**
 * The `keeper-wire` method surface. The keys are the canonical wire method
 * strings; `check/keeper-wire.ts` asserts both keeperd's METHODS table and the
 * door-kit client present exactly this set, with matching param names.
 */
export const KEEPER_WIRE: Record<string, VerbSpec> = {
  "commit": commit,
  "push": push,
  "import-and-push": importAndPush,
  "pr": pr,
  "attest-launch": attestLaunch,
  "sign": sign,
  "verify": verify,
  "status": status,
  "getPublicKey": getPublicKey,
};
