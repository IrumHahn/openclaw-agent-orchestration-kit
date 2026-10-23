// 4주차 과제 예제: "내 팀으로 블로그 글 1편" — 조사 A → 초안 B · 이미지 C 병렬 → 조립 D → 독립 검수 E → 통합.
// 반려 1회(출처 링크 깨짐)를 포함한다. 실제 발행은 하지 않고 '승인 대기'에서 끝난다.
// 실행: node examples/blog-post/build-scenarios.mjs  → scenario.json, sample-run.json 재생성
import { writeFileSync } from 'node:fs';
const time=min=>'2026-11-16T'+String(9+Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0')+':00Z';
const at=time(0);
const base={
 runId:'blog-run-001',projectId:'weekly-blog',sourceRef:'telegram://owner/2026-11-16/msg-12',requestDedupKey:'blog-2026-w46-ai-office',
 goal:'"내 AI 오피스 1주차 후기" 블로그 글 1편을 발행 승인 직전 상태까지 완성',mode:'manual',coordinatorId:'mira',state:'active',stateVersion:1,
 createdAt:at,updatedAt:at,
 acceptanceCriteria:['본문의 모든 수치·인용에 출처 링크가 있고 링크가 열린다','대표 이미지 1장 + 본문 이미지 2장이 1200px 기준으로 깨지지 않는다','네이버 블로그 에디터에 붙여넣은 미리보기에서 제목·소제목·이미지 순서가 맞다'],
 approval:{requiredFor:'publication',status:'not_requested'},delivery:null,integration:null,
 tasks:[
  {taskId:'A',ownerId:'researcher',reviewerId:'qa',objective:'주제 조사: 수강생 후기 3건·공식 문서 2건 인용 후보 수집',dependsOn:[],acceptanceCriteria:['인용 후보마다 URL·접속 확인 시각 기록'],state:'accepted',stateVersion:2,artifact:{artifactId:'sources',version:'v1',location:'canvas://blog/sources-v1.md',producerId:'researcher',submittedAt:at,evidenceRefs:['canvas://blog/sources-v1-linkcheck.txt'],residualRisks:[]},inputVersions:{}},
  {taskId:'B',ownerId:'writer',reviewerId:'qa',objective:'초안 작성 (1,500자, 소제목 4개)',dependsOn:['A'],acceptanceCriteria:['A 의 출처만 인용','소제목 4개·1,300~1,700자'],state:'working',stateVersion:1,artifact:null,inputVersions:{A:'v1'}},
  {taskId:'C',ownerId:'designer',reviewerId:'qa',objective:'대표 이미지 1 + 본문 이미지 2 제작',dependsOn:['A'],acceptanceCriteria:['1200px 폭에서 글자 깨짐 없음','출처가 필요한 이미지는 A 에 기록된 것만'],state:'working',stateVersion:1,artifact:null,inputVersions:{A:'v1'}},
  {taskId:'D',ownerId:'mira',reviewerId:'qa',objective:'글+이미지 조립, 네이버 에디터 미리보기 생성',dependsOn:['B','C'],acceptanceCriteria:['최신 B/C 버전 반영','미리보기 캡처 저장'],state:'planned',stateVersion:1,artifact:null,inputVersions:{}},
  {taskId:'E',ownerId:'qa',reviewerId:'codex-hand',objective:'독립 검수: 링크 전수 클릭·이미지·순서 확인',dependsOn:['D'],acceptanceCriteria:['3개 완료 기준 각각 증거 캡처'],state:'planned',stateVersion:1,artifact:null,inputVersions:{}}
 ],
 reviews:[{reviewId:'review-A-v1',taskId:'A',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'인용 후보마다 URL·접속 확인 시각 기록',pass:true,evidenceRef:'canvas://blog/sources-v1-linkcheck.txt'}],evidenceRefs:['canvas://blog/sources-v1-linkcheck.txt'],reviewedAt:at}],
 executions:[
  {executionId:'exec-B-1',taskId:'B',runtime:'openclaw',runtimeNamespace:'vps-main',runtimeRunId:'run-b-1',childSessionKey:'sess-writer-1',parentSessionKey:'sess-mira',attempt:1,state:'started',startedAt:time(2)},
  {executionId:'exec-C-1',taskId:'C',runtime:'openclaw',runtimeNamespace:'vps-main',runtimeRunId:'run-c-1',childSessionKey:'sess-designer-1',parentSessionKey:'sess-mira',attempt:1,state:'started',startedAt:time(2)}
 ]
};
const clone=x=>structuredClone(x);
const active=clone(base);

