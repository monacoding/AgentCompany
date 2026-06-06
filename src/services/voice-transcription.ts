import { CredentialsService } from './credentials';

export class VoiceTranscriptionService {
  constructor(private credentials: CredentialsService) {}

  async transcribe(audioBase64: string, mimeType = 'audio/webm'): Promise<string> {
    const apiKey = this.credentials.getOpenAiKey().trim();
    if (!apiKey) {
      throw new Error(
        'OpenAI API Key가 없습니다. .env의 CHATGPT_API_KEY를 설정한 뒤 다시 시도해 주세요.'
      );
    }
    const buffer = Buffer.from(audioBase64, 'base64');
    if (buffer.length < 100) {
      throw new Error('녹음이 너무 짧아요. 조금 더 길게 말씀해 주세요.');
    }
    const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : mimeType.includes('wav') ? 'wav' : 'webm';
    const blob = new Blob([buffer], { type: mimeType });
    const form = new FormData();
    form.append('file', blob, `voice.${ext}`);
    form.append('model', 'whisper-1');
    form.append('language', 'ko');
    form.append('response_format', 'json');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        response.status === 401
          ? 'OpenAI API Key가 올바르지 않아요.'
          : `음성 인식 실패 (${response.status}): ${detail.slice(0, 200)}`
      );
    }
    const data = (await response.json()) as { text?: string };
    const text = data.text?.trim() ?? '';
    if (!text) {
      throw new Error('음성을 인식하지 못했어요. 다시 말씀해 주세요.');
    }
    return text;
  }
}
