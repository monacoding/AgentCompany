import { useCallback, useEffect, useRef, useState } from 'react';
import { CeoCommandInput } from './CeoCommandInput';
import { ExtensionSplashScreen, resolveCeoDisplayName } from './ExtensionSplashScreen';
import { CompanyInfoModal } from './CompanyInfoPanel';
import { OwnerInfoModal } from './OwnerInfoPanel';
import { LlmStatusBar } from './LlmStatusBar';
import { ApiTab } from './ApiTab';
import { OrgChartTab } from './OrgChartTab';
import { ProjectsTab } from './ProjectsTab';
import { openProjectDetail, ProjectListPanel } from './ProjectListPanel';
import { ProjectDetail, ProjectDetailModal } from './ProjectDetailModal';
import { SettingsTab } from './SettingsTab';
import { Activity, Agent, AgentIdea, AgentWorkLog, DashboardData, LlmConnectionStatus, postMessage, TabId, Task, TeamSession } from './vscode';
import {
  formatAgentLabel,
  isInProgressTask,
  isReviewReadyTask,
  resolveTaskDisplayStatus,
  STATUS_LABELS,
} from './agent-display';
import { initClipboardBridge } from './clipboard-bridge';

const STATUS_COLORS: Record<string, string> = {
  idle: '#6b7280',
  working: '#3b82f6',
  progress: '#8b5cf6',
  review: '#f59e0b',
  waiting: '#f59e0b',
  failed: '#ef4444',
  pending: '#8b5cf6',
  assigned: '#8b5cf6',
  completed: '#22c55e',
};

const PROVIDERS = ['openai', 'anthropic', 'ollama', 'gemini', 'openrouter', 'custom'];

type AgentForm = { name: string; title: string; description: string; model: string; provider: string };

const emptyAgentForm = (): AgentForm => ({
  name: '',
  title: '',
  description: '',
  model: 'gpt-4o',
  provider: 'openai',
});

