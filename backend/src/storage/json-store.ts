import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function readJson<T>(filePath: string, fallback: T): T {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(filePath: string, data: T): void {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}
