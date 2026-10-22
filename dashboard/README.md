# Project flow view: adapter contract

Use this view as a **read-only companion** to an existing task board. Do not infer dependencies or QA approvals from task titles, agent names, or completion counts.

## Inputs

- `projects[]`: `id`, `name`, optional `linkedTasks[]`, optional `blockers[]`, `updatedAt`.
- `tasks[]`: `id`, `projectId`, `title`, `assignee`, `assigneeName`, `workType`, `status`, `updatedAt`, optional `dependsOn[]`, optional `reviewDecision`, optional `integrationDecision`, optional `result`.
- `agents[]` (optional): stable `id`, display `name`, capability labels.

Merge project `linkedTasks` IDs with `task.projectId` only after validating each ID exists. Deduplicate by task ID. Orphaned links are “connection needs review,” not a reason to attach a task by title similarity. If no project-linked tasks exist, show an empty state.

## Presentation rules

1. Start with the project, its actual linked task count, current blockers, and last update.
2. Show responsibility lanes by `workType` if recorded. Missing `workType` is “unclassified,” never guessed from an agent's display name.
3. Show a dependency arrow only for a recorded `dependsOn` edge. If absent, use side-by-side grouping without a line and label dependencies “not recorded.”
4. A task `done` with no review evidence is “reported done / review not recorded.” A QA task `done` does not automatically pass a project QA gate.
5. A blocked task or explicit open project blocker is “confirmed blocked.” A long-unupdated active task is “needs status check,” not definitely failed.
6. Present the same facts in a one-column, keyboard-accessible layout on mobile. Color is supplementary to text.

## Implementation path

For a current dashboard, keep the existing board as the default and add a “Project flow” read-only view. Select a project, render the derived model, and let task cards deep-link back to the existing detail panel. Add editing only after the server enforces dependency, reviewer, permission, and version rules.