export default function App() {
  const [data, setData] = useState<DashboardData>({
    agents: [],
    tasks: [],
    activities: [],
    ideas: [],
    settings: {
      defaultProvider: 'openai',
      defaultModel: 'gpt-4o',
      openaiApiKey: '',
      anthropicApiKey: '',
      ollamaBaseUrl: 'http://localhost:11434',
      telegramEnabled: false,
      telegramBotToken: '',
      telegramChatId: '',
      proactiveIdeasEnabled: false,
      proactiveIdeasIntervalMinutes: 30,
      telegramInboundEnabled: true,
    },
    version: '0.0.0',
    llmStatus: {
      provider: 'openai',
      model: 'gpt-4o',
      configured: false,
      connected: false,
      envFileExists: false,
      keySource: 'none',
      envFilePath: '.env',
      maskedKey: '',
      message: 'Loading...',
      lastChecked: '',
      availableModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    },
    externalApis: [],
    orgChart: {
      enabled: true,
      nodes: [{ id: 'ceo', kind: 'ceo', label: 'CEO', x: 280, y: 40 }],
      edges: [],
      updatedAt: '',
    },
    companyInfo: {
      companyName: '',
      businessItem: '',
      policy: '',
      mindset: '',
      tendency: '',
      mission: '',
      foundedAt: '',
      updatedAt: '',
    },
    ownerInfo: {
      name: '',
      personality: '',
      tendency: '',
      orientation: '',
      updatedAt: '',
    },
  });
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [llmChecking, setLlmChecking] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [newAgent, setNewAgent] = useState<AgentForm>(emptyAgentForm());
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editAgent, setEditAgent] = useState<AgentForm>(emptyAgentForm());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [createAgentError, setCreateAgentError] = useState<string | null>(null);
  const [agentWorkLog, setAgentWorkLog] = useState<AgentWorkLog | null>(null);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const bootStartedAtRef = useRef(Date.now());
  const splashDismissedRef = useRef(false);
  const splashFadeTimerRef = useRef<number | null>(null);
  const splashHideTimerRef = useRef<number | null>(null);

  const dismissSplash = useCallback(() => {
    if (splashDismissedRef.current) return;
    splashDismissedRef.current = true;
    setSplashFading(true);
    splashHideTimerRef.current = window.setTimeout(() => {
      setSplashVisible(false);
    }, 420);
  }, []);

  useEffect(() => {
    initClipboardBridge();
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'dashboardData') {
        setData(event.data.payload as DashboardData);
        if (!splashDismissedRef.current) {
          const elapsed = Date.now() - bootStartedAtRef.current;
          const remain = Math.max(0, 1000 - elapsed);
          splashFadeTimerRef.current = window.setTimeout(dismissSplash, remain);
        }
      }
      if (event.data.type === 'navigate') {
        const raw = (event.data.payload as { tab: string }).tab;
        setActiveTab(raw === 'teams' ? 'projects' : (raw as TabId));
      }
      if (event.data.type === 'llmStatusUpdate') {
        setLlmChecking(false);
        setData((prev) => ({
          ...prev,
          llmStatus: event.data.payload as LlmConnectionStatus,
        }));
      }
      if (event.data.type === 'modelsUpdate') {
        const { models } = event.data.payload as { models: string[] };
        setData((prev) => ({
          ...prev,
          llmStatus: { ...prev.llmStatus, availableModels: models },
        }));
      }
      if (event.data.type === 'createAgentResult') {
        const result = event.data.payload as {
          success: boolean;
          message?: string;
          folder?: string;
        };
        if (result.success) {
          setCreateAgentError(null);
          setNewAgent(emptyAgentForm());
          setShowCreateAgent(false);
        } else {
          setCreateAgentError(result.message ?? '에이전트 생성에 실패했습니다.');
        }
      }
      if (event.data.type === 'agentWorkLog') {
        const log = event.data.payload as AgentWorkLog | null;
        if (log) setAgentWorkLog(log);
      }
      if (event.data.type === 'projectDetail') {
        const detail = event.data.payload as ProjectDetail | null;
        if (detail) setProjectDetail(detail);
      }
      if (event.data.type === 'releaseStatus') {
        const { status } = event.data.payload as { status: string };
        if (status === 'running') setReleasing(true);
        if (status === 'failed') setReleasing(false);
      }
    };
    window.addEventListener('message', handler);
    postMessage('ready');
    postMessage('fetchModels');
    const bootFallbackTimer = window.setTimeout(() => {
      if (!splashDismissedRef.current) dismissSplash();
    }, 12_000);
    return () => {
      window.clearTimeout(bootFallbackTimer);
      window.removeEventListener('message', handler);
      if (splashFadeTimerRef.current) window.clearTimeout(splashFadeTimerRef.current);
      if (splashHideTimerRef.current) window.clearTimeout(splashHideTimerRef.current);
    };
  }, [dismissSplash]);

  const handleCheckLlm = useCallback(() => {
    setLlmChecking(true);
    postMessage('checkLlmConnection');
  }, []);

  const handleCreateAgent = useCallback(() => {
    if (!newAgent.name.trim()) {
      setCreateAgentError('에이전트 이름을 입력해 주세요.');
      return;
    }
    if (!newAgent.title.trim()) {
      setCreateAgentError('직책을 입력해 주세요.');
      return;
    }
    if (!newAgent.description.trim()) {
      setCreateAgentError('능력·성향·역할 설명을 입력해 주세요.');
      return;
    }
    setCreateAgentError(null);
    postMessage('createAgent', newAgent);
  }, [newAgent]);

  const handleUpdateAgent = useCallback(() => {
    if (!editingAgentId || !editAgent.name.trim()) return;
    postMessage('updateAgent', { id: editingAgentId, ...editAgent });
    setEditingAgentId(null);
  }, [editingAgentId, editAgent]);

  const startEditAgent = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setEditAgent({
      name: agent.name,
      title: agent.title ?? '',
      description: agent.description,
      model: agent.model,
      provider: agent.provider,
    });
  };

  const handleCreateTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    postMessage('createTask', { title: newTaskTitle.trim() });
    setNewTaskTitle('');
  }, [newTaskTitle]);

  const reviewTasks = data.tasks.filter(isReviewReadyTask);
  const pendingIdeas = data.ideas ?? [];
  const teamSessions = data.teamSessions ?? [];
  const activeTeamSessions = teamSessions.filter((s) => s.status === 'running' || s.status === 'planning');

  const stats = {
    agents: data.agents.length,
    working: data.agents.filter((a) => a.status === 'working').length,
    progress: data.agents.filter((a) => a.status === 'progress').length,
    tasks: data.tasks.length,
    inProgress: data.tasks.filter(isInProgressTask).length,
    review: reviewTasks.length,
    completed: data.tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="app">
      <ExtensionSplashScreen
        visible={splashVisible}
        fading={splashFading}
        logoUrl={data.companyLogoUrl}
        ceoName={resolveCeoDisplayName(data.ownerInfo?.name)}
      />
      <header className="header">
        <div className="header-title">
          {data.companyLogoUrl ? (
            <img src={data.companyLogoUrl} alt="" className="logo logo-img" />
          ) : (
            <span className="logo">🏢</span>
          )}
          <div>
            <div className="header-heading-row">
              <h1>{data.companyInfo?.companyName?.trim() || 'AgentCompany'}</h1>
              <span className="header-version-badge">v{data.version}</span>
              <button
                type="button"
                className="header-company-btn"
                onClick={() => setShowCompanyModal(true)}
              >
                회사 정보
              </button>
              <button
                type="button"
                className="header-company-btn"
                onClick={() => setShowOwnerModal(true)}
              >
                사장 정보
              </button>
            </div>
            <p className="subtitle">
              {data.companyInfo?.companyName?.trim()
                ? 'AI 회사 운영 플랫폼 · AgentCompany'
                : 'AI 회사 운영 플랫폼'}
            </p>
          </div>
        </div>
        <div className="header-right">
          <HeaderStatusBar foundedAt={data.companyInfo?.foundedAt} />
          <button
            className={`btn-icon${releasing ? ' btn-icon--spin' : ''}`}
            onClick={() => postMessage('refresh')}
            title="릴리스 (npm run release) & Reload"
            disabled={releasing}
            aria-busy={releasing}
          >
            ↻
          </button>
        </div>
      </header>

      {pendingIdeas.length > 0 && (
        <section className="ideas-banner">
          <span>💡 에이전트 아이디어 {pendingIdeas.length}건</span>
          <button className="btn-sm" onClick={() => setActiveTab('overview')}>
            확인
          </button>
        </section>
      )}

      {reviewTasks.length > 0 && (
        <section className="review-banner">
          <span>📋 Review 대기: {reviewTasks.length}건</span>
          <button className="btn-sm" onClick={() => setActiveTab('tasks')}>
            확인
          </button>
        </section>
      )}

      {activeTeamSessions.length > 0 && (
        <section className="review-banner" style={{ borderColor: '#3b82f6' }}>
          <span>📁 Project 진행 중: {activeTeamSessions.length}건</span>
          <button className="btn-sm" onClick={() => setActiveTab('projects')}>
            보기
          </button>
        </section>
      )}

      <LlmStatusBar
        status={data.llmStatus}
        checking={llmChecking}
        onCheckConnection={handleCheckLlm}
      />

      <CeoCommandInput agents={data.agents} />

      <nav className="tabs">
        {(['overview', 'agents', 'org', 'projects', 'tasks', 'activity', 'api', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'agents' && `Agents (${data.agents.length})`}
            {tab === 'org' && 'Organization'}
            {tab === 'projects' && `Project (${data.teamSessions?.length ?? 0})`}
            {tab === 'tasks' && `Tasks (${data.tasks.length})`}
            {tab === 'activity' && 'Activity'}
            {tab === 'api' && `API (${data.externalApis?.length ?? 0})`}
            {tab === 'settings' && 'Settings'}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            agents={data.agents}
            ideas={pendingIdeas}
            reviewTasks={reviewTasks}
            teamSessions={teamSessions}
            teamSessionCount={teamSessions.length}
            onOpenProjects={() => setActiveTab('projects')}
            onProjectDoubleClick={openProjectDetail}
          />
        )}
        {activeTab === 'agents' && (
          <AgentsTab
            agents={data.agents}
            tasks={data.tasks}
            showCreate={showCreateAgent}
            newAgent={newAgent}
            editingAgentId={editingAgentId}
            editAgent={editAgent}
            onToggleCreate={() => setShowCreateAgent(!showCreateAgent)}
            onNewAgentChange={setNewAgent}
            onCreate={handleCreateAgent}
            onStartEdit={startEditAgent}
            onEditChange={setEditAgent}
            onUpdate={handleUpdateAgent}
            onCancelEdit={() => setEditingAgentId(null)}
            onDelete={(id) => postMessage('deleteAgent', { id })}
            onActivate={(id) => postMessage('activateAgent', { id })}
            onDeactivate={(id) => postMessage('deactivateAgent', { id })}
            createError={createAgentError}
          />
        )}
        {activeTab === 'org' && (
          <OrgChartTab
            agents={data.agents}
            orgChart={data.orgChart}
            agentPhotos={data.agentPhotos ?? {}}
            ownerPhotoUrl={data.ownerProfilePhotoUrl}
          />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab sessions={data.teamSessions ?? []} agents={data.agents} />
        )}
        {activeTab === 'tasks' && (
          <TasksTab
            tasks={data.tasks}
            agents={data.agents}
            newTaskTitle={newTaskTitle}
            expandedTaskId={expandedTaskId}
            onNewTaskChange={setNewTaskTitle}
            onCreate={handleCreateTask}
            onDelete={(id) => postMessage('deleteTask', { id })}
            onRun={(taskId, agentId) => postMessage('runTask', { taskId, agentId })}
            onAssign={(taskId, agentId) => postMessage('assignTask', { taskId, agentId })}
            onApprove={(taskId) => postMessage('approveTask', { taskId })}
            onReject={(taskId) => postMessage('rejectTask', { taskId, reason: 'Needs revision' })}
            onToggleExpand={(id) => setExpandedTaskId(expandedTaskId === id ? null : id)}
          />
        )}
        {activeTab === 'activity' && <ActivityTab activities={data.activities} agents={data.agents} />}
        {activeTab === 'api' && <ApiTab apis={data.externalApis ?? []} />}
        {activeTab === 'settings' && (
          <SettingsTab
            settings={data.settings}
            version={data.version}
            availableModels={data.llmStatus.availableModels ?? []}
          />
        )}
      </main>

      {showCompanyModal && (
        <CompanyInfoModal
          info={
            data.companyInfo ?? {
              companyName: '',
              businessItem: '',
              policy: '',
              mindset: '',
              tendency: '',
              mission: '',
              foundedAt: '',
              updatedAt: '',
            }
          }
          logoUrl={data.companyLogoUrl}
          onClose={() => setShowCompanyModal(false)}
        />
      )}

      {showOwnerModal && (
        <OwnerInfoModal
          info={
            data.ownerInfo ?? {
              name: '',
              personality: '',
              tendency: '',
              orientation: '',
              updatedAt: '',
            }
          }
          emotionPhotos={data.ownerEmotionPhotos}
          profilePhotoUrl={data.ownerProfilePhotoUrl}
          onClose={() => setShowOwnerModal(false)}
        />
      )}

      {agentWorkLog && (
        <AgentWorkLogModal log={agentWorkLog} onClose={() => setAgentWorkLog(null)} />
      )}
      {projectDetail && (
        <ProjectDetailModal detail={projectDetail} onClose={() => setProjectDetail(null)} />
      )}
    </div>
  );
}

