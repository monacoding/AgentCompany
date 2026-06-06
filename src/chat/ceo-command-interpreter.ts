import { Agent, ChatMessage, ROLE_DESCRIPTIONS } from '../types';
import { AgentFolderEngine } from '../agent-folders';
import { ProviderEngine } from '../providers';
import { runWithLlmAgent } from '../providers/llm-context';

export type CeoCommandAction =
  | 'conversation_complete'
  | 'needs_work'
  | 'cross_agent_file'
  | 'needs_clarification';

export interface CeoCommandInterpretation {
  acknowledgment: string;
  understoodTask: string;
  suggestedAction: CeoCommandAction;
}

function parseInterpretationJson(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    const parsed = JSON.parse(candidate);
    if (typeof parsed.acknowledgment === 'string' || typeof parsed.understoodTask === 'string') {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function cleanLine(text: string, maxLen = 500) {
  return text.replace(/^["'`]+|["'`]+$/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

function normalizeAction(value: unknown): CeoCommandAction {
  const action = String(value ?? '').trim();
  if (
    action === 'conversation_complete' ||
    action === 'needs_work' ||
    action === 'cross_agent_file' ||
    action === 'needs_clarification'
  ) {
    return action;
  }
  return 'needs_work';
}

const FALSE_FILE_COMPLETION =
  /(?:저장했|옮겼|복사했|받았|전달했|보냈|완료했|가져왔|옮겨\s*뒀|저장해\s*뒀|받아\s*뒀|넣어\s*뒀)/i;

export function sanitizeAcknowledgmentForPendingWork(
  acknowledgment: string,
  action: CeoCommandAction
): string {
  const text = acknowledgment.trim();
  if (!text) return text;
  if (action === 'cross_agent_file' || action === 'needs_work') {
    if (FALSE_FILE_COMPLETION.test(text)) {
      return '알겠습니다, 사장님! 말씀하신 내용 확인했어요. 바로 진행해볼게요.';
    }
  }
  if (action === 'cross_agent_file' && /(?:완료|끝났|해뒀|해놨)/i.test(text)) {
    return '알겠습니다, 사장님! 먼저 사장님께 요청 여부 여쭤보고 진행할게요.';
  }
  return text;
}

function isCasualFallback(command: string): boolean {
  const task = command.trim();
  return (
    task.length <= 100 &&
    !/(파일|pdf|구현|조사|만들|작성|전달|다운|크롤|리서치|코드|배포|수능|기출)/i.test(task)
  );
}

function fallbackInterpretation(agent: Agent, command: string): CeoCommandInterpretation {
  const task = command.trim();
  return {
    acknowledgment: `알겠습니다, 사장님! ${task ? '말씀하신 내용 확인했어요.' : ''}`.trim(),
    understoodTask: task,
    suggestedAction: isCasualFallback(task) ? 'conversation_complete' : 'needs_work',
  };
}

export async function interpretCeoCommand(
  providers: ProviderEngine,
  agentFolders: AgentFolderEngine,
  agent: Agent,
  command: string,
  chatHistory?: ChatMessage[]
): Promise<CeoCommandInterpretation> {
  const task = command.trim();
  if (!task) return fallbackInterpretation(agent, task);

  try {
    const folderContext = await agentFolders.buildPromptContext(agent);
    const history = chatHistory ?? [];

    const response = await runWithLlmAgent(agent.id, () =>
      providers.chat(
        agent.provider,
        [
          {
            role: 'system',
            content: `You are ${agent.name}, a ${agent.role} agent (${agent.title ?? agent.role}) in AgentCompany.
${folderContext || agent.description || ROLE_DESCRIPTIONS[agent.role]}
${agent.memory ? `\nMemory:\n${agent.memory}` : ''}

사장님 지시를 **당신의 페르소나·말투·성격**에 맞게 이해하고 분류하세요.
- 사장님을 부를 때는 항상 "사장님" (CEO, 대표님, 실명 금지)
- 한국어, 자연스러운 동료/직원 말투
- 코드, Python, 단계별 계획, 영문, 메타 설명 금지
- **후속 지시**(전달해줘, 해줘, 줄래 등 주어 없음): 대화 기록과 합쳐 understoodTask에 **전체 의도**를 적으세요
- 다른 에이전트 폴더/파일 요청이면 cross_agent_file
- 조사·제작·구현·분석 등 실무는 needs_work
- 인사·잡담·감정 표현·짧은 확인은 conversation_complete
- 맥락 없이 정말 불명확할 때만 needs_clarification
- **파일 이동·복사·저장 요청**: acknowledgment에 "저장했어요/옮겼어요" 등 **완료 표현 금지**

JSON만 응답:
{"acknowledgment":"...","understoodTask":"...","suggestedAction":"conversation_complete|needs_work|cross_agent_file|needs_clarification"}`,
          },
          ...history,
          {
            role: 'user',
            content:
              history.length > 0
                ? `사장님 지시:\n${task}\n\n(지시가 짧거나 주어가 없으면 **위 대화 기록**과 합쳐 의도를 파악하세요.)`
                : `사장님 지시:\n${task}`,
          },
        ],
        { type: agent.provider, model: agent.model }
      )
    );

    const parsed = parseInterpretationJson(response.content.trim());
    if (!parsed) return fallbackInterpretation(agent, task);

    const action = normalizeAction(parsed.suggestedAction);
    const acknowledgment = sanitizeAcknowledgmentForPendingWork(
      cleanLine(parsed.acknowledgment ?? '') || fallbackInterpretation(agent, task).acknowledgment,
      action
    );

    return {
      acknowledgment,
      understoodTask: cleanLine(parsed.understoodTask ?? '', 300) || task,
      suggestedAction: action,
    };
  } catch {
    return fallbackInterpretation(agent, task);
  }
}
