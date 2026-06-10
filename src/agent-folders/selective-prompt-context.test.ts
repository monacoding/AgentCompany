import {
  parseMemorySections,
  pickKnowledgeFilenames,
  scoreKnowledgeTitle,
  selectMemoryForTask,
} from './selective-prompt-context';

describe('selective-prompt-context', () => {
  describe('pickKnowledgeFilenames', () => {
    const titles = [
      { filename: 'role-profile.md' },
      { filename: 'project-playbook.md' },
      { filename: 'suneung-pdf-download.md' },
      { filename: 'cross-agent-file-transfer.md' },
      { filename: 'research-pipeline.md' },
      { filename: 'owner-data-path.md' },
    ];

    it('수능 업무 시 suneung 파일만 추가 선별', () => {
      const { picked, skipped } = pickKnowledgeFilenames(titles, '2022 수능 pdf 다운', 'researcher');
      expect(picked).toContain('role-profile.md');
      expect(picked).toContain('research-pipeline.md');
      expect(picked).toContain('suneung-pdf-download.md');
      expect(skipped).toContain('project-playbook.md');
    });

    it('PM 기본 파일은 hint 없어도 포함', () => {
      const { picked } = pickKnowledgeFilenames(titles, '', 'pm');
      expect(picked).toContain('role-profile.md');
      expect(picked).toContain('project-playbook.md');
    });

    it('scoreKnowledgeTitle은 readme 제외', () => {
      expect(scoreKnowledgeTitle('readme.md', 'test', 'pm')).toBe(-1);
    });
  });

  describe('parseMemorySections / selectMemoryForTask', () => {
    const raw = `[CrossAgentFileTransfer v1]
규칙 A

[OwnerDataPath v1]
경로 B

[Research: 수능 pdf]
다운로드 완료

[Research: CPI 동향]
cpi 3.4%`;

    it('memory 섹션 제목으로 분리', () => {
      const sections = parseMemorySections(raw);
      expect(sections).toHaveLength(4);
      expect(sections[0].title).toBe('[CrossAgentFileTransfer v1]');
    });

    it('CPI hint 시 관련 Research만 선별', () => {
      const sections = parseMemorySections(raw);
      const { picked, body } = selectMemoryForTask(sections, 'CPI 소비자물가', 'researcher');
      expect(picked).toContain('[CrossAgentFileTransfer v1]');
      expect(picked.some((t) => t.includes('CPI'))).toBe(true);
      expect(picked.some((t) => t.includes('수능'))).toBe(false);
      expect(body).toContain('cpi');
    });
  });
});
