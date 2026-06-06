import { OWNER_PERSONA_FILE, OWNER_PROFILE_FILE, OWNER_PHOTO_FOLDER } from './owner-persona';

export const OWNER_PATH_KNOWLEDGE_MARKER = "[OwnerDataPath v1]";
export const OWNER_PATH_KNOWLEDGE_FILENAME = "owner-data-path.md";
export function getOwnerPathKnowledgeSummary(ownerDir: string, workspaceRoot?: string): string {
  const relative2 = workspaceRoot ? ownerDir.replace(workspaceRoot, "").replace(/^[/\\]/, "") || "company/owner" : "company/owner";
  return `${OWNER_PATH_KNOWLEDGE_MARKER}

## \uC0AC\uC7A5\uB2D8(Owner) \uB370\uC774\uD130 \uC704\uCE58 (\uD544\uC218 \uC778\uC9C0)

\uC0AC\uC7A5\uB2D8\uC758 \uD504\uB85C\uD544\xB7\uD398\uB974\uC18C\uB098\xB7\uC0AC\uC9C4\uC740 \uC544\uB798 \uD3F4\uB354\uC5D0 \uC788\uC2B5\uB2C8\uB2E4.

- **\uC808\uB300 \uACBD\uB85C:** \`${ownerDir}\`
- **\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uAE30\uC900:** \`${relative2}\`

### \uC8FC\uC694 \uD30C\uC77C
- \`${ownerDir}/${OWNER_PROFILE_FILE}\` \u2014 \uC0AC\uC7A5\uB2D8 \uD504\uB85C\uD544 (\uC774\uB984\xB7\uC131\uACA9 \uB4F1)
- \`${ownerDir}/${OWNER_PERSONA_FILE}\` \u2014 \uC0AC\uC7A5\uB2D8 \uD398\uB974\uC18C\uB098 (\uB300\uD654\xB7\uBCF4\uACE0 \uC2DC \uCC38\uACE0)
- \`${ownerDir}/${OWNER_PHOTO_FOLDER}/\` \u2014 \uC0AC\uC7A5\uB2D8 \uC0AC\uC9C4

\uC5D0\uC774\uC804\uD2B8\uB294 \uC0AC\uC7A5\uB2D8 \uAD00\uB828 \uC815\uBCF4\uB97C \uCC3E\uAC70\uB098 \uC800\uC7A5\uD560 \uB54C **\uBC18\uB4DC\uC2DC \uC704 \uACBD\uB85C**\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uB2E4\uB978 \uC704\uCE58\uB97C \uCD94\uCE21\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.
`;
}
export function buildOwnerDataPathPromptBlock(ownerDir: string, workspaceRoot?: string): string {
  const relative2 = workspaceRoot ? ownerDir.replace(workspaceRoot, "").replace(/^[/\\]/, "") || "company/owner" : "company/owner";
  return `Owner Data Path (\uC0AC\uC7A5\uB2D8 \uB370\uC774\uD130 \uD3F4\uB354 \u2014 \uBC18\uB4DC\uC2DC \uC774 \uACBD\uB85C\uB97C \uC0AC\uC6A9):
- Absolute: ${ownerDir}
- Relative: ${relative2}
- Files: ${OWNER_PROFILE_FILE}, ${OWNER_PERSONA_FILE}, ${OWNER_PHOTO_FOLDER}/`;
}
