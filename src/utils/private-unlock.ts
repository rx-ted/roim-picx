import storage from './storage';

const UNLOCK_PREFIX = 'unlock_';

export function getUnlockToken(key: string): string | null {
  return storage.local.get(`${UNLOCK_PREFIX}${key}`);
}

export function setUnlockToken(key: string, token: string): void {
  storage.local.set(`${UNLOCK_PREFIX}${key}`, token);
}
