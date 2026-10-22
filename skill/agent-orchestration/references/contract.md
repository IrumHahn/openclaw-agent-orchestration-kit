# Portable run contract

This schema is a planning and interoperability contract, not a claim that a particular dashboard already enforces every field.

- Run: `runId`, `projectId`, `sourceRef`, `goal`, `acceptanceCriteria[]`, `coordinatorAgentId`, `state`, `createdAt`, `updatedAt`.
- Agent: `agentId`, `displayName`, `capabilities[]`, `capacity`, `runnerRef`. Bind values per installation.
- Task: `taskId`, `runId`, `projectId`, `objective`, `ownerAgentId`, `workType`, `dependsOn[]`, `acceptanceCriteria[]`, `artifactRefs[]`, `state`, `holdReason?`, `resumeCondition?`, `executionRef?`.
- Review: `taskId`, `reviewerAgentId`, `artifactVersion`, `criteriaResults[]`, `decision` (pass/changes_requested), `evidenceRefs[]`.
- Integration: `inputArtifactVersions[]`, `checks[]`, `decision`, `deliveryReceipt?`, `rollbackRef?`.

Recommended task stages: planned → ready → assigned → working → submitted → reviewing → accepted → integrated. A review can request changes and return the task to working. Blocked/failed/cancelled require a reason and owner. “Submitted” is not “accepted”; “accepted” is not “integrated.” Map existing scheduled/confirmed/working/done boards conservatively: a legacy `done` with no review evidence remains unverified.

The coordinator verifies hard dependencies before dispatch. A task store without DAG enforcement must not dispatch all dependent tasks at once. Avoid automatic re-execution when a previous attempt may have sent a message, published content, purchased, or deployed. Store an idempotency key and delivery receipt where the runtime supports them.