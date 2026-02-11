import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'diarum_sync_config';

export interface SyncConfig {
	autoSaveInterval: number;  // milliseconds, default 3000
	cacheDays: number;         // default 3 days
}

const DEFAULT_CONFIG: SyncConfig = {
	autoSaveInterval: 3000,
	cacheDays: 3
};

function loadConfig(): SyncConfig {
	if (!browser) return DEFAULT_CONFIG;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return DEFAULT_CONFIG;

		const config = JSON.parse(stored) as Partial<SyncConfig>;
		return {
			...DEFAULT_CONFIG,
			...config
		};
	} catch {
		return DEFAULT_CONFIG;
	}
}

export const syncConfig = writable<SyncConfig>(loadConfig());

/**
 * Initialize sync config (call on app mount)
 */
export function initSyncConfig(): void {
	if (!browser) return;

	// Load from localStorage
	const config = loadConfig();
	syncConfig.set(config);

	// Subscribe to changes and persist
	syncConfig.subscribe(config => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
		} catch (e) {
			console.error('Failed to save sync config:', e);
		}
	});
}

/**
 * Update auto-save interval
 */
export function setAutoSaveInterval(interval: number): void {
	if (interval < 1000) interval = 1000;  // Minimum 1 second
	if (interval > 60000) interval = 60000;  // Maximum 60 seconds

	syncConfig.update(c => ({ ...c, autoSaveInterval: interval }));
}

/**
 * Update cache days
 */
export function setCacheDays(days: number): void {
	if (days < 1) days = 1;  // Minimum 1 day
	if (days > 30) days = 30;  // Maximum 30 days

	syncConfig.update(c => ({ ...c, cacheDays: days }));
}

/**
 * Get current config (synchronous)
 */
export function getConfig(): SyncConfig {
	return get(syncConfig);
}

/**
 * Reset to default config
 */
export function resetConfig(): void {
	syncConfig.set(DEFAULT_CONFIG);
}
