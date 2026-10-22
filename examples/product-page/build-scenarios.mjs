import { writeFileSync } from 'node:fs';
const at='2026-01-01T00:00:00Z';
const time=min=>'2026-01-01T'+String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0')+':00Z';
const base={
 runId:'demo-run-001',projectId:'demo-product-page',sourceRef:'classroom://lesson-1/request-1',requestDedupKey:'demo-intent-001',
 goal:'가상 상품 상세페이지 미리보기 검증',mode:'manual',coordinatorId:'coordinator',state:'active',stateVersion:1,
 createdAt:at,updatedAt:at,acceptanceCriteria:['가상 가격·주장 근거 일치','320px 화면 가독성','미리보기 링크 확인'],
 approval:{requiredFor:'publication',status:'not_requested'},delivery:null,integration:null,
 tasks:[
  {taskId:'A',ownerId:'researcher',reviewerId:'qa',objective:'가상 제품 사실 조사',dependsOn:[],acceptanceCriteria:['가격과 주장 근거 기록'],state:'accepted',stateVersion:2,artifact:{artifactId:'facts',version:'v1',location:'demo://facts-v1',producerId:'researcher',submittedAt:at,evidenceRefs:['demo://source-a'],residualRisks:[]},inputVersions:{}},
  {taskId:'B',ownerId:'writer',reviewerId:'qa',objective:'상세 문구',dependsOn:['A'],acceptanceCriteria:['가격·주장이 A 근거와 일치'],state:'working',stateVersion:1,artifact:null,inputVersions:{A:'v1'}},
  {taskId:'C',ownerId:'designer',reviewerId:'qa',objective:'320px 디자인',dependsOn:['A'],acceptanceCriteria:['320px 가독성 확인'],state:'working',stateVersion:1,artifact:null,inputVersions:{A:'v1'}},
  {taskId:'D',ownerId:'builder',reviewerId:'qa',objective:'미리보기 조립',dependsOn:['B','C'],acceptanceCriteria:['최신 B/C 반영'],state:'planned',stateVersion:1,artifact:null,inputVersions:{}},
  {taskId:'E',ownerId:'tester',reviewerId:'qa',objective:'독립 기능 점검',dependsOn:['D'],acceptanceCriteria:['가격·모바일·링크 확인'],state:'planned',stateVersion:1,artifact:null,inputVersions:{}}
 ],
 reviews:[{reviewId:'review-A-v1',taskId:'A',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'가격과 주장 근거 기록',pass:true,evidenceRef:'demo://review-a'}],evidenceRefs:['demo://review-a'],reviewedAt:at}],
 executions:[
  {executionId:'exec-B-1',taskId:'B',runtime:'openclaw',runtimeNamespace:'demo',runtimeRunId:'child-run-B',childSessionKey:'child-session-B',parentSessionKey:'coordinator-session',attempt:1,state:'started',startedAt:time(1)},
  {executionId:'exec-C-1',taskId:'C',runtime:'openclaw',runtimeNamespace:'demo',runtimeRunId:'child-run-C',childSessionKey:'child-session-C',parentSessionKey:'coordinator-session',attempt:1,state:'started',startedAt:time(1)}
 ]
};
const clone=x=>structuredClone(x);
const active=clone(base);
const rework=clone(base);rework.stateVersion=2;
for(const t of rework.tasks){
 if(t.taskId==='B'){t.state='working';t.stateVersion=3;t.artifact={artifactId:'copy',version:'v1',location:'demo://copy-v1',producerId:'writer',submittedAt:time(5),evidenceRefs:['demo://copy-check-v1'],residualRisks:['가격 불일치']};}
 if(t.taskId==='C'){t.state='accepted';t.artifact={artifactId:'design',version:'v1',location:'demo://design-v1',producerId:'designer',submittedAt:time(5),evidenceRefs:['demo://mobile-check'],residualRisks:[]};}
 if(t.taskId==='D'){t.state='stale';t.artifact={artifactId:'preview',version:'v1',location:'demo://preview-v1',producerId:'builder',submittedAt:time(15),evidenceRefs:['demo://build-v1'],residualRisks:[]};t.inputVersions={B:'v1',C:'v1'};}
 if(t.taskId==='E'){t.state='stale';t.artifact={artifactId:'qa-report',version:'v1',location:'demo://qa-v1',producerId:'tester',submittedAt:time(25),evidenceRefs:['demo://price-mismatch'],residualRisks:['가격 충돌']};t.inputVersions={D:'v1'};}
}
rework.reviews.push(
 {reviewId:'review-B-v1-initial',taskId:'B',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'가격·주장이 A 근거와 일치',pass:true,evidenceRef:'demo://initial-check'}],evidenceRefs:['demo://initial-check'],reviewedAt:'2026-01-01T00:10:00Z'},
 {reviewId:'review-C-v1',taskId:'C',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'320px 가독성 확인',pass:true,evidenceRef:'demo://mobile-check'}],evidenceRefs:['demo://mobile-check'],reviewedAt:time(10)});
