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

import { ref } from 'vue';
import enUS from '../../i18n/locales/en-US';
import zhCN from '../../i18n/locales/zh-CN';

export type AppLocale = 'zh-CN' | 'en-US';

type Dictionary = Record<string, unknown>;

const dictionaries: Record<AppLocale, Dictionary> = {
	'zh-CN': zhCN as Dictionary,
	'en-US': enUS as Dictionary,
};

// 语言由宿主（data-pilot）通过 postMessage 下发，嵌入态之外的独立访问保持中文
const locale = ref<AppLocale>('zh-CN');

export function isAppLocale(value?: string): value is AppLocale {
	return value === 'zh-CN' || value === 'en-US';
}

export function setLocale(next?: string) {
	if (isAppLocale(next)) {
		locale.value = next;
	}
}

function resolve(dictionary: Dictionary, key: string): string | undefined {
	let node: unknown = dictionary;
	for (const segment of key.split('.')) {
		if (typeof node !== 'object' || node === null) return undefined;
		node = (node as Dictionary)[segment];
	}
	return typeof node === 'string' ? node : undefined;
}

/**
 * @param key 形如 'menu.chat' 的词条路径
 * @param params 替换文案里的 {name} 占位符
 */
export function translate(key: string, params?: Record<string, string | number>): string {
	const value = resolve(dictionaries[locale.value], key) ?? resolve(dictionaries['zh-CN'], key) ?? key;
	if (!params) return value;
	return value.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in params ? String(params[name]) : match,
	);
}

export function useI18n() {
	return { locale, t: translate, setLocale };
}
