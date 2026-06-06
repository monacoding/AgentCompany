export const OWNER_FOLDER = 'owner';
export const OWNER_PROFILE_FILE = 'profile.json';
export const OWNER_PERSONA_FILE = 'persona.md';
export const OWNER_PHOTO_FOLDER = 'photo';

export interface OwnerInfo {
  name: string;
  personality: string;
  tendency: string;
  orientation: string;
  updatedAt: string;
}

export type OwnerInfoInput = Omit<OwnerInfo, 'updatedAt'>;

export const EMPTY_OWNER_INFO = (): OwnerInfo => ({
  name: '',
  personality: '',
  tendency: '',
  orientation: '',
  updatedAt: '',
});

export function getOwnerDisplayName(info) {
  return info.name.trim() || "\uC0AC\uC7A5";
}
export function buildOwnerPersonaMarkdown(info) {
  const name = getOwnerDisplayName({ ...info, updatedAt: "" });
  const sections = [
    `# ${name} \u2014 \uC0AC\uC7A5 \uD398\uB974\uC18C\uB098`,
    "",
    "> \uBAA8\uB4E0 \uC5D0\uC774\uC804\uD2B8\uB294 \uC544\uB798 \uC0AC\uC7A5(\uB300\uD45C)\uC758 \uC131\uACA9\xB7\uC131\uD5A5\xB7\uC9C0\uD5A5\uC810\uC744 \uC778\uC9C0\uD558\uACE0 \uB300\uD654\xB7\uBCF4\uACE0\xB7\uC5C5\uBB34\uB97C \uC218\uD589\uD569\uB2C8\uB2E4.",
    "",
    "## \uAE30\uBCF8 \uC815\uBCF4",
    `- **\uC774\uB984:** ${info.name.trim() || "(\uBBF8\uC124\uC815)"}`
  ];
  if (info.personality.trim()) {
    sections.push("", "## \uC131\uACA9", info.personality.trim());
  }
  if (info.tendency.trim()) {
    sections.push("", "## \uC131\uD5A5", info.tendency.trim());
  }
  if (info.orientation.trim()) {
    sections.push("", "## \uC9C0\uD5A5\uC810", info.orientation.trim());
  }
  sections.push(
    "",
    "---",
    '_\uC5D0\uC774\uC804\uD2B8\uB294 \uC0AC\uC7A5\uC744 "CEO"\uAC00 \uC544\uB2CC \uC704 \uC774\uB984\uACFC \uD398\uB974\uC18C\uB098\uB85C \uBD80\uB974\uACE0, \uB9D0\uD22C\xB7\uD0DC\uB3C4\xB7\uC6B0\uC120\uC21C\uC704\uB97C \uBC18\uC601\uD569\uB2C8\uB2E4._'
  );
  return `${sections.join("\n")}
`;
}
export function buildOwnerPromptBlock(personaMarkdown, dataPathBlock) {
  const parts = [];
  if (dataPathBlock?.trim())
    parts.push(dataPathBlock.trim());
  const trimmed = personaMarkdown.trim();
  if (trimmed) {
    parts.push(
      `Owner Context (\uC0AC\uC7A5 \uD398\uB974\uC18C\uB098 \u2014 \uBAA8\uB4E0 \uC5D0\uC774\uC804\uD2B8\uAC00 \uC774 \uC0AC\uB78C\uC744 \uB300\uD45C\uB85C \uC778\uC9C0\uD558\uACE0 \uD589\uB3D9):
${trimmed}`
    );
  }
  return parts.join("\n\n");
}
export function parseOwnerProfile(raw: string): OwnerInfo | null {
  try {
    const data = JSON.parse(raw);
    return {
      name: String(data.name ?? "").trim(),
      personality: String(data.personality ?? "").trim(),
      tendency: String(data.tendency ?? "").trim(),
      orientation: String(data.orientation ?? "").trim(),
      updatedAt: String(data.updatedAt ?? "")
    };
  } catch {
    return null;
  }
}
