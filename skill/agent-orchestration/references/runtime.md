# Runtime correlation and reconciliation

Temporary or nested agents may disappear from the live session list. Preserve their **execution history** in the authoritative run record. A session is evidence of execution; it does not own the task, approve its artifact, or deliver the run.

## Adapter modes

| Mode | Capture | Honest claim |
| --- | --- | --- |
| Hook/wrapper | Durable dispatch intent before spawn, then receipt, lifecycle and result events | Instrumented only if hook delivery, identity, replay and reconciliation are tested |
| Manual receipt | Coordinator persists plan and copies verified spawn/session receipts and results | Traceable manual run; missed children possible |
| Observer/import | Poll or import runtime history after launch | Partial/retrospective trace; no pre-spawn guarantee |
| Unavailable | No stable runtime identifiers | Record manual work only; do not claim child trace coverage |

An environment may mix modes per runtime. Verify actual event APIs, permissions, and retention before choosing a mode. Do not assume every OpenClaw version exposes the same hook.

## Correlation envelope

At dispatch, provide runId, taskId, executionId, attempt, parentExecutionId or parentSessionKey, scope, allowed side effects, output contract, and deadline **without credentials in prompt text**. Persist the intent before spawn if possible. On receipt, persist runtime namespace, runtimeRunId, childSessionKey, parent link, receivedAt and raw receipt reference. Key deduplication by runtime namespace + runtimeRunId or childSessionKey plus event type/event ID; executionId alone is not enough when missing or reused.

When a hook reports a child without a verified task ID, store it as unlinked with parent reference and correlationConfidence=unverified. Do not match by title, message text, timing alone, or a shared parent project. Manual linking requires checked child ID, parent, task scope and actor; record who linked it and why. Nested children keep both immediate parent and root run; they are not silently promoted to tasks.

## Event handling

- Accept duplicates idempotently. Keep occurredAt and observedAt separately. Late events may refine history but must not reverse a terminal state without an explicit correction event.
- Distinguish spawn requested, receipt accepted, observed started, exited success/failure/cancelled, result collected, artifact submitted, review passed/changes requested, integration, and verified delivery.
- A successful exit is only runtime outcome. The child may have returned no usable artifact.
- On missing receipt or apparent timeout, query runtime/session history once through a bounded reconciliation policy; mark unknown if unresolved. Do not blindly respawn.
- Compare active lease/heartbeat with runtime state. A session absent from a live list is not proof of failure; check retained history. An orphan is suspected until parent/child IDs and runtime status are reconciled.
- On restart, inspect prior effects and saved receipts before replaying an action. Preserve attempts and correction events. Intentional cancellation needs explicit new authorization/decision before a new attempt.
- When an external publish/send/purchase/deploy status is uncertain, inspect the destination or provider receipt and do not automatically retry.

## OpenClaw-specific mapping

An OpenClaw child session receipt can supply a child session key and sometimes runtime run ID. Preserve whichever verified IDs exist, the immediate parent session, and any completion notification/history reference. Runtime events may arrive after the parent turn or not at all. Use explicit session history/reconciliation to fill gaps. Do not interpret a child completion announcement as an independently reviewed artifact. The adapter must be validated against the installed OpenClaw version and exposed tools.

## Minimum test matrix

Prove duplicate and out-of-order events, spawn accepted without start, success without artifact, cancelled attempt, parent ending before child, nested child, two children without runtimeRunId, missed hook recovered from history, wrong-task linkage rejected, changed artifact invalidating review, and unknown external side effect blocking retry. If a capability is not testable, label it manual/unknown in the run.