rework.reviews.push({reviewId:'review-D-v1-initial',taskId:'D',artifactVersion:'v1',reviewerId:'qa',decision:'pass',criteriaResults:[{criterion:'최신 B/C 반영',pass:true,evidenceRef:'demo://build-v1'}],evidenceRefs:['demo://build-v1'],reviewedAt:'2026-01-01T00:20:00Z'});
rework.reviews.push({reviewId:'review-B-v1-revoked',taskId:'B',artifactVersion:'v1',reviewerId:'qa',decision:'changes_requested',criteriaResults:[{criterion:'가격·주장이 A 근거와 일치',pass:false,evidenceRef:'demo://price-mismatch'}],evidenceRefs:['demo://price-mismatch'],reviewedAt:'2026-01-01T00:30:00Z'});
rework.executions[0].state='exited_success';rework.executions[0].finishedAt=time(5);
rework.executions[1].state='exited_success';rework.executions[1].finishedAt=time(5);
rework.executions.push({executionId:'exec-D-1',taskId:'D',runtime:'manual',runtimeNamespace:'demo',childSessionKey:'builder-attempt-1',attempt:1,state:'exited_success',startedAt:time(11),finishedAt:time(15)});
rework.history=[{type:'review_passed',ref:'review-B-v1-initial'},{type:'review_passed',ref:'review-C-v1'},{type:'downstream_started',ref:'exec-D-1'},{type:'review_passed',ref:'review-D-v1-initial'},{type:'defect_found',ref:'demo://price-mismatch'},{type:'review_revoked',ref:'review-B-v1-revoked'},{type:'downstream_stale',refs:['D','E']}];
const integrated=clone(rework);integrated.state='awaiting_approval';integrated.stateVersion=3;
for(const t of integrated.tasks){
 t.state='accepted';t.stateVersion=4;
 if(t.taskId!=='A'){
 const version=t.taskId==='C'?'v1':'v2';
 t.artifact=t.taskId==='C'?clone(rework.tasks.find(x=>x.taskId==='C').artifact):{artifactId:{B:'copy',D:'preview',E:'qa-report'}[t.taskId],version,location:'demo://'+t.taskId.toLowerCase()+'-'+version,producerId:t.ownerId,submittedAt:time({B:40,D:50,E:56}[t.taskId]),evidenceRefs:['demo://evidence-'+t.taskId.toLowerCase()+'-'+version],residualRisks:[]};
 t.inputVersions={B:{A:'v1'},C:{A:'v1'},D:{B:'v2',C:'v1'},E:{D:'v2'}}[t.taskId];
 if(!(t.taskId==='C'&&version==='v1'))integrated.reviews.push({reviewId:'review-'+t.taskId+'-'+version,taskId:t.taskId,artifactVersion:version,reviewerId:'qa',decision:'pass',criteriaResults:t.acceptanceCriteria.map(criterion=>({criterion,pass:true,evidenceRef:'demo://evidence-'+t.taskId.toLowerCase()+'-'+version})),evidenceRefs:['demo://evidence-'+t.taskId.toLowerCase()+'-'+version],reviewedAt:time({B:45,D:55,E:60}[t.taskId])});
 }
}
integrated.executions.push({executionId:'exec-B-2',taskId:'B',runtime:'openclaw',runtimeNamespace:'demo',runtimeRunId:'child-run-B-2',childSessionKey:'child-session-B-2',parentSessionKey:'coordinator-session',attempt:2,state:'exited_success',startedAt:time(35),finishedAt:time(40)});
integrated.history.push({type:'rework_submitted',ref:'B-v2'},{type:'descendants_rebuilt',refs:['D-v2','E-v2']},{type:'integrated',ref:'integration-v2'});
integrated.integration={integrationId:'integration-v2',integratorId:'coordinator',decision:'pass',inputArtifactVersions:Object.fromEntries(integrated.tasks.map(t=>[t.taskId,t.artifact.version])),checks:[{criterion:'가상 가격·주장 근거 일치',evidenceRef:'demo://integrated-price'},{criterion:'320px 화면 가독성',evidenceRef:'demo://integrated-mobile'},{criterion:'미리보기 링크 확인',evidenceRef:'demo://integrated-links'}],integratedAt:time(65)};
const snapshots=[{id:'active',label:'A 검수 후 B/C 병렬 실행',run:active},{id:'rework',label:'가격 오류 반려·하류 무효화',run:rework},{id:'integrated',label:'재검수·미리보기 통합',run:integrated}];
writeFileSync(new URL('./scenario.json',import.meta.url),JSON.stringify({schemaVersion:1,snapshots},null,2)+'\n');
writeFileSync(new URL('./sample-run.json',import.meta.url),JSON.stringify(active,null,2)+'\n');
