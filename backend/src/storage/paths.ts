import { resolve } from 'path';

export function resolveStoragePath(fileName: string): string {
  const baseDir = process.env.QX_DATA_DIR || process.env.DATA_DIR || 'storage';
  return resolve(process.cwd(), baseDir, fileName);
}
