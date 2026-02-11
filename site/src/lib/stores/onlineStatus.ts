import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface OnlineState {
	isOnline: boolean;
	lastChecked: number;
	checking: boolean;
}

const CACHE_DURATION = 3000; // 3 seconds

export const onlineState = writable<OnlineState>({
	isOnline: true,
	lastChecked: 0,
	checking: false
});

/**
 * Check online status by pinging the API
 */
export async function checkOnlineStatus(): Promise<boolean> {
	if (!browser) return true;

	const state = get(onlineState);
	const now = Date.now();

	// Return cached result if still valid
	if (now - state.lastChecked < CACHE_DURATION && !state.checking) {
		return state.isOnline;
	}

	// Quick check using navigator.onLine
	if (!navigator.onLine) {
		onlineState.set({
			isOnline: false,
			lastChecked: now,
			checking: false
		});
		return false;
	}

	// Already checking, return current state
	if (state.checking) {
		return state.isOnline;
	}

	onlineState.update(s => ({ ...s, checking: true }));

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch('/api/version', {
			method: 'GET',
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		const isOnline = response.ok;
		onlineState.set({
			isOnline,
			lastChecked: Date.now(),
			checking: false
		});
		return isOnline;
	} catch {
		onlineState.set({
			isOnline: false,
			lastChecked: Date.now(),
			checking: false
		});
		return false;
	}
}

/**
 * Initialize online status listeners
 */
export function initOnlineStatus(): () => void {
	if (!browser) return () => {};

	const handleOnline = () => {
		onlineState.update(s => ({ ...s, isOnline: true, lastChecked: Date.now() }));
		// Verify with server
		checkOnlineStatus();
	};

	const handleOffline = () => {
		onlineState.set({
			isOnline: false,
			lastChecked: Date.now(),
			checking: false
		});
	};

	window.addEventListener('online', handleOnline);
	window.addEventListener('offline', handleOffline);

	// Initial check
	checkOnlineStatus();

	return () => {
		window.removeEventListener('online', handleOnline);
		window.removeEventListener('offline', handleOffline);
	};
}

/**
 * Get current online status (synchronous, uses cached value)
 */
export function isOnline(): boolean {
	return get(onlineState).isOnline;
}
