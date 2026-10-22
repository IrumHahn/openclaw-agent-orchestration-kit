# JSON 기반 읽기 전용 실습 데모

저장소 루트에서 python3 -m http.server 8765 실행 후 http://localhost:8765/dashboard/demo.html 로 연다. 화면은 examples/product-page/scenario.json의 세 스냅샷을 직접 읽는다. 파일 URL에서 fetch가 차단되면 HTTP 서버를 사용한다.

기존 서비스용 flow-model.mjs는 프로젝트·작업의 명시적 연결만 표시한다. 자유형 passed/evidenceRef와 호출자가 넘긴 verified 플래그는 검증된 게이트가 아니라 recorded_claim으로 표시한다. 운영에서 녹색 통과를 원한다면 서버가 실제 최신 검수·행위자·산출물 버전을 검증한 별도 projection을 제공해야 한다. 이 데모 자체는 읽기 전용이며 자동 디스패치/QA 서버가 아니다.
