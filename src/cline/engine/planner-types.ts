export type DevPlanMode = 'architect' | 'coder' | 'debugger';

export interface DevPlan {
  mode: DevPlanMode;
  objective: string;
  steps: string[];
  filesToModify: string[];
}

export function detectDevPlanMode(task: string): DevPlanMode {
  const lower = task.toLowerCase();
  if (/설계|plan|architect|계획/i.test(lower)) return 'architect';
  if (/debug|fix|bug|에러|수정|고쳐|버그/i.test(lower)) return 'debugger';
  return 'coder';
}
