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

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

const { t } = useI18n();

const statusCode = computed(() => props.error?.statusCode || 500);
const statusText = computed(() => {
	const keyMap: Record<number, string> = {
		400: 'errorPage.status400',
		401: 'errorPage.status401',
		403: 'errorPage.status403',
		404: 'errorPage.status404',
		500: 'errorPage.status500',
		502: 'errorPage.status502',
		503: 'errorPage.status503',
	};
	const key = keyMap[statusCode.value];
	return (
		props.error?.statusMessage ||
		(key ? t(key) : '') ||
		t('errorPage.unknown')
	);
});

const illustration = computed(() => {
	if (statusCode.value === 404) return 'mdi-map-marker-question-outline';
	if (statusCode.value === 403) return 'mdi-shield-lock-outline';
	if (statusCode.value === 401) return 'mdi-account-lock-outline';
	return 'mdi-alert-circle-outline';
});

const handleBack = () => clearError({ redirect: '/' });
</script>

<template>
	<div class="error-page">
		<div class="error-card">
			<div class="error-icon-wrap">
				<v-icon :icon="illustration" size="72" color="var(--da-text-faint)" />
			</div>

			<div class="error-code">{{ statusCode }}</div>
			<div class="error-text">{{ statusText }}</div>

			<p v-if="error?.message && error.message !== statusText" class="error-detail">
				{{ error.message }}
			</p>

			<div class="error-actions">
				<v-btn
					color="primary"
					variant="flat"
					size="large"
					prepend-icon="mdi-home-outline"
					class="action-btn"
					@click="handleBack"
				>
					{{ t('errorPage.backHome') }}
				</v-btn>
				<v-btn
					variant="outlined"
					size="large"
					prepend-icon="mdi-refresh"
					class="action-btn"
					@click="() => reloadNuxtApp()"
				>
					{{ t('errorPage.reload') }}
				</v-btn>
			</div>
		</div>
	</div>
</template>

<style scoped>
.error-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(
		135deg,
		var(--da-surface-soft) 0%,
		var(--da-border) 100%
	);
	padding: 24px;
}

.error-card {
	text-align: center;
	max-width: 460px;
	width: 100%;
}

.error-icon-wrap {
	margin-bottom: 20px;
	opacity: 0.6;
}

.error-code {
	font-size: 96px;
	font-weight: 800;
	line-height: 1;
	color: var(--da-border-faint);
	letter-spacing: -4px;
	margin-bottom: 12px;
}

.error-text {
	font-size: 20px;
	font-weight: 600;
	color: var(--da-text-body);
	margin-bottom: 8px;
}

.error-detail {
	font-size: 14px;
	color: var(--da-text-faint);
	line-height: 1.6;
	margin-bottom: 32px;
	word-break: break-word;
}

.error-actions {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	margin-top: 28px;
}

.action-btn {
	text-transform: none !important;
	letter-spacing: 0 !important;
	font-weight: 600 !important;
	border-radius: 12px !important;
	padding: 0 24px !important;
}
</style>
