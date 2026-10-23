# OpenClaw Agent Orchestration Kit

총괄 에이전트가 전문 에이전트의 일을 나누고, 결과를 검수·통합·전달 확인하는 과정을 **재사용 가능한 스킬·설계·수업 자료·시각화 예시**로 정리한 키트입니다. 특정 사람 이름, 컴퓨터 경로, 채널 ID, 개인 데이터를 요구하지 않습니다.

> 중요한 구분: 스킬은 총괄 에이전트가 따라야 하는 **운영 절차**입니다. 그것만으로 트랜잭션 큐, 자동 DAG 잠금, 실행 재시도, 승인 시스템이 새로 설치되는 것은 아닙니다. 현재 실행 환경에 있는 작업 저장소와 에이전트 실행 도구에 연결해 사용합니다.

> 처음이라면 **[15분 퀵스타트(한국어)](docs/quickstart-ko.md)** → 4주차 과제 예제 **[내 팀으로 블로그 글 1편](examples/blog-post/README.md)**. 스킬은 `Lite`(원장 1장) 모드로 시작한다.

## 구성

- [스킬](skill/agent-orchestration/SKILL.md) — 모드 고르기(Lite/Design/Instrumented/Audit) → 작업 분해 → 실제 위임 → 독립 QA → 통합·전달 확인. Lite 는 [수동 원장 템플릿](skill/agent-orchestration/references/ledger-template.md) 하나로 운영.
- [구조 설계](docs/architecture.md) — 상태·데이터 계약·권한 경계·실패 복구·단계별 도입.
- [임시 서브에이전트 설계](docs/subagent-runtime.md) — OpenClaw 자식 세션·중첩 실행·검수·실패 복구를 작업 원장에 연결하는 계약. 현재 구현 완료를 뜻하지 않습니다.
- [4주차 과제 예제 · 블로그 글 1편](examples/blog-post/README.md) — 조사→초안·이미지 병렬→조립→독립 검수, 출처 링크 404 반려 1회 포함. 검증기 통과.
- [가상 실습 데이터 · 상품 상세페이지](examples/product-page/scenario.json) — 세 단계 스냅샷과 검증기.
- [수업 교안](docs/classroom-guide.md) — 진행 흐름, 시연, 과제, 평가 기준.
- [시각화 예시](dashboard/) — 프로젝트별 흐름 화면과 데이터 연결 가이드.

## 시작 경로

1. OpenClaw에서 사용할 총괄 에이전트와 전문 에이전트의 역할·권한을 정합니다. 전담 인원이 적으면 한 에이전트가 여러 역할을 맡아도 되지만, 고위험 작업은 독립 검수자를 확보합니다.
2. OpenClaw 연동을 원하면 저장소 루트에서 아래 명령으로 `skill/agent-orchestration` 폴더 **전체**를 복사합니다. 새 OpenClaw 세션에서 “agent-orchestration 스킬이 보이는지 알려줘”라고 물어 이름과 설명이 인식되는지 확인합니다. 오프라인 수업만 진행한다면 이 설치는 필요 없습니다.

```sh
git clone https://github.com/IrumHahn/openclaw-agent-orchestration-kit.git
openclaw skills install ./openclaw-agent-orchestration-kit/skill/agent-orchestration --as agent-orchestration --agent main
openclaw skills list | grep agent-orchestration    # ready 가 보이면 성공
```

(VPS 등 OpenClaw 가 설치된 곳의 터미널에서. `--agent main` 은 에이전트가 2명 이상이면 필수. 구버전에 `skills install` 이 없으면 `cp -R skill/agent-orchestration ~/.openclaw/skills/`.)

`references/`와 `examples/`를 함께 복사해야 독립 설치가 됩니다. 기존 같은 이름의 폴더가 있다면 덮어쓰기 전에 백업하고 차이를 확인하세요.
3. 한 개의 작업 원장(프로젝트/태스크 저장소)을 정합니다. OpenClaw 자체 세션·자동화 기록과 작업 카드가 다르면, 둘 중 무엇이 최종 상태의 권위 있는 기록인지 먼저 정합니다.
4. 총괄 에이전트에게 아래 요청을 전달합니다.

