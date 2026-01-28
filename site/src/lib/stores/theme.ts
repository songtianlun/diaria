import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
	if (!browser) return 'system';
	const stored = localStorage.getItem('theme') as Theme;
	if (stored && ['light', 'dark', 'system'].includes(stored)) {
		return stored;
	}
	return 'system';
}

function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable<Theme>(getInitialTheme());

export const effectiveTheme = writable<'light' | 'dark'>('light');

export function initTheme() {
	if (!browser) return;

	const updateEffectiveTheme = (t: Theme) => {
		const effective = t === 'system' ? getSystemTheme() : t;
		effectiveTheme.set(effective);

		if (effective === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	};

	theme.subscribe((t) => {
		localStorage.setItem('theme', t);
		updateEffectiveTheme(t);
	});

	// Listen for system theme changes
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		theme.update((t) => {
			if (t === 'system') {
				updateEffectiveTheme(t);
			}
			return t;
		});
	});

	// Initialize
	updateEffectiveTheme(getInitialTheme());
}

export function setTheme(newTheme: Theme) {
	theme.set(newTheme);
}
