const ACTIVE_BLOCKER_STATES = new Set(['open', 'active', 'blocked']);

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function asArray(value) { return Array.isArray(value) ? value : []; }

export function deriveProjectFlow(project, allTasks) {
  if (!project?.id) throw new Error('project.id is required');
  const tasks = asArray(allTasks);
  const byId = new Map(tasks.filter(task => task?.id).map(task => [task.id, task]));
  const linkedIds = new Set(asArray(project.linkedTasks).map(item => typeof item === 'string' ? item : item?.id).filter(Boolean));
  for (const task of tasks) if (task?.projectId === project.id && task.id) linkedIds.add(task.id);
  const linked = [...linkedIds].map(id => byId.get(id)).filter(Boolean);
  const missingTaskIds = [...linkedIds].filter(id => !byId.has(id));
  const relatedTasks = linked.filter(task => !task.projectId || task.projectId === project.id);
  const conflictingTaskIds = linked.filter(task => task.projectId && task.projectId !== project.id).map(task => task.id);
  const relatedIds = new Set(relatedTasks.map(task => task.id));
  const lanes = new Map();
  for (const task of relatedTasks) {
    const workType = text(task.workType) || 'unclassified';
    if (!lanes.has(workType)) lanes.set(workType, []);
    lanes.get(workType).push(task);
  }
  const edges = [];
  const unresolvedDependencies = [];
  for (const task of relatedTasks) {
    for (const upstreamId of asArray(task.dependsOn)) {
      if (relatedIds.has(upstreamId)) edges.push({ from: upstreamId, to: task.id });
      else unresolvedDependencies.push({ taskId: task.id, upstreamId });
    }
  }
  const taskBlockers = relatedTasks.filter(task => task.status === 'blocked').map(task => ({ taskId: task.id, title: task.title || 'Untitled task', source: 'task' }));
  const projectBlockers = asArray(project.blockers)
    .filter(blocker => ACTIVE_BLOCKER_STATES.has(String(blocker?.status || '').toLowerCase()))
    .map(blocker => ({ id: blocker.id, title: blocker.title || blocker.summary || 'Project blocker', source: 'project' }));
  const gate = key => {
    const record = project?.orchestration?.[key];
    if (!record || !text(record.evidenceRef)) return { state: 'unrecorded', evidenceRef: null };
    // This legacy board projection cannot authenticate the review or its current input version.
    const state = record.state === 'passed' ? 'recorded_claim' : ['rejected', 'working', 'waiting'].includes(record.state) ? record.state : 'unrecorded';
    return { state, evidenceRef: record.evidenceRef || null };
  };
  return {
    projectId: project.id,
    taskCount: relatedTasks.length,
    lanes: [...lanes].map(([workType, laneTasks]) => ({ workType, tasks: laneTasks })),
    edges,
    unresolvedDependencies,
    blockers: [...taskBlockers, ...projectBlockers],
    missingTaskIds,
    conflictingTaskIds,
    qaGate: gate('qa'),
    integrationGate: gate('integration'),
    provenance: { projectUpdatedAt: project.updatedAt || null, linkedBy: 'explicit IDs only' },
  };
}
