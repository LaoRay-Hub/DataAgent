/*
 * Copyright 2026 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineStore } from 'pinia';

export type EmbedLocale = 'zh-CN' | 'en-US';
export type EmbedTheme = 'light' | 'dark';

// iframe 内刷新时宿主不一定会立刻重发偏好，先落一份到本地避免闪回默认皮肤
const STORAGE_KEY = 'dp-embed-prefs';

interface StoredPrefs {
	locale?: string;
	theme?: string;
}

function readStored(): StoredPrefs {
	if (import.meta.server) return {};
	try {
		return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as StoredPrefs;
	} catch {
		return {};
	}
}

function toLocale(value?: string): EmbedLocale | null {
	return value === 'en-US' || value === 'zh-CN' ? value : null;
}

function toTheme(value?: string): EmbedTheme | null {
	return value === 'dark' || value === 'light' ? value : null;
}

export const useEmbedStore = defineStore('embed', () => {
	const stored = readStored();
	const locale = ref<EmbedLocale>(toLocale(stored.locale) ?? 'zh-CN');
	const theme = ref<EmbedTheme>(toTheme(stored.theme) ?? 'light');

	function applyPrefs(next: StoredPrefs) {
		const nextLocale = toLocale(next.locale);
		const nextTheme = toTheme(next.theme);
		const changed =
			(nextLocale !== null && nextLocale !== locale.value) ||
			(nextTheme !== null && nextTheme !== theme.value);
		if (nextLocale !== null) locale.value = nextLocale;
		if (nextTheme !== null) theme.value = nextTheme;
		if (changed) {
			window.localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ locale: locale.value, theme: theme.value }),
			);
		}
		return changed;
	}

	return { locale, theme, applyPrefs };
});
