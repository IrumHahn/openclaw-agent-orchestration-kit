import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRun, validateScenario } from './validate-run.mjs';
const base=JSON.parse(readFileSync(new URL('../examples/product-page/sample-run.json',import.meta.url),'utf8'));
const copy=()=>structuredClone(base);
test('valid sample',()=>assert.deepEqual(validateRun(copy()),[]));
test('duplicate and cyclic dependencies rejected',()=>{const r=copy();r.tasks[1].dependsOn=['D'];r.tasks[3].dependsOn=['B'];assert.match(validateRun(r).join(' '),/cycle/);});
test('accepted without current review rejected',()=>{const r=copy();r.reviews=[];assert.match(validateRun(r).join(' '),/current passing review/);});
test('self review and absent evidence rejected',()=>{const r=copy();r.reviews[0].reviewerId='researcher';r.reviews[0].evidenceRefs=[];assert.match(validateRun(r).join(' '),/self-review/);});
test('duplicate runtime identity rejected',()=>{const r=copy();r.executions[1].runtimeRunId=r.executions[0].runtimeRunId;assert.match(validateRun(r).join(' '),/duplicate runtime identity/);});
test('unverified delivery rejected',()=>{const r=copy();r.state='delivered';assert.match(validateRun(r).join(' '),/delivery receipt/);});
test('changed predecessor invalidates dependent task',()=>{const r=copy();r.tasks[0].artifact.version='v2';assert.match(validateRun(r).join(' '),/current dependency not satisfied/);});
test('unlinked observed child is preserved',()=>{const r=copy();r.executions.push({executionId:'orphan-1',runtime:'openclaw',runtimeNamespace:'demo',childSessionKey:'unlinked-child',correlationConfidence:'unverified',state:'started'});assert.deepEqual(validateRun(r),[]);});
test('same child session with different runtime run ID is rejected',()=>{const r=copy();r.executions[1].childSessionKey=r.executions[0].childSessionKey;assert.match(validateRun(r).join(' '),/duplicate child session/);});
test('revoked review is not a current pass',()=>{const r=copy();r.reviews.push({...r.reviews[0],reviewId:'revocation',decision:'changes_requested',reviewedAt:'2026-01-01T01:00:00Z'});assert.match(validateRun(r).join(' '),/current passing review/);});
test('integration checks must prove each criterion',()=>{const r=copy();r.integration={decision:'pass',inputArtifactVersions:{},checks:[{criterion:'wrong',evidenceRef:''}]};assert.match(validateRun(r).join(' '),/criterion not proven/);});
test('delivery requires required approval',()=>{const r=copy();r.state='delivered';r.delivery={verifiedAt:'2026-01-01',receiptRef:'demo://receipt'};assert.match(validateRun(r).join(' '),/version-scoped authenticated approval/);});
test('approval status string alone cannot authorize delivery',()=>{const r=copy();r.state='delivered';r.delivery={verifiedAt:'2026-01-01',receiptRef:'demo://receipt'};r.approval.status='approved';assert.match(validateRun(r).join(' '),/version-scoped authenticated approval/);});
test('scenario refuses mutation of the same artifact version',()=>{const a=copy(),b=copy();b.tasks[0].artifact.location='demo://different';assert.match(validateScenario([{run:a},{run:b}]).join(' '),/immutable artifact changed/);});
test('review and integration cannot predate current evidence',()=>{const r=copy();r.reviews[0].reviewedAt='2025-12-31T23:00:00Z';assert.match(validateRun(r).join(' '),/review before artifact/);});

// 4주차 블로그 예제: 세 스냅샷이 모두 계약을 지키고, 반려 스냅샷은 철회된 B v1 을 통과로 보지 않는다.
const blog=JSON.parse(readFileSync(new URL('../examples/blog-post/scenario.json',import.meta.url),'utf8'));
test('blog-post example snapshots validate',()=>{for(const s of blog.snapshots)assert.deepEqual(validateRun(s.run),[],s.id);assert.deepEqual(validateScenario(blog.snapshots),[]);});
test('blog-post rework snapshot marks descendants stale after revoked review',()=>{const r=blog.snapshots[1].run;assert.equal(r.tasks.find(t=>t.taskId==='D').state,'stale');assert.equal(r.reviews.filter(x=>x.taskId==='B'&&x.artifactVersion==='v1').at(-1).decision,'changes_requested');});
test('blog-post integrated snapshot stops at approval, never delivered',()=>{const r=blog.snapshots[2].run;assert.equal(r.state,'awaiting_approval');assert.equal(r.delivery,null);assert.equal(r.integration.decision,'pass');});
