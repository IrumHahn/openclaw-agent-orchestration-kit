---
name: agent-orchestration
description: "Design, run, or audit a multi-agent project with explicit dependencies, ephemeral subagent traces, independent review, recovery, and verified delivery. Use for complex cross-specialty work, when asked to design an orchestration structure, or when the user says 팀으로 프로젝트 진행해줘 / 역할 나눠서 해줘 / 검수까지 해서 완성해줘 / Lite 모드로 진행해줘. Not for a single low-risk step."
---

# Agent Orchestration

## 먼저 읽기 — 모드 고르기 (한국어 요약)

이 스킬은 **일하는 순서**이지 자동화 서버가 아니다. 설치해도 작업 큐·자동 배정·검수 게이트가 생기지 않는다. 사용자 환경에서 확인된 기능만 쓴다. 처음이면 **Lite** 로 시작한다.

| 모드 | 언제 | 기록 | 사용자에게 하는 말 |
|---|---|---|---|
| **Lite** (= Manual, 원장 1장) | 수강생·첫 프로젝트·팀 4명 이하 | [`references/ledger-template.md`](references/ledger-template.md) 를 `runs/<날짜>-<이름>.md` 로 복사해 채운다 | "원장을 만들었습니다. 작업표를 확인해 주세요." |
| Design | 실행 없이 구조만 | 작업표 + 연결해야 할 도구 목록 | "계획만 세웠고 에이전트는 시작하지 않았습니다." |
| Instrumented | 작업 저장소·훅이 검증된 환경 | JSON 런 레코드 + 검증기 | 실제로 검증된 기능만 주장 |
| Audit | 이미 돌아간 프로젝트 점검 | 기존 기록을 읽고 빠진 증거 표시 | 옛 "done" 을 통과로 승격하지 않는다 |

**Lite 절차 (5단계)**: ① 목표·완료 기준 2~4개·허용 범위를 원장 맨 위에 쓴다 → ② 작업표에 ID·담당·선행·검수자를 채우고 사용자 확인 → ③ 선행 없는 작업만 시작, 제출물에 **버전**을 붙여 검수자(담당과 다른 에이전트)에게 → ④ 기준별 통과/반려 + 근거 위치 기록, 반려면 새 버전, 그걸 쓴 하류는 stale → ⑤ 전부 통과하면 총괄이 통합·전체 점검, **발행·발송·결제는 사용자 승인 + 영수증 뒤에만 "전달 완료"**. 각 단계의 상세 규칙은 아래 영어 본문 1~7절과 같다. 예제: [`examples/blog-post`](../../examples/blog-post/README.md)(저장소), [`examples/product-page.md`](examples/product-page.md)(스킬 내).

---

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
- [Ledger template](references/ledger-template.md): one-table manual run record for Lite/Manual mode.
- [Classroom example](examples/product-page.md): fictional preview-only exercise.

These resources are inside this folder and remain valid when the skill is installed alone. The repository adds a validator, worked data, and optional visual demo.