function AgentFormFields({
  form,
  onChange,
  mode = 'edit',
}: {
  form: AgentForm;
  onChange: (v: AgentForm) => void;
  mode?: 'create' | 'edit';
}) {
  return (
    <>
      <input
        placeholder="이름 (예: 강하늘)"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <input
        placeholder="직책 (예: 비서, 연구원, PM)"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
      />
      <div className="form-row">
        <select value={form.provider} onChange={(e) => onChange({ ...form, provider: e.target.value })}>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <input
        placeholder="Model (e.g. gpt-4o)"
        value={form.model}
        onChange={(e) => onChange({ ...form, model: e.target.value })}
      />
      {mode === 'create' ? (
        <>
          <label className="form-label">능력·성향·역할 설명 (필수)</label>
          <textarea
            className="agent-desc-textarea"
            placeholder="예: 친절한 QA 전문가. 테스트 케이스 작성, 버그 재현, 회귀 테스트에 강함. 꼼꼼하고 논리적인 말투."
            value={form.description}
            rows={4}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
          />
          <p className="form-hint">입력 내용으로 persona·역할·agent/폴더가 자동 생성됩니다.</p>
        </>
      ) : (
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      )}
    </>
  );
}

function OverviewTab({
  stats,
  agents,
  ideas,
  reviewTasks,
  teamSessions,
  teamSessionCount,
  onOpenProjects,
  onProjectDoubleClick,
}: {
  stats: Record<string, number>;
  agents: Agent[];
  ideas: AgentIdea[];
  reviewTasks: Task[];
  teamSessions: TeamSession[];
  teamSessionCount: number;
  onOpenProjects: () => void;
  onProjectDoubleClick: (sessionId: string) => void;
}) {
  return (
    <div className="overview">
      <div className="stats-grid">
        <StatCard label="Project" value={teamSessionCount} onClick={onOpenProjects} />
        <StatCard label="Agents" value={stats.agents} />
        <StatCard label="Working" value={stats.working} accent />
        <StatCard label="Progress" value={stats.progress} />
        <StatCard label="Review" value={stats.review} />
        <StatCard label="Completed" value={stats.completed} success />
      </div>

      <div className="panel ideas-panel">
        <div className="ideas-panel-header">
          <h3>💡 에이전트 아이디어</h3>
          <button className="btn-sm" type="button" onClick={() => postMessage('requestIdeas')}>
            지금 제안 받기
          </button>
        </div>
        <p className="panel-hint">
          idle 에이전트가 CEO 대화·작업 이력을 복기해 공백을 찾고, 웹 실제 사례(URL)를 근거로 아이디어를 제안합니다.
        </p>
        {ideas.length === 0 ? (
          <p className="empty">대기 중인 아이디어가 없습니다.</p>
        ) : (
          ideas.map((idea) => {
            const agent = agents.find((a) => a.id === idea.agentId);
            return (
              <div key={idea.id} className="idea-card">
                <div className="idea-card-head">
                  <strong>{idea.title}</strong>
                  <span className="idea-agent">{agent ? formatAgentLabel(agent) : '에이전트'}</span>
                </div>
                <p className="idea-body">{idea.body}</p>
                <div className="idea-actions">
                  <button className="btn-sm btn-primary" type="button" onClick={() => postMessage('acceptIdea', { ideaId: idea.id })}>
                    수락 → 태스크 생성
                  </button>
                  <button className="btn-sm" type="button" onClick={() => postMessage('dismissIdea', { ideaId: idea.id })}>
                    보류
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {reviewTasks.length > 0 && (
        <div className="panel review-panel">
          <h3>📋 CEO Review Required</h3>
          {reviewTasks.map((t) => (
            <TaskRow key={t.id} task={t} compact />
          ))}
        </div>
      )}

      <ProjectListPanel
        sessions={teamSessions}
        agents={agents}
        onDoubleClick={onProjectDoubleClick}
        emptyHint="완료된 Project 작업이 여기에 표시됩니다. PM과 계획 확정 후 「진행하세요」 또는 /project 로 시작하세요."
      />
    </div>
  );
}

function computeAgentWorkload(agents: Agent[], tasks: Task[]) {
  return agents.map((agent) => {
    const agentTasks = tasks.filter((t) => t.agentId === agent.id);
    const active = agentTasks.filter((t) => isInProgressTask(t) || isReviewReadyTask(t));
    return {
      agent,
      workload: active.length,
      progress: agentTasks.filter(isInProgressTask).length,
      review: agentTasks.filter(isReviewReadyTask).length,
      completed: agentTasks.filter((t) => t.status === 'completed').length,
      failed: agentTasks.filter((t) => t.status === 'failed').length,
      total: agentTasks.length,
    };
  });
}

function AgentWorkloadBoard({
  agents,
  tasks,
  onSelectAgent,
}: {
  agents: Agent[];
  tasks: Task[];
  onSelectAgent?: (id: string) => void;
}) {
  const stats = computeAgentWorkload(agents, tasks);

  if (agents.length === 0) {
    return <p className="empty">No agents yet. Create one to get started.</p>;
  }

  return (
    <div className="agent-workload-board">
      <h3 className="agent-workload-title">에이전트 업무 현황</h3>
      <div className="agent-workload-grid">
        {stats.map(({ agent, workload, progress, review, completed }) => (
          <button
            key={agent.id}
            type="button"
            className={`agent-workload-card ${agent.status === 'working' || agent.status === 'progress' ? 'active-agent' : ''} ${onSelectAgent ? 'selectable' : ''}`}
            onClick={() => onSelectAgent?.(agent.id)}
          >
            <div className="agent-workload-header">
              <span className="agent-workload-name">{formatAgentLabel(agent)}</span>
              <StatusBadge status={agent.status} />
            </div>
            <span className="agent-workload-role">{agent.title?.trim() || agent.role}</span>
            <div className="agent-workload-metrics">
              <div className="agent-workload-metric">
                <span className="agent-workload-value">{workload}</span>
                <span className="agent-workload-label">업무량</span>
              </div>
              <div className="agent-workload-metric progress">
                <span className="agent-workload-value">{progress}</span>
                <span className="agent-workload-label">Progress</span>
              </div>
              <div className="agent-workload-metric review">
                <span className="agent-workload-value">{review}</span>
                <span className="agent-workload-label">Review</span>
              </div>
              <div className="agent-workload-metric completed">
                <span className="agent-workload-value">{completed}</span>
                <span className="agent-workload-label">Complete</span>
              </div>
            </div>
            {progress > 0 && (
              <span className="agent-workload-working">{progress}건 진행 중</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AgentsTab({
  agents,
  tasks,
  showCreate,
  newAgent,
  editingAgentId,
  editAgent,
  onToggleCreate,
  onNewAgentChange,
  onCreate,
  onStartEdit,
  onEditChange,
  onUpdate,
  onCancelEdit,
  onDelete,
  onActivate,
  onDeactivate,
  createError,
}: {
  agents: Agent[];
  tasks: Task[];
  showCreate: boolean;
  newAgent: AgentForm;
  editingAgentId: string | null;
  editAgent: AgentForm;
  onToggleCreate: () => void;
  onNewAgentChange: (v: AgentForm) => void;
  onCreate: () => void;
  onStartEdit: (a: Agent) => void;
  onEditChange: (v: AgentForm) => void;
  onUpdate: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  createError?: string | null;
}) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  const closeDetail = () => {
    setSelectedAgentId(null);
    setDeleteConfirmId(null);
    onCancelEdit();
  };

  return (
    <div>
      <div className="section-header">
        <h2>Agent Manager</h2>
        <button className="btn-secondary" onClick={onToggleCreate}>
          {showCreate ? 'Cancel' : '+ New Agent'}
        </button>
      </div>

      {showCreate && (
        <div className="form-panel">
          <AgentFormFields form={newAgent} onChange={onNewAgentChange} mode="create" />
          {createError && <p className="form-error">{createError}</p>}
          <button className="btn-primary" onClick={onCreate}>
            Create Agent
          </button>
        </div>
      )}

      <AgentWorkloadBoard
        agents={agents}
        tasks={tasks}
        onSelectAgent={(id) => {
          setSelectedAgentId(id);
          setDeleteConfirmId(null);
          onCancelEdit();
        }}
      />

      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          isEditing={editingAgentId === selectedAgent.id}
          editForm={editAgent}
          deleteConfirm={deleteConfirmId === selectedAgent.id}
          onClose={closeDetail}
          onEdit={() => onStartEdit(selectedAgent)}
          onEditChange={onEditChange}
          onUpdate={onUpdate}
          onCancelEdit={onCancelEdit}
          onDelete={() => setDeleteConfirmId(selectedAgent.id)}
          onConfirmDelete={() => {
            onDelete(selectedAgent.id);
            closeDetail();
          }}
          onCancelDelete={() => setDeleteConfirmId(null)}
          onActivate={() => onActivate(selectedAgent.id)}
          onDeactivate={() => onDeactivate(selectedAgent.id)}
        />
      )}
    </div>
  );
}

function TasksTab({
  tasks,
  agents,
  newTaskTitle,
  expandedTaskId,
  onNewTaskChange,
  onCreate,
  onDelete,
  onRun,
  onAssign,
  onApprove,
  onReject,
  onToggleExpand,
}: {
  tasks: Task[];
  agents: Agent[];
  newTaskTitle: string;
  expandedTaskId: string | null;
  onNewTaskChange: (v: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRun: (taskId: string, agentId: string) => void;
  onAssign: (taskId: string, agentId: string) => void;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onToggleExpand: (id: string) => void;
}) {
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const availableAgents = agents.filter((a) => !a.deactivated);
  const filteredTasks =
    agentFilter === null ? tasks : tasks.filter((t) => t.agentId === agentFilter);

  return (
    <div>
      <div className="section-header task-board-header">
        <h2>Task Board</h2>
        {agents.length > 0 && (
          <div className="task-agent-filter">
            <button
              type="button"
              className={`task-agent-filter-item ${agentFilter === null ? 'active' : ''}`}
              onClick={() => setAgentFilter(null)}
            >
              전체
              <span className="task-agent-filter-count">{tasks.length}</span>
            </button>
            {agents.map((agent) => {
              const count = tasks.filter((t) => t.agentId === agent.id).length;
              return (
                <button
                  key={agent.id}
                  type="button"
                  className={`task-agent-filter-item ${agentFilter === agent.id ? 'active' : ''}`}
                  onClick={() => setAgentFilter(agent.id)}
                >
                  {formatAgentLabel(agent)}
                  <span className="task-agent-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="form-panel inline">
        <input
          placeholder="New task title"
          value={newTaskTitle}
          onChange={(e) => onNewTaskChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCreate()}
        />
        <button className="btn-primary" onClick={onCreate}>
          Add Task
        </button>
      </div>

      <div className="task-board">
        {(
          [
            { key: 'progress', label: 'progress', match: isInProgressTask },
            { key: 'review', label: 'review', match: isReviewReadyTask },
            { key: 'completed', label: 'completed', match: (t: Task) => t.status === 'completed' },
            { key: 'failed', label: 'failed', match: (t: Task) => t.status === 'failed' },
          ] as const
        ).map(({ key, label, match }) => {
          const columnTasks = filteredTasks.filter(match);
          return (
            <div key={key} className="task-column">
              <div className="column-header">
                <StatusBadge status={label} />
                <span className="count">{columnTasks.length}</span>
              </div>
              {columnTasks.map((t) => {
                const agent = agents.find((a) => a.id === t.agentId);
                const expanded = expandedTaskId === t.id;
                const inProgress = isInProgressTask(t);
                return (
                  <div key={t.id} className={`task-card ${key === 'review' ? 'review-card' : ''}`}>
                    <p className="task-title" onClick={() => onToggleExpand(t.id)}>
                      {t.title}
                    </p>
                    {agent && <span className="task-agent">{formatAgentLabel(agent)}</span>}
                    {expanded && t.result && <pre className="task-result">{t.result.slice(0, 300)}</pre>}
                    <div className="task-actions">
                      {t.status === 'pending' && (
                        <select
                          className="assign-select"
                          defaultValue=""
                          onChange={(e) => e.target.value && onAssign(t.id, e.target.value)}
                        >
                          <option value="">Assign...</option>
                          {availableAgents.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({a.role})
                            </option>
                          ))}
                        </select>
                      )}
                      {t.agentId && (t.status === 'assigned' || t.status === 'failed') && (
                        <button className="btn-sm" onClick={() => onRun(t.id, t.agentId!)}>
                          Run
                        </button>
                      )}
                      {inProgress && t.status === 'working' && t.agentId && (
                        <span className="task-inline-status">진행 중</span>
                      )}
                      {key === 'review' && (
                        <>
                          <button className="btn-sm success" onClick={() => onApprove(t.id)}>
                            Approve
                          </button>
                          <button className="btn-sm warn" onClick={() => onReject(t.id)}>
                            Reject
                          </button>
                        </>
                      )}
                      <button className="btn-sm danger" onClick={() => onDelete(t.id)}>
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityTab({ activities, agents }: { activities: Activity[]; agents: Agent[] }) {
  return (
    <div>
      <h2>Activity Monitor</h2>
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="empty">No activity yet</p>
        ) : (
          activities.map((a) => {
            const agent = agents.find((ag) => ag.id === a.agentId);
            return (
              <div key={a.id} className="activity-item">
                <span className="activity-time">{formatTime(a.createdAt)}</span>
                {agent && <span className="activity-agent">{formatAgentLabel(agent)}</span>}
                <span className="activity-message">{a.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function calcOperationDays(foundedAt: string): number | null {
  if (!foundedAt?.trim()) return null;
  const start = new Date(`${foundedAt.trim()}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

function HeaderStatusBar({ foundedAt }: { foundedAt?: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const opDays = calcOperationDays(foundedAt ?? '');
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const timeStr = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="header-status-bar" aria-label="회사 운영일 및 현재 시각">
      <div className="header-status-item">
        <span className="header-status-label">운영일</span>
        <span className="header-status-value accent">{opDays !== null ? `+${opDays}` : '—'}</span>
      </div>
      <div className="header-status-item">
        <span className="header-status-label">오늘</span>
        <span className="header-status-value">{dateStr}</span>
      </div>
      <div className="header-status-item">
        <span className="header-status-label">시간</span>
        <span className="header-status-value header-status-time">{timeStr}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  success,
  onClick,
}: {
  label: string;
  value: number;
  accent?: boolean;
  success?: boolean;
  onClick?: () => void;
}) {
  const className = `stat-card ${accent ? 'accent' : ''} ${success ? 'success' : ''} ${onClick ? 'stat-card-interactive' : ''}`;
  const content = (
    <>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <div
        className={className}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}

function AgentDetailModal({
  agent,
  isEditing,
  editForm,
  deleteConfirm,
  onClose,
  onEdit,
  onEditChange,
  onUpdate,
  onCancelEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  onActivate,
  onDeactivate,
}: {
  agent: Agent;
  isEditing: boolean;
  editForm: AgentForm;
  deleteConfirm: boolean;
  onClose: () => void;
  onEdit: () => void;
  onEditChange: (v: AgentForm) => void;
  onUpdate: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const isDeactivated = agent.deactivated ?? false;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel agent-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{formatAgentLabel(agent)}</h2>
            <p className="modal-subtitle">
              {agent.title?.trim() || agent.role} · {agent.provider}/{agent.model} ·{' '}
              <StatusBadge status={agent.status} />
            </p>
          </div>
          <button type="button" className="btn-icon modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <div className="agent-detail-edit">
              <AgentFormFields form={editForm} onChange={onEditChange} />
              <div className="form-actions">
                <button className="btn-primary" type="button" onClick={onUpdate}>
                  Save
                </button>
                <button className="btn-secondary" type="button" onClick={onCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <section className="agent-detail-section">
                <h3>페르소나</h3>
                <p className="agent-detail-desc">
                  {agent.description?.trim() || '설명이 없습니다.'}
                </p>
              </section>

              {(agent.role === 'researcher' || agent.name.includes('원영')) && (
                <span className="agent-capability">🌐 WebCrawler · Crawl4AI</span>
              )}
              {(agent.name.includes('하정우') || agent.capabilities?.includes('cline-code')) && (
                <span className="agent-capability">⚡ Cline · Agentic Engineering</span>
              )}

              {deleteConfirm && (
                <p className="delete-confirm-text">
                  &quot;{formatAgentLabel(agent)}&quot; Agent를 삭제할까요?
                </p>
              )}

              <div className="agent-detail-actions">
                {!deleteConfirm && (
                  <button className="btn-sm" type="button" onClick={onEdit}>
                    Edit
                  </button>
                )}
                {!deleteConfirm && isDeactivated && (
                  <button className="btn-sm success" type="button" onClick={onActivate}>
                    Activate
                  </button>
                )}
                {!deleteConfirm && !isDeactivated && (
                  <button className="btn-sm warn" type="button" onClick={onDeactivate}>
                    Deactivate
                  </button>
                )}
                {deleteConfirm ? (
                  <>
                    <button className="btn-sm danger" type="button" onClick={onConfirmDelete}>
                      삭제
                    </button>
                    <button className="btn-sm" type="button" onClick={onCancelDelete}>
                      취소
                    </button>
                  </>
                ) : (
                  <button className="btn-sm danger" type="button" onClick={onDelete}>
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentWorkLogModal({ log, onClose }: { log: AgentWorkLog; onClose: () => void }) {
  const { agent, activeTasks, activities, memorySnippet } = log;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel agent-worklog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{formatAgentLabel(agent)} — 작업 기록</h2>
            <p className="modal-subtitle">
              {agent.title?.trim() || agent.role} · {agent.provider}/{agent.model} · <StatusBadge status={agent.status} />
            </p>
          </div>
          <button type="button" className="btn-icon modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <section className="worklog-section">
            <h3>진행 중인 업무</h3>
            {activeTasks.length === 0 ? (
              <p className="empty">현재 할당된 활성 태스크 없음</p>
            ) : (
              activeTasks.map((task) => (
                <div key={task.id} className="worklog-task">
                  <div className="worklog-task-header">
                    <span className="worklog-task-title">{task.title}</span>
                    <StatusBadge status={task.status} source="task" />
                  </div>
                  {task.result && (
                    <pre className="worklog-task-result">{task.result.slice(0, 600)}</pre>
                  )}
                </div>
              ))
            )}
          </section>

          <section className="worklog-section">
            <h3>활동 로그</h3>
            {activities.length === 0 ? (
              <p className="empty">기록된 활동 없음</p>
            ) : (
              <div className="worklog-activities">
                {activities.map((act) => (
                  <div key={act.id} className="worklog-activity">
                    <span className="worklog-time">{formatTime(act.createdAt)}</span>
                    <span className="worklog-message">{act.message}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {memorySnippet && (
            <section className="worklog-section">
              <h3>최근 메모리</h3>
              <pre className="worklog-memory">{memorySnippet}</pre>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  compact,
  onEdit,
  onDelete,
  deleteConfirm,
  onConfirmDelete,
  onCancelDelete,
  onActivate,
  onDeactivate,
  onDoubleClick,
}: {
  agent: Agent;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirm?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDoubleClick?: () => void;
}) {
  const isDeactivated = agent.deactivated ?? false;

  return (
    <div
      className={`agent-card ${compact ? 'compact' : ''} ${deleteConfirm ? 'delete-confirm' : ''} ${onDoubleClick ? 'dblclickable' : ''}`}
      onDoubleClick={onDoubleClick}
      title={onDoubleClick ? '더블클릭: 작업 기록' : undefined}
    >
      <div className="agent-info">
        <span className="agent-name">{formatAgentLabel(agent)}</span>
        <span className="agent-role">
          {agent.provider}/{agent.model}
        </span>
        {!compact && agent.description && <span className="agent-desc">{agent.description}</span>}
        {!compact && (agent.role === 'researcher' || agent.name.includes('원영')) && (
          <span className="agent-capability">🌐 WebCrawler · Crawl4AI</span>
        )}
        {!compact && (agent.name.includes('하정우') || agent.capabilities?.includes('cline-code')) && (
          <span className="agent-capability">⚡ Cline · Agentic Engineering</span>
        )}
        {deleteConfirm && (
          <span className="delete-confirm-text">"{formatAgentLabel(agent)}" Agent를 삭제할까요?</span>
        )}
      </div>
      <div className="agent-meta">
        <StatusBadge status={agent.status} />
        {!compact && !deleteConfirm && onEdit && (
          <button className="btn-sm" onClick={onEdit}>
            Edit
          </button>
        )}
        {!compact && !deleteConfirm && isDeactivated && onActivate && (
          <button className="btn-sm success" onClick={onActivate}>
            Activate
          </button>
        )}
        {!compact && !deleteConfirm && !isDeactivated && onDeactivate && (
          <button className="btn-sm warn" onClick={onDeactivate}>
            Deactivate
          </button>
        )}
        {deleteConfirm ? (
          <>
            <button className="btn-sm danger" onClick={onConfirmDelete}>
              삭제
            </button>
            <button className="btn-sm" onClick={onCancelDelete}>
              취소
            </button>
          </>
        ) : (
          onDelete && (
            <button className="btn-sm danger" onClick={onDelete}>
              Delete
            </button>
          )
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, compact }: { task: Task; compact?: boolean }) {
  return (
    <div className={`task-row ${compact ? 'compact' : ''}`}>
      <span className="task-title">{task.title}</span>
      <StatusBadge status={task.status} source="task" />
    </div>
  );
}

function StatusBadge({
  status,
  source = 'agent',
}: {
  status: string;
  /** agent: LLM WORKING / task: 진행 중은 PROGRESS */
  source?: 'agent' | 'task';
}) {
  const displayStatus = source === 'task' ? resolveTaskDisplayStatus(status) : status;
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: STATUS_COLORS[displayStatus] ?? '#6b7280' }}
    >
      {STATUS_LABELS[displayStatus] ?? displayStatus.toUpperCase()}
    </span>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}
