import { Agent, TeamSession } from './vscode';
import { openProjectDetail, ProjectListPanel } from './ProjectListPanel';

export function ProjectsTab({
  sessions,
  agents,
}: {
  sessions: TeamSession[];
  agents: Agent[];
}) {
  return (
    <ProjectListPanel
      sessions={sessions}
      agents={agents}
      onDoubleClick={openProjectDetail}
      emptyHint="PM(예: 박준호)과 1:1로 계획을 확정한 뒤 「진행하세요」라고 하면 Project 채팅방이 생성됩니다. 즉시 실행은 /project 명령을 사용하세요."
    />
  );
}
