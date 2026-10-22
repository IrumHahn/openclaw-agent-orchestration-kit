import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
export function validateRun(run){
 const errors=[];const fail=(path,msg)=>errors.push(path+': '+msg);
 for(const k of ['runId','projectId','sourceRef','requestDedupKey','goal','coordinatorId','mode','state','createdAt','updatedAt'])if(!nonempty(run?.[k]))fail(k,'required');
 if(!Number.isInteger(run?.stateVersion)||run.stateVersion<1)fail('stateVersion','positive integer required');
 if(!Array.isArray(run?.acceptanceCriteria)||!run.acceptanceCriteria.length)fail('acceptanceCriteria','required');
 const tasks=Array.isArray(run?.tasks)?run.tasks:[];if(!tasks.length)fail('tasks','required');
 const map=new Map();
 for(const [i,t] of tasks.entries()){
  const path='tasks['+i+']';
  for(const k of ['taskId','ownerId','reviewerId','objective','state'])if(!nonempty(t?.[k]))fail(path+'.'+k,'required');
  if(map.has(t.taskId))fail(path+'.taskId','duplicate');map.set(t.taskId,t);
  if(!Array.isArray(t.dependsOn)||!Array.isArray(t.acceptanceCriteria)||!t.acceptanceCriteria.length)fail(path,'dependsOn and acceptanceCriteria required');
  if(!Number.isInteger(t.stateVersion)||t.stateVersion<1)fail(path+'.stateVersion','positive integer required');
 }
 const visiting=new Set(),visited=new Set();
 function walk(id){if(visiting.has(id)){fail('tasks','dependency cycle at '+id);return;}if(visited.has(id))return;visiting.add(id);
  for(const dep of map.get(id)?.dependsOn||[]){if(dep===id)fail('tasks.'+id,'self dependency');else if(!map.has(dep))fail('tasks.'+id,'missing dependency '+dep);else walk(dep);}visiting.delete(id);visited.add(id);}
 for(const id of map.keys())walk(id);
 const reviews=Array.isArray(run?.reviews)?run.reviews:[];const reviewIds=new Set();
 for(const [i,r] of reviews.entries()){
  const path='reviews['+i+']';if(reviewIds.has(r.reviewId))fail(path,'duplicate ID');reviewIds.add(r.reviewId);
  for(const k of ['reviewId','taskId','artifactVersion','reviewerId','decision','reviewedAt'])if(!nonempty(r[k]))fail(path+'.'+k,'required');
  const t=map.get(r.taskId);if(!t)fail(path+'.taskId','unknown');
  if(t?.artifact?.version===r.artifactVersion&&Date.parse(r.reviewedAt)<Date.parse(t.artifact.submittedAt))fail(path,'review before artifact submission');
  if(r.decision==='pass'){
   if(t&&r.reviewerId===t.ownerId)fail(path,'self-review');
   if(!Array.isArray(r.evidenceRefs)||!r.evidenceRefs.length)fail(path,'pass needs evidence');
   const results=Array.isArray(r.criteriaResults)?r.criteriaResults:[];
   for(const criterion of t?.acceptanceCriteria||[])if(!results.some(x=>x.criterion===criterion&&x.pass===true&&nonempty(x.evidenceRef)))fail(path,'criterion not proven: '+criterion);
  }
 }
 for(const t of tasks){
  if(['submitted','reviewing','accepted','stale'].includes(t.state)&&(!t.artifact||!nonempty(t.artifact.version)||!nonempty(t.artifact.location)))fail('tasks.'+t.taskId,'artifact required');
  if(t.artifact&&t.artifact.producerId!==t.ownerId)fail('tasks.'+t.taskId,'producer mismatch');
  const latestReview=reviews.filter(r=>r.taskId===t.taskId&&r.artifactVersion===t.artifact?.version).sort((a,b)=>String(a.reviewedAt).localeCompare(String(b.reviewedAt))).at(-1);
  if(t.state==='accepted'&&latestReview?.decision!=='pass')fail('tasks.'+t.taskId,'current passing review required');
  if(['working','submitted','reviewing','accepted'].includes(t.state))for(const dep of t.dependsOn||[]){const d=map.get(dep);if(!d||d.state!=='accepted'||t.inputVersions?.[dep]!==d.artifact?.version)fail('tasks.'+t.taskId,'current dependency not satisfied: '+dep);}
  if(['blocked','failed','cancelled'].includes(t.state)&&(!nonempty(t.holdReason)||!nonempty(t.resumeCondition)))fail('tasks.'+t.taskId,'reason and resume condition required');
 }
 const exIds=new Set(),runtimeRunIds=new Set(),sessionIds=new Set();
 for(const [i,e] of (run.executions||[]).entries()){
  const path='executions['+i+']';if(exIds.has(e.executionId))fail(path,'duplicate executionId');exIds.add(e.executionId);
  if(e.taskId!=null&&!map.has(e.taskId))fail(path+'.taskId','unknown task');
  if(e.taskId==null&&e.correlationConfidence!=='unverified')fail(path,'unlinked execution must be unverified');
  if(!nonempty(e.runtime)||!nonempty(e.runtimeNamespace)||!nonempty(e.executionId))fail(path,'runtime identity required');
  if(!e.runtimeRunId&&!e.childSessionKey)fail(path,'runtime ID or session key required');
  if(e.runtimeRunId){const rid=e.runtimeNamespace+'|'+e.runtimeRunId;if(runtimeRunIds.has(rid))fail(path,'duplicate runtime identity');runtimeRunIds.add(rid);}
  if(e.childSessionKey){const sid=e.runtimeNamespace+'|'+e.childSessionKey;if(sessionIds.has(sid))fail(path,'duplicate child session');sessionIds.add(sid);}
  if(e.state==='exited_success'&&!e.finishedAt)fail(path,'finish time required');
  if(e.finishedAt&&e.startedAt&&Date.parse(e.finishedAt)<Date.parse(e.startedAt))fail(path,'finish before start');
 }
 if(run.integration){
  const x=run.integration;if(x.decision==='pass'){
   if(tasks.some(t=>t.state!=='accepted'))fail('integration','all tasks must be accepted');
   for(const t of tasks)if(x.inputArtifactVersions?.[t.taskId]!==t.artifact?.version)fail('integration','stale input '+t.taskId);
   for(const criterion of run.acceptanceCriteria)if(!x.checks?.some(c=>c.criterion===criterion&&nonempty(c.evidenceRef)))fail('integration','criterion not proven: '+criterion);
   if(tasks.some(t=>Date.parse(x.integratedAt)<Date.parse(t.artifact?.submittedAt)))fail('integration','integration before artifact');
   if(reviews.some(r=>r.decision==='pass'&&tasks.some(t=>t.taskId===r.taskId&&t.artifact?.version===r.artifactVersion)&&Date.parse(x.integratedAt)<Date.parse(r.reviewedAt)))fail('integration','integration before review');
  }
 }
 if(run.state==='delivered'){
  if(!run.integration||run.integration.decision!=='pass'||!run.delivery?.verifiedAt||!run.delivery?.receiptRef)fail('delivery','verified integration and delivery receipt required');
  if(run.approval?.requiredFor){
   const a=run.approval;
   if(a.status!=='approved'||!nonempty(a.approvalId)||!nonempty(a.actorId)||!nonempty(a.approvedAt)||a.scope!==a.requiredFor||a.integrationId!==run.integration?.integrationId)fail('approval','version-scoped authenticated approval required for delivery');
  }
 }
 return errors;
}
export function validateScenario(snapshots){
 const errors=[],seen=new Map();
 for(const [i,s] of snapshots.entries())for(const t of s.run?.tasks||[]){
  const a=t.artifact;if(!a)continue;const key=s.run.runId+'|'+a.artifactId+'|'+a.version;
  const identity=JSON.stringify({location:a.location,submittedAt:a.submittedAt,evidenceRefs:a.evidenceRefs});
  if(seen.has(key)&&seen.get(key)!==identity)errors.push('snapshots['+i+']: immutable artifact changed '+key);
  else seen.set(key,identity);
 }
 return errors;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const files=process.argv.slice(2);if(!files.length)files.push('examples/product-page/sample-run.json');
 let failed=false;for(const file of files){const input=JSON.parse(readFileSync(file,'utf8'));const runs=input.snapshots?.map(s=>s.run)||[input];for(const [i,run] of runs.entries()){const errors=validateRun(run);if(errors.length){failed=true;console.error(file+'#'+i+' FAIL\n'+errors.join('\n'));}else console.log(file+'#'+i+' OK');}if(input.snapshots){const errors=validateScenario(input.snapshots);if(errors.length){failed=true;console.error(file+' scenario FAIL\n'+errors.join('\n'));}else console.log(file+' scenario OK');}}
 if(failed)process.exitCode=1;
}
