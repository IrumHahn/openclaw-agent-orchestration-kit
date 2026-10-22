# Portable orchestration contract

This is a **logical contract**, not a claim that a skill install provides a database, hooks, authorization, or automatic scheduling. An implementation may use a spreadsheet, issue tracker, or transactional service. Name exactly one authoritative store per field; projections and dashboards must not become competing sources of truth.

## Identity and provenance

- Run: stable runId, projectId (or explicit standalone scope), sourceRef (where the request came from), requestDedupKey (one intent, separately defined), goal, acceptanceCriteria, coordinatorId, mode, state, createdAt, updatedAt, stateVersion.
- Task: unique (runId, taskId), one accountable ownerId, objective, bounded deliverables, acceptanceCriteria, dependsOn with hard/soft type, input artifact versions, state, stateVersion.
- Artifact: artifactId, taskId, immutable version or content digest, location, producerId, submittedAt, evidenceRefs, residualRisks.
- Review: reviewId, taskId, exact artifact versions, input versions, reviewerId, decision, criterion-by-criterion results, evidenceRefs, reviewedAt. An independent pass requires reviewerId != producerId and a verified actor identity.
- Integration: integrationId, runId, exact accepted artifact and input versions, checks and evidence, integratorId, decision, integratedAt. Any changed input invalidates the seal.
- Approval: approvalId, decision-maker identity, scope and exact version, decision, timestamp. Record only when required.
- Delivery: deliveryId, target, action idempotency key, attemptedAt, verifiedAt, receiptRef and status. A request acknowledgement is not proof of delivery.
- Execution: executionId, (runId, taskId) if verified, runtime, runtimeRunId and/or childSessionKey, parentExecutionId/sessionKey, attempt, permissionScope, state, timestamps, outcome, evidenceRefs, correlationConfidence. A temporary subagent is an execution, not a permanent task owner.
- Event: eventId, entity key, actor identity, type, occurredAt, observedAt, expectedStateVersion, idempotencyKey, payload digest. Keep an append-only audit trail where the store permits.

A sourceRef is provenance, not necessarily a unique request. A repeated message may contain a new intent; one request may arrive from several messages. Define requestDedupKey deliberately. Scope task IDs by run ID. Runtime IDs are not globally interchangeable; key them by runtime plus namespace/account.

## Invariants and transitions

1. Validate unique IDs, existing dependencies, no self-edge/cycle, criteria coverage, and explicit owner/reviewer before dispatch.
2. Hard dependency is satisfied only by a **current passed review** of the predecessor's exact artifact version. Soft dependencies are advisory and explicitly labeled.
3. Dispatch is recorded separately as requested, accepted, started, finished, and reconciled. A spawn receipt alone is not start evidence; runtime exit alone is not artifact submission.
4. Task progression: planned → ready → assigned → working → submitted → reviewing → accepted. Changes requested returns to working with a new version. Blocked, failed, cancelled require reason, owner, and resume condition. Integration and delivery are **run-level gates**, not synonyms for accepted tasks.
5. A task cannot be accepted without a submitted immutable artifact, passing per-criterion review, evidence, authenticated reviewer, and matching versions. Reviewer independence must be checked as an actor constraint, not a display name.
6. A changed artifact/input or revoked review marks affected descendants stale and invalidates affected integration. Reevaluate from the changed node; do not erase prior history.
7. Integrate only when all required current tasks are accepted. Delivery requires current integration, required approval for the exact version, and verified receipt. Preview-only exercises stop at integrated or awaiting approval.
8. Apply state transitions atomically with expectedStateVersion (or equivalent compare-and-swap) and idempotency key. Reject stale writes. If the store cannot enforce this, coordinator verifies manually and labels the run manual, not instrumented.
9. Legacy done without matching review/evidence remains legacy_unverified. Dashboard green pass comes from authoritative, version-matched review, not a text field saying passed.

## Failure and retry

Persist a dispatch intent before an automatic spawn when the adapter supports it; an after-the-fact observer may first see a child session and must mark provenance uncertain. Record late or out-of-order events idempotently, never by title similarity. Missing exit/receipt leads to reconciliation, not invented success. An unlinked execution stays unlinked until verified. A cancelled execution is not automatically retried. If external side effects may have occurred, inspect the target/receipt before retry; use provider idempotency keys when supported. Preserve both old and new attempts.

## Capability map

Before promising automation, mark each capability as enforced, manually operated, or unavailable: durable store, DAG gate, dispatch receipt, runtime lifecycle capture, authenticated review, version invalidation, approval, delivery verification, and recovery. The bundled [runtime adapter guide](runtime.md) gives concrete modes. The repository example and validator illustrate this contract but are not an orchestration service.
