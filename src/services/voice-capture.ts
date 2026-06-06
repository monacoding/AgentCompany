import { spawn, execFile, ChildProcessWithoutNullStreams } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execFileAsync = promisify(execFile);

export interface VoiceDevice {
  id: string;
  label: string;
}

export interface VoiceCaptureLevel {
  level: number;
  decibels: number;
}

export interface VoiceCaptureResult {
  sessionId: string;
  audioBase64: string;
  mimeType: string;
}

function resolveFfmpegPath(): string {
  const candidates = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', 'ffmpeg'];
  for (const candidate of candidates) {
    try {
      if (candidate.includes(path.sep) && fs.existsSync(candidate)) return candidate;
    } catch {
      /* ignore */
    }
  }
  return 'ffmpeg';
}

function pcmToWav(pcm: Buffer, sampleRate = 16000, channels = 1): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function computeLevel(chunk: Buffer): VoiceCaptureLevel {
  if (chunk.length < 2) return { level: 0, decibels: -60 };
  const sampleCount = Math.floor(chunk.length / 2);
  let sum = 0;
  for (let i = 0; i < sampleCount; i++) {
    const sample = chunk.readInt16LE(i * 2) / 32768;
    sum += sample * sample;
  }
  const rms = Math.sqrt(sum / sampleCount);
  const db = rms > 0 ? Math.max(-60, Math.min(0, 20 * Math.log10(rms))) : -60;
  const level = Math.min(100, rms * 280);
  return { level, decibels: db };
}

export class VoiceCaptureService {
  private process: ChildProcessWithoutNullStreams | null = null;
  private chunks: Buffer[] = [];
  private sessionId: string | null = null;
  private ffmpegPath: string;

  constructor() {
    this.ffmpegPath = resolveFfmpegPath();
  }

  async isAvailable(): Promise<boolean> {
    try {
      await execFileAsync(this.ffmpegPath, ['-version']);
      return true;
    } catch {
      return false;
    }
  }

  private async readFfmpegDeviceList(): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.ffmpegPath, [
        '-hide_banner',
        '-f',
        'avfoundation',
        '-list_devices',
        'true',
        '-i',
        '',
      ]);
      let stderr = '';
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      proc.on('error', reject);
      proc.on('close', () => resolve(stderr));
    });
  }

  private parseAvfoundationAudioDevices(stderr: string): VoiceDevice[] {
    const lines = stderr.split('\n');
    const devices: VoiceDevice[] = [];
    let inAudio = false;
    for (const line of lines) {
      if (line.includes('AVFoundation audio devices')) {
        inAudio = true;
        continue;
      }
      if (inAudio && line.includes('AVFoundation video devices')) break;
      if (!inAudio) continue;
      const match = line.match(/\]\s+\[(\d+)\]\s+(.+)$/);
      if (match) devices.push({ id: match[1], label: match[2].trim() });
    }
    return devices;
  }

  async listDevices(): Promise<VoiceDevice[]> {
    if (process.platform === 'darwin') {
      try {
        const stderr = await this.readFfmpegDeviceList();
        const devices = this.parseAvfoundationAudioDevices(stderr);
        if (devices.length > 0) return devices;
      } catch {
        /* fallback */
      }
    }
    return [{ id: '0', label: '시스템 기본 마이크' }];
  }

  getPcmSnapshot(): Buffer {
    return Buffer.concat(this.chunks);
  }

  getWavSnapshotBase64(minPcmBytes = 8000): string | null {
    const pcm = this.getPcmSnapshot();
    if (pcm.length < minPcmBytes) return null;
    return pcmToWav(pcm).toString('base64');
  }

  start(sessionId: string, deviceId: string, onLevel: (level: VoiceCaptureLevel) => void): void {
    if (this.process) {
      throw new Error('이미 마이크 녹음이 진행 중이에요.');
    }
    this.sessionId = sessionId;
    this.chunks = [];
    const input =
      process.platform === 'darwin'
        ? `:${deviceId || '0'}`
        : process.platform === 'win32'
          ? `audio=${deviceId || 'default'}`
          : 'default';
    const formatArgs =
      process.platform === 'darwin'
        ? ['-f', 'avfoundation']
        : process.platform === 'win32'
          ? ['-f', 'dshow']
          : ['-f', 'alsa'];
    const args = [
      '-hide_banner',
      '-loglevel',
      'error',
      ...formatArgs,
      '-i',
      input,
      '-ar',
      '16000',
      '-ac',
      '1',
      '-f',
      's16le',
      'pipe:1',
    ];
    const proc = spawn(this.ffmpegPath, args);
    this.process = proc;
    proc.stdout.on('data', (chunk: Buffer) => {
      this.chunks.push(chunk);
      onLevel(computeLevel(chunk));
    });
    proc.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Input/output error') || msg.includes('Permission denied')) {
        this.forceStop();
      }
    });
    proc.on('error', () => this.forceStop());
    proc.on('close', () => {
      this.process = null;
    });
  }

  private forceStop(): void {
    if (!this.process) return;
    try {
      this.process.kill('SIGTERM');
    } catch {
      /* ignore */
    }
    this.process = null;
  }

  stop(): VoiceCaptureResult {
    const activeSession = this.sessionId;
    if (!activeSession) {
      throw new Error('진행 중인 녹음이 없어요.');
    }
    this.forceStop();
    this.sessionId = null;
    const pcm = Buffer.concat(this.chunks);
    this.chunks = [];
    if (pcm.length < 3200) {
      throw new Error('녹음이 너무 짧아요. 조금 더 길게 말씀해 주세요.');
    }
    const wav = pcmToWav(pcm);
    return {
      sessionId: activeSession,
      audioBase64: wav.toString('base64'),
      mimeType: 'audio/wav',
    };
  }

  cancel(): void {
    this.forceStop();
    this.sessionId = null;
    this.chunks = [];
  }
}

export async function openMicrophonePrivacySettings(): Promise<void> {
  if (process.platform === 'darwin') {
    const { exec } = await import('child_process');
    exec('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"');
    return;
  }
  if (process.platform === 'win32') {
    const { exec } = await import('child_process');
    exec('start ms-settings:privacy-microphone');
    return;
  }
  throw new Error('시스템 설정에서 마이크 권한을 직접 허용해 주세요.');
}
