---
name: "agent-orchestration"
description: "Coordinate complex multi-agent projects with task dependencies, independent QA, integration, and verifiable delivery."
---

# Agent Orchestration

## Procedure

1. **Classify the request.** Use this workflow when the outcome needs at least two specialties, crosses data/API/UI or systems, or merits independent verification. Handle a single low-risk step directly. State the goal, acceptance criteria, deadline, allowed side effects, and the user's approval boundaries; confirm each is recorded before dispatch.

2. **Bind the local environment.** Read the current workspace instructions and inspect available agents, task/project store, and execution tools. Assign the coordinator role to the current accountable agent; map specialties to available agents by capability and load. Keep names, paths, IDs, and channels in local configuration, never in the portable plan. Select one authoritative task store; confirm that every task has a stable project/run link.

3. **Draft a dependency plan.** Give each task one owner, a bounded deliverable, acceptance criteria, evidence location, and upstream dependencies. Include an independent review task when errors could mislead users or affect production, plus a coordinator integration task. Write the dependency order and the definition of “done”; verify there is no cycle or orphan.

4. **Dispatch ready work.** Create project-linked tasks with source-message metadata and idempotency keys where the store supports them. Dispatch only tasks whose hard prerequisites are satisfied; if the store has no dependency gate, hold downstream dispatch in the coordinator workflow. Verify the agent accepted and started; a task card or project timeline entry alone is not execution. For OpenClaw temporary or nested subagents, record the parent task and session, the spawn `runId`/`childSessionKey`, and the actual completion separately; consult [the runtime design](../../docs/subagent-runtime.md). An accepted spawn is not completed work.

5. **Collect and review evidence.** Treat an agent's completion claim as a submission, not final acceptance. Check artifacts and concrete verification against acceptance criteria. Assign an independent reviewer for the relevant risk. Record pass, requested changes, or a blocker with owner and resume condition. If an upstream artifact changes, recheck downstream conclusions that depended on it.

6. **Integrate and release.** The coordinator combines accepted outputs, resolves conflicts, runs the smallest meaningful end-to-end verification, and checks that the user-visible surface or scheduled delivery actually works. Before retrying an external side effect, inspect whether it already happened to avoid duplicates. Obtain user approval only where a real boundary requires it. Mark the project complete only after integration and required delivery verification.

7. **Report and preserve state.** Provide the user a concise outcome, named remaining risks, and links to artifacts. Persist project decisions, evidence, task ownership, blockers, and the next check in the chosen store. Make the dashboard distinguish planned, running, submitted, reviewed, integrated, blocked, and legacy/unverified records. Confirm the next owner and resume trigger before ending an unfinished run.

For the portable run/task fields and state definitions, use [references/contract.md](references/contract.md). For a reusable classroom example, use [examples/product-page.md](examples/product-page.md).
