---
name: agent-orchestration
description: "Design, run, or audit a multi-agent project with explicit dependencies, ephemeral subagent traces, independent review, recovery, and verified delivery. Use for complex cross-specialty work or when asked to design an orchestration structure; not for a single low-risk step."
---

# Agent Orchestration

This skill is an operational method, not an orchestration server. Installing it does not add a database, hooks, automatic dispatch, access controls, or a dashboard. Use only capabilities verified in the current environment.

## 1. Choose a mode and an owner

- **Design:** produce a validated plan and adapter map; do not imply agents launched.
- **Manual:** keep one durable run record; the coordinator enforces missing gates.
- **Instrumented:** use a task store with enforced transitions and a runtime adapter with proven execution-event capture.
- **Audit:** inspect an existing run; never silently upgrade legacy “done” records to verified.

Identify the accountable coordinator, one authoritative task store, available agents, actual execution tools/hooks, review capacity, approval boundaries, and side-effect risks. If a capability is absent, use a lower mode and label the gap. See [runtime adapters](references/runtime.md).

**Check:** mode, owner, authoritative store, and unsupported controls are written down.

## 2. Normalize the request

Record goal, scope, observable acceptance criteria, source reference, a separate request deduplication key, deadline if any, constraints, allowed side effects, required approvals, and evidence destination. A source message is provenance, not necessarily a unique intent. Ask only for a decision that cannot be inferred or deferred. Never infer approval from a successful tool call.

**Check:** each criterion can be verified; external actions and approval boundaries are explicit.

## 3. Build the dependency plan

Give each task one stable ID within the run, one accountable owner, bounded output, input versions, acceptance criteria, evidence location, hard dependencies, and reviewer. Add coordinator integration. For substantial risk, the reviewer must be independent of the producer. A combined role must be declared as a limitation, not disguised as independent review.

Validate unique IDs, existing dependencies, no cycle/self-edge, and coverage of the run criteria. Hard dependency means a predecessor's **current artifact version passed review**; “done” is insufficient. Use [the contract](references/contract.md) and [example](examples/product-page.md).

**Check:** no orphan/cycle and no downstream dispatch before its hard prerequisites pass.

## 4. Persist, then dispatch ready work

Persist the plan with a stable deduplication key before launch. Give ready tasks scope, inputs/versions, output format, permission limits, deadline, and return path. Record the dispatch attempt and distinguish requested, accepted, started, and finished. Verify the actual receipt/session/run ID and that the agent started. A card or spawn acceptance is not completion.

OpenClaw temporary/nested subagents are **executions of tasks**, not new permanent owners. Capture runtime run ID, child session key, parent session/execution, lifecycle, and outcome. When the runtime omits task ID, keep the trace unlinked until verified; never attach by title similarity. Follow [runtime correlation and reconciliation](references/runtime.md).

**Check:** every claimed active task has an actual execution receipt or a marked manual start.

## 5. Collect, review, and recover

Successful session exit is not artifact submission. The owner submits versioned artifacts, checks, and residual risks. An independent reviewer checks each criterion against that exact version, recording authenticated identity, decision, evidence, and time. The submitter cannot self-pass a required independent gate.

When upstream work changes, invalidate affected descendant reviews and the run-level integration seal. Unaffected siblings retain accepted reviews but are not integrated until the run is reintegrated. Blocked work needs cause, owner, and resume condition. For uncertain runtime or external side effects, inspect actual state before retrying; intentional cancellation is not a retry instruction.

**Check:** current artifact versions match passed reviews; unresolved/stale work cannot integrate.

## 6. Integrate, approve, deliver

The coordinator combines current accepted artifacts, resolves conflicts, runs focused end-to-end checks, and records input versions and evidence. Obtain required human approval before side effects. Verify live publication, delivery, payment, or deployment against a receipt; an accepted API request is not delivery.

**Check:** all required work passed review, integration is current, approvals exist, and final delivery is verified.

## 7. Report and preserve

Report outcome, evidence, residual risks, owner, and resume trigger. Distinguish planned, running, submitted, accepted, integrated, delivered, blocked, failed, and legacy-unverified. Preserve traces after temporary sessions disappear. In design mode, report what must be wired before execution.

**Check:** another coordinator can resume from the record without guessing.

## Bundled resources

- [Portable contract](references/contract.md): IDs, states, gates, evidence invariants.
- [Runtime adapters](references/runtime.md): OpenClaw hook/manual modes and recovery.
- [Classroom example](examples/product-page.md): fictional preview-only exercise.

These resources are inside this folder and remain valid when the skill is installed alone. The repository adds a validator, worked data, and optional visual demo.
