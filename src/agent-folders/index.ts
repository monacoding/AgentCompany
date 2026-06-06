export { AgentFolderEngine } from './engine';
export {
  transferFilesBetweenAgents,
  searchFilesInAgentDb,
  copySelectedFiles,
  copySelectedFilesToOwner,
  formatTransferredPaths,
  formatFoundFilePaths,
  formatDuplicatePaths,
  buildOwnerFolderDeliveryMessage,
  buildOwnerFolderFileIndex,
  findDuplicateInOwnerFolder,
  searchModeForAttempt,
} from './cross-agent-transfer';
export type {
  CrossAgentFileTransferResult,
  TransferredFile,
  FoundFile,
  DuplicateSkippedFile,
  FileSearchMode,
  FileSearchOptions,
} from './cross-agent-transfer';
export {
  FILE_TRANSFER_KNOWLEDGE_MARKER,
  FILE_TRANSFER_KNOWLEDGE_FILENAME,
  getFileTransferKnowledgeSummary,
} from './file-transfer-knowledge';
export {
  OWNER_PATH_KNOWLEDGE_MARKER,
  OWNER_PATH_KNOWLEDGE_FILENAME,
  getOwnerPathKnowledgeSummary,
  buildOwnerDataPathPromptBlock,
} from './owner-path-knowledge';
export { KnowledgeLearner } from './knowledge-learner';
export { KnowledgeWatcher } from './knowledge-watcher';
export { AgentPhotoWatcher } from './photo-watcher';
export { AgentProfileGenerator, generateProfileFromBrief, inferRoleFromBrief } from './profile-generator';
export type { GeneratedAgentProfile } from './profile-generator';
export type { KnowledgeFileIndex, KnowledgeLearnIndex } from './knowledge-learner';
export {
  isNonLearnableAgentRelativePath,
  isNonLearnableAgentAbsolutePath,
  NON_LEARNABLE_AGENT_PATH_PREFIXES,
} from './learnable-path';
export { resolveAgentSlug, resolveBundledTemplateSlug, buildAgentFolderSlug, slugifyAgentName, AGENT_FOLDER_LAYOUT } from './slug';
export {
  COMPANY_FOLDER_SLUG,
  COMPANY_PROFILE_FILE,
  COMPANY_PERSONA_FILE,
  EMPTY_COMPANY_INFO,
  buildCompanyPersonaMarkdown,
  buildCompanyPromptBlock,
} from './company-persona';
export type { CompanyInfo, CompanyInfoInput } from './company-persona';
export {
  OWNER_FOLDER,
  OWNER_PROFILE_FILE,
  OWNER_PERSONA_FILE,
  EMPTY_OWNER_INFO,
  getOwnerDisplayName,
  buildOwnerPersonaMarkdown,
  buildOwnerPromptBlock,
} from './owner-persona';
export type { OwnerInfo, OwnerInfoInput } from './owner-persona';