// 2단계: B/C 제출·검수 통과 → D 조립 → E 검수에서 "출처 링크 1개 404" 발견 → B v1 합격 철회, D/E stale
const rework=clone(base);rework.stateVersion=2;
for(const t of rework.tasks){
 if(t.taskId==='B'){t.state='working';t.stateVersion=3;t.artifact={artifactId:'draft',version:'v1',location:'canvas://blog/draft-v1.md',producerId:'writer',submittedAt:time(20),evidenceRefs:['canvas://blog/draft-v1-wordcount.txt'],residualRisks:['인용 3번 링크 응답 느림']};}
 if(t.taskId==='C'){t.state='accepted';t.artifact={artifactId:'images',version:'v1',location:'canvas://blog/images-v1/',producerId:'designer',submittedAt:time(25),evidenceRefs:['canvas://blog/images-v1-1200px.png'],residualRisks:[]};}
 if(t.taskId==='D'){t.state='stale';t.artifact={artifactId:'preview',version:'v1',location:'canvas://blog/preview-v1.png',producerId:'mira',submittedAt:time(40),evidenceRefs:['canvas://blog/preview-v1.png'],residualRisks:[]};t.inputVersions={B:'v1',C:'v1'};}
 if(t.taskId==='E'){t.state='stale';t.artifact={artifactId:'qa-report',version:'v1',location:'canvas://blog/qa-v1.md',producerId:'qa',submittedAt:time(55),evidenceRefs:['canvas://blog/qa-v1-link3-404.png'],residualRisks:['인용 3번 404']};t.inputVersions={D:'v1'};}
}
rework.reviews.push(
 {reviewId:'review-B-v1-initial',taskId:'B',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'A 의 출처만 인용',pass:true,evidenceRef:'canvas://blog/draft-v1-cites.txt'},{criterion:'소제목 4개·1,300~1,700자',pass:true,evidenceRef:'canvas://blog/draft-v1-wordcount.txt'}],evidenceRefs:['canvas://blog/draft-v1-cites.txt','canvas://blog/draft-v1-wordcount.txt'],reviewedAt:time(30)},
 {reviewId:'review-C-v1',taskId:'C',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'1200px 폭에서 글자 깨짐 없음',pass:true,evidenceRef:'canvas://blog/images-v1-1200px.png'},{criterion:'출처가 필요한 이미지는 A 에 기록된 것만',pass:true,evidenceRef:'canvas://blog/images-v1-sources.txt'}],evidenceRefs:['canvas://blog/images-v1-1200px.png','canvas://blog/images-v1-sources.txt'],reviewedAt:time(32)},
 {reviewId:'review-D-v1-initial',taskId:'D',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'최신 B/C 버전 반영',pass:true,evidenceRef:'canvas://blog/preview-v1.png'},{criterion:'미리보기 캡처 저장',pass:true,evidenceRef:'canvas://blog/preview-v1.png'}],evidenceRefs:['canvas://blog/preview-v1.png'],reviewedAt:time(45)},
 {reviewId:'review-B-v1-revoked',taskId:'B',artifactVersion:'v1',reviewerId:'qa',decision:'changes_requested',criteriaResults:[{criterion:'A 의 출처만 인용',pass:false,evidenceRef:'canvas://blog/qa-v1-link3-404.png'}],evidenceRefs:['canvas://blog/qa-v1-link3-404.png'],reviewedAt:time(58)});
