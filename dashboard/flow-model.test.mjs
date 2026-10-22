import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveProjectFlow } from './flow-model.mjs';

test('deduplicates explicit project links and never invents dependencies', () => {
 const project={id:'p',linkedTasks:['a'],updatedAt:'2026-01-01'};
 const tasks=[{id:'a',projectId:'p',workType:'research',status:'done'}, {id:'b',projectId:'p',workType:'qa',status:'done'}];
 const flow=deriveProjectFlow(project,tasks);
 assert.equal(flow.taskCount,2);
 assert.deepEqual(flow.edges,[]);
 assert.equal(flow.qaGate.state,'unrecorded');
 assert.equal(flow.integrationGate.state,'unrecorded');
});
test('rejects conflicting links and shows only recorded edges', () => {
 const project={id:'p',linkedTasks:['a','wrong','missing']};
 const tasks=[{id:'a',projectId:'p',dependsOn:['b','missing']},{id:'b',projectId:'p'}, {id:'wrong',projectId:'q'}];
 const flow=deriveProjectFlow(project,tasks);
 assert.deepEqual(flow.edges,[{from:'b',to:'a'}]);
 assert.deepEqual(flow.conflictingTaskIds,['wrong']);
 assert.deepEqual(flow.missingTaskIds,['missing']);
 assert.deepEqual(flow.unresolvedDependencies,[{taskId:'a',upstreamId:'missing'}]);
});
test('requires explicit evidence for gate pass', () => {
 const project={id:'p',orchestration:{qa:{state:'passed'},integration:{state:'passed',evidenceRef:'artifact://proof'}}};
 const flow=deriveProjectFlow(project,[]);
 assert.equal(flow.qaGate.state,'unrecorded');
 assert.equal(flow.integrationGate.state,'recorded_claim');
});
test('a caller-provided verified flag does not prove a gate', () => {
 const project={id:'p',orchestration:{qa:{state:'passed',evidenceRef:'artifact://proof',verified:true,actorId:'independent-qa',artifactVersion:'v2',decisionId:'review-2'}}};
 assert.equal(deriveProjectFlow(project,[]).qaGate.state,'recorded_claim');
});
