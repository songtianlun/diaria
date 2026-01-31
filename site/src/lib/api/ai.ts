import { pb } from './client';

export interface AISettings {
	api_key: string;
	base_url: string;
	chat_model: string;
	embedding_model: string;
	enabled: boolean;
}

export interface ModelInfo {
	id: string;
	object: string;
	created?: number;
	owned_by?: string;
}

/**
 * Get AI settings
 */
export async function getAISettings(): Promise<AISettings> {
	try {
		const response = await fetch('/api/ai/settings', {
			headers: {
				'Authorization': `Bearer ${pb.authStore.token}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to get AI settings');
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching AI settings:', error);
		return {
			api_key: '',
			base_url: '',
			chat_model: '',
			embedding_model: '',
			enabled: false
		};
	}
}

/**
 * Save AI settings
 */
export async function saveAISettings(settings: AISettings): Promise<{ success: boolean }> {
	const response = await fetch('/api/ai/settings', {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${pb.authStore.token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(settings)
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message || 'Failed to save AI settings');
	}

	return await response.json();
}

/**
 * Fetch available models from OpenAI-compatible API
 */
export async function fetchModels(apiKey: string, baseUrl: string): Promise<ModelInfo[]> {
	const response = await fetch('/api/ai/models', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${pb.authStore.token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			api_key: apiKey,
			base_url: baseUrl
		})
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message || 'Failed to fetch models');
	}

	const data = await response.json();
	return data.models || [];
}
