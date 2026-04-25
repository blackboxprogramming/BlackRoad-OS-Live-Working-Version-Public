// BlackRoad OS — Patch Backups
// Creates backups before modifying any existing file

import { existsSync, mkdirSync, copyFileSync, readFileSync, readdirSync } from 'fs';
import { dirname, resolve, relative } from 'path';

const BACKUP_ROOT = '.blackroad-backups';

export function createBackup(targetFile, rootDir) {
  if (!existsSync(targetFile)) return null; // No backup needed for new files

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const relPath = relative(rootDir, targetFile);
  const backupPath = resolve(rootDir, BACKUP_ROOT, timestamp, relPath);
  const backupDir = dirname(backupPath);

  mkdirSync(backupDir, { recursive: true });
  copyFileSync(targetFile, backupPath);

  return backupPath;
}

export function getLatestBackup(targetFile, rootDir) {
  const relPath = relative(rootDir, targetFile);
  const backupRoot = resolve(rootDir, BACKUP_ROOT);

  if (!existsSync(backupRoot)) return null;

  const timestamps = readdirSync(backupRoot).sort().reverse();
  for (const ts of timestamps) {
    const backupPath = resolve(backupRoot, ts, relPath);
    if (existsSync(backupPath)) return backupPath;
  }
  return null;
}

export function restoreFromBackup(backupPath, targetFile) {
  if (!existsSync(backupPath)) return false;
  const targetDir = dirname(targetFile);
  mkdirSync(targetDir, { recursive: true });
  copyFileSync(backupPath, targetFile);
  return true;
}