```text
이 목표를 agent-orchestration 스킬로 진행해줘.
목표: [완료하려는 결과]
완료 기준: [사용자가 직접 확인할 2~4가지]
기한: [없으면 비워 둠]
허용한 외부 행동: [예: 공개 게시 전에는 내 승인]
현재 팀과 작업 저장소를 확인하고, 역할별 작업·선행 관계·독립 검수·최종 통합 계획을 기록해.
작업 카드만 만들지 말고 담당자가 실제로 시작했는지, 제출물이 검수됐는지 확인해.
```

5. [가상 실습](examples/product-page/scenario.json)으로 먼저 전체 흐름을 연습합니다. 오프라인 경로는 Node.js와 브라우저만 필요합니다. OpenClaw 연동 경로는 위 스킬 설치와 현재 환경의 실행 도구를 추가로 확인합니다. 외부 발송이나 실제 고객 데이터를 사용하지 않습니다.

저장소 루트에서 `node scripts/validate-run.mjs examples/blog-post/scenario.json examples/product-page/scenario.json`과 `node --test scripts/validate-run.test.mjs dashboard/flow-model.test.mjs`로 샘플을 검증할 수 있습니다. 시각 데모는 `python3 -m http.server 8765` 실행 후 `http://localhost:8765/dashboard/demo.html`로 엽니다. 스킬만 복사한 설치에는 데모·검증기가 포함되지 않습니다.

운영 수준은 **설계 → 수동 원장 → 실제 위임 접수증 → 독립 QA/재작업 → 선택적 저장소·화면 연동 → 자동 제어면** 순서로 높입니다. 설치만으로 자동 DAG·OpenClaw 훅·검수 권한이 생겼다고 설명하지 않습니다.

## 상태의 뜻

`요청 접수 → 계획 → 전문 작업 실행 → 제출 → 독립 검수 → 총괄 통합 → 필요한 승인 → 실제 전달 확인`

- **제출**: 담당자가 작업을 끝냈다고 보고한 상태.
- **검수 통과**: 완료 기준과 증거를 독립적으로 확인한 상태.
- **통합 완료**: 총괄이 여러 결과를 결합하고 전체 동작을 확인한 상태.
- **전달 완료**: 사용자가 볼 수 있는 화면·메시지·게시물에 실제 반영되고 영수증/관찰로 확인된 상태. 수업 데모에는 해당하지 않습니다.

검수 증거가 없는 기존 작업 `done`은 자동으로 통합 완료로 승격하지 않습니다.

## 대시보드 연결

기존 작업방을 대체하지 말고 **프로젝트 흐름 보기**를 보조 뷰로 둡니다. 프로젝트에 명시적으로 연결된 작업만 보여주고, 작업 상태와 담당 영역을 별도 축으로 표시합니다. `dependsOn` 또는 검수 근거가 없으면 연결선과 초록색 ‘통과’를 그리지 않습니다. 읽기 전용으로 시작한 뒤 실제 데이터 모델·전이 검증이 준비되면 편집을 붙입니다. 자세한 기준은 [구조 설계](docs/architecture.md)를 참고하세요.

## 라이선스

`skill/`, `dashboard/`, `examples/`의 코드·스킬·샘플 데이터는 [MIT](LICENSE) 라이선스입니다. `docs/`와 README의 수업·설명 문서는 [CC BY 4.0](docs/LICENSE) 라이선스입니다. 수정·재배포 시 저작자 표시를 남겨 주세요.

## 범위와 안전성

이 키트는 샘플 코드/데이터만 포함합니다. 설치자의 토큰, 대화 기록, 고객 정보, 내부 URL을 수집하지 않습니다. 외부 전송·구매·배포의 재시도는 중복 여부를 먼저 확인해야 합니다. 별도 오케스트레이션 서버가 필요한 조직은 기존 작업방과 이중 원장을 만들지 말고 단일 권위 저장소를 선택해야 합니다.

## 수업 활용

60~90분 구성: 개념(15분) → 가상 프로젝트 데모(20분) → 수강생 역할 설정·실습(30분) → 반려/재작업·최종 통합(15분) → 회고(10분). 각 수강생은 자신이 쓰는 에이전트 이름과 도구를 매핑합니다. 완성 기준은 ‘에이전트 여러 명 사용’ 자체가 아니라 **업무 분담의 근거, 검수 증거, 최종 책임과 실제 전달**을 남기는 것입니다.