rework.executions[0].state='exited_success';rework.executions[0].finishedAt=time(20);
rework.executions[1].state='exited_success';rework.executions[1].finishedAt=time(25);
rework.executions.push({executionId:'exec-D-1',taskId:'D',runtime:'manual',runtimeNamespace:'vps-main',childSessionKey:'mira-assemble-1',attempt:1,state:'exited_success',startedAt:time(33),finishedAt:time(40)});
rework.history=[{type:'review_passed',ref:'review-B-v1-initial'},{type:'review_passed',ref:'review-C-v1'},{type:'downstream_started',ref:'exec-D-1'},{type:'review_passed',ref:'review-D-v1-initial'},{type:'defect_found',ref:'canvas://blog/qa-v1-link3-404.png'},{type:'review_revoked',ref:'review-B-v1-revoked'},{type:'downstream_stale',refs:['D','E']}];

// 3단계: B v2(인용 3번을 A 의 다른 출처로 교체) → D v2 → E v2 → 통합. 발행은 승인 대기.
const integrated=clone(rework);integrated.state='awaiting_approval';integrated.stateVersion=3;
const submit={B:70,D:85,E:100};const review={B:78,D:92,E:108};
for(const t of integrated.tasks){
 t.state='accepted';t.stateVersion=4;
 if(t.taskId==='A'||t.taskId==='C')continue;
 const version='v2';
 const id={B:'draft',D:'preview',E:'qa-report'}[t.taskId];
 t.artifact={artifactId:id,version,location:`canvas://blog/${id}-${version}${t.taskId==='D'?'.png':'.md'}`,producerId:t.ownerId,submittedAt:time(submit[t.taskId]),evidenceRefs:[`canvas://blog/${id}-${version}-evidence`],residualRisks:[]};
 t.inputVersions={B:{A:'v1'},D:{B:'v2',C:'v1'},E:{D:'v2'}}[t.taskId];
 integrated.reviews.push({reviewId:`review-${t.taskId}-${version}`,taskId:t.taskId,artifactVersion:version,reviewerId:t.reviewerId,decision:'pass',criteriaResults:t.acceptanceCriteria.map(criterion=>({criterion,pass:true,evidenceRef:`canvas://blog/${id}-${version}-evidence`})),evidenceRefs:[`canvas://blog/${id}-${version}-evidence`],reviewedAt:time(review[t.taskId])});
}
integrated.executions.push({executionId:'exec-B-2',taskId:'B',runtime:'openclaw',runtimeNamespace:'vps-main',runtimeRunId:'run-b-2',childSessionKey:'sess-writer-2',parentSessionKey:'sess-mira',attempt:2,state:'exited_success',startedAt:time(60),finishedAt:time(70)});
integrated.history.push({type:'rework_submitted',ref:'B-v2'},{type:'descendants_rebuilt',refs:['D-v2','E-v2']},{type:'integrated',ref:'integration-v2'});
integrated.integration={integrationId:'integration-v2',integratorId:'mira',decision:'pass',inputArtifactVersions:Object.fromEntries(integrated.tasks.map(t=>[t.taskId,t.artifact.version])),checks:integrated.acceptanceCriteria.map((criterion,i)=>({criterion,evidenceRef:`canvas://blog/integrated-check-${i+1}.png`})),integratedAt:time(115)};
integrated.approval={requiredFor:'publication',status:'requested',requestedAt:time(116),note:'사용자가 네이버 블로그 발행 버튼을 직접 누른다. 에이전트는 누르지 않는다.'};

const snapshots=[
 {id:'active',label:'A 조사 검수 후 B 초안 · C 이미지 병렬 시작',run:active},
 {id:'rework',label:'E 검수에서 출처 링크 404 발견 → B 반려, D/E 무효화',run:rework},
 {id:'integrated',label:'B v2 재작성 → D/E 재검수 → 통합, 발행 승인 대기',run:integrated}
];
writeFileSync(new URL('./scenario.json',import.meta.url),JSON.stringify({schemaVersion:1,snapshots},null,2)+'\n');
writeFileSync(new URL('./sample-run.json',import.meta.url),JSON.stringify(active,null,2)+'\n');
