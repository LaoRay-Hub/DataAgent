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

<template>
	<div class="input-area">
		<!-- Status / Info bar -->
		<div class="status-bar">
			<div class="status-chips">

				<!-- Datasource selector -->
				<div class="ds-chip-wrap" @click.stop>
					<div
						class="status-chip status-chip--ds"
						:class="{ disabled: store.isStreaming }"
						@click="toggleDsMenu"
					>
						<v-icon size="13" color="var(--da-text-muted)">mdi-database-outline</v-icon>
						<span>{{ store.activeDatasource?.name || t('chat.selectDatasource') }}</span>
						<v-icon size="13" color="var(--da-text-faint)">{{ showDsMenu ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
					</div>
					<div v-if="showDsMenu" class="chip-dropdown">
						<div
							v-for="ds in store.allDatasources"
							:key="ds.id"
							class="chip-dropdown-item"
							:class="{ active: store.activeDatasource?.id === ds.id }"
							@click="selectDs(ds)"
						>
							<span class="item-name">{{ ds.name }}</span>
							<span class="item-tag">{{ ds.type?.toUpperCase() }}</span>
						</div>
					</div>
				</div>

				<!-- Model selector -->
				<div class="ds-chip-wrap" @click.stop>
					<div
						class="status-chip status-chip--model"
						:class="{ disabled: store.isStreaming || store.chatModels.length === 0 }"
						@click="toggleModelMenu"
					>
						<v-icon size="13" color="var(--da-primary)">mdi-lightning-bolt</v-icon>
						<span>{{ store.activeModelConfig?.modelName || t('chat.selectModel') }}</span>
						<v-icon size="13" color="var(--da-text-faint)">{{ showModelMenu ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
					</div>
					<div v-if="showModelMenu" class="chip-dropdown">
						<div
							v-for="m in store.chatModels"
							:key="m.id"
							class="chip-dropdown-item"
							:class="{ active: store.activeModelConfig?.id === m.id }"
							@click="selectModel(m)"
						>
							<span class="item-name">{{ m.modelName }}</span>
							<span class="item-tag">{{ m.provider }}</span>
						</div>
					</div>
				</div>

			</div>
		</div>

		<!-- Textarea -->
		<div class="textarea-wrap">
			<textarea
				ref="textareaRef"
				v-model="inputText"
				class="chat-textarea"
				:disabled="store.isStreaming || store.showHumanFeedback"
				:placeholder="t('chat.inputPlaceholder')"
				rows="3"
				@keydown.enter.exact.prevent="handleSend"
				@input="autoResize"
			/>
		</div>

		<!-- Bottom action bar -->
		<div class="action-bar">
			<div class="action-bar-left">
				<div class="extra-options">
					<label class="option-chip" :class="{ active: store.requestOptions.humanFeedback }">
						<input
							v-model="store.requestOptions.humanFeedback"
							type="checkbox"
							:disabled="store.requestOptions.nl2sqlOnly || store.isStreaming"
							class="hidden-checkbox"
						/>
						<v-icon size="11">mdi-account-check-outline</v-icon>
						{{ t('chat.humanFeedback') }}
					</label>
					<label class="option-chip" :class="{ active: store.requestOptions.nl2sqlOnly }">
						<input
							v-model="store.requestOptions.nl2sqlOnly"
							type="checkbox"
							:disabled="store.isStreaming"
							class="hidden-checkbox"
							@change="onNl2sqlChange"
						/>
						<v-icon size="11">mdi-database-search-outline</v-icon>
						{{ t('chat.nl2sqlOnly') }}
					</label>
					<label class="option-chip" :class="{ active: store.requestOptions.showSqlResults }">
						<input
							v-model="store.requestOptions.showSqlResults"
							type="checkbox"
							:disabled="store.isStreaming"
							class="hidden-checkbox"
						/>
						<v-icon size="11">mdi-table-eye</v-icon>
						{{ t('chat.showSqlResults') }}
					</label>
				</div>
			</div>

			<div class="action-bar-right">
				<v-btn
					v-if="!store.isStreaming"
					class="send-btn"
					:disabled="!inputText.trim() || store.showHumanFeedback"
					@click="handleSend"
				>
					{{ t('chat.send') }}
					<v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
				</v-btn>
				<v-btn v-else class="stop-btn" @click="handleStop">
					<v-icon size="16" color="var(--da-text-on-dark)">mdi-stop</v-icon>
					{{ t('chat.stop') }}
				</v-btn>
			</div>
		</div>

		<!-- Human Feedback Panel -->
		<Transition name="slide-up">
			<div v-if="store.showHumanFeedback" class="human-feedback-panel">
				<div class="feedback-header">
					<v-icon color="warning" size="16" class="mr-1">mdi-account-question-outline</v-icon>
					<span>{{ t('chat.confirmPlan') }}</span>
				</div>
				<textarea
					v-model="store.feedbackContent"
					class="feedback-textarea"
					rows="2"
					:placeholder="t('chat.feedbackPlaceholder')"
				/>
				<div class="feedback-actions">
					<v-btn class="feedback-btn feedback-btn--accept" @click="store.submitFeedback(false, store.feedbackContent)">
						<v-icon size="14" class="mr-1">mdi-check</v-icon>{{ t('chat.acceptPlan') }}
					</v-btn>
					<v-btn class="feedback-btn feedback-btn--reject" @click="store.submitFeedback(true, store.feedbackContent)">
						<v-icon size="14" class="mr-1">mdi-close</v-icon>{{ t('chat.rejectReplan') }}
					</v-btn>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat';

const store = useChatStore();
const { t } = useI18n();
const inputText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showDsMenu = ref(false);
const showModelMenu = ref(false);

function toggleDsMenu() {
	if (store.isStreaming) return;
	showDsMenu.value = !showDsMenu.value;
	if (showDsMenu.value) showModelMenu.value = false;
}

function toggleModelMenu() {
	if (store.isStreaming || store.chatModels.length === 0) return;
	showModelMenu.value = !showModelMenu.value;
	if (showModelMenu.value) showDsMenu.value = false;
}

async function selectDs(ds: typeof store.allDatasources[0]) {
	showDsMenu.value = false;
	await store.switchDatasource(ds);
}

async function selectModel(m: typeof store.chatModels[0]) {
	showModelMenu.value = false;
	if (m.id !== undefined) await store.switchModel(m.id);
}

function onNl2sqlChange() {
	if (store.requestOptions.nl2sqlOnly) {
		store.requestOptions.humanFeedback = false;
	}
}

function autoResize() {
	const el = textareaRef.value;
	if (!el) return;
	el.style.height = 'auto';
	el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

async function handleSend() {
	const query = inputText.value.trim();
	if (!query) return;
	if (!store.currentSession) return;
	if (store.isStreaming) return;

	inputText.value = '';
	nextTick(() => {
		if (textareaRef.value) textareaRef.value.style.height = 'auto';
	});

	try {
		await store.sendMessage(query);
	} catch (e) {
		console.error('发送失败', e);
	}
}

async function handleStop() {
	try {
		await store.stopStreaming();
	} catch (e) {
		console.error('停止失败', e);
	}
}

function closeMenus() {
	showDsMenu.value = false;
	showModelMenu.value = false;
}

onMounted(() => document.addEventListener('click', closeMenus));
onUnmounted(() => document.removeEventListener('click', closeMenus));
</script>

<style scoped>
.input-area {
	flex-shrink: 0;
	background: var(--da-surface);
	border-top: 1px solid var(--da-border-mute);
	padding: 12px 32px 16px;
}

/* ── Status bar ──────────────────────────────────────────────────────────────── */
.status-bar {
	margin-bottom: 10px;
}
.status-chips {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.ds-chip-wrap {
	position: relative;
}

.status-chip {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 4px 10px;
	background: var(--da-surface-mute);
	border: 1px solid var(--da-border);
	border-radius: 20px;
	font-size: 12.5px;
	color: var(--da-text-secondary);
	cursor: pointer;
	user-select: none;
	white-space: nowrap;
	transition: border-color 0.1s, background 0.1s;
}
.status-chip:hover:not(.disabled) {
	border-color: var(--da-text-faint);
}
.status-chip.disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
.status-chip--model {
	background: var(--da-primary-soft);
	border-color: var(--da-primary-border);
	color: var(--da-primary-text);
}
.status-chip--model:hover:not(.disabled) {
	border-color: var(--da-primary-lighter);
}

.chip-dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	z-index: 999;
	background: var(--da-surface);
	border: 1px solid var(--da-border);
	border-radius: 10px;
	box-shadow: 0 4px 16px var(--da-shadow-soft);
	min-width: 200px;
	max-width: 300px;
	max-height: 280px;
	overflow-y: auto;
	padding: 4px 0;
}

.chip-dropdown-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 7px 14px;
	font-size: 13px;
	color: var(--da-text-body);
	cursor: pointer;
	transition: background 0.1s;
}
.chip-dropdown-item:hover {
	background: var(--da-surface-mute);
}
.chip-dropdown-item.active {
	background: var(--da-primary-soft);
	color: var(--da-primary-heading);
	font-weight: 500;
}
.item-name {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.item-tag {
	flex-shrink: 0;
	font-size: 11px;
	color: var(--da-text-faint);
	background: var(--da-surface-mute);
	border-radius: 4px;
	padding: 1px 5px;
}

/* ── Textarea ────────────────────────────────────────────────────────────────── */
.textarea-wrap {
	background: var(--da-surface-soft);
	border: 1.5px solid var(--da-border);
	border-radius: 14px;
	overflow: hidden;
	transition: border-color 0.15s;
}
.textarea-wrap:focus-within {
	border-color: var(--da-primary);
	background: var(--da-surface);
}
.chat-textarea {
	display: block;
	width: 100%;
	padding: 14px 16px 8px;
	background: none;
	border: none;
	outline: none;
	resize: vertical;
	font-size: 14.5px;
	line-height: 1.6;
	color: var(--da-text-strong);
	font-family: inherit;
	min-height: 80px;
	max-height: 300px;
}
.chat-textarea::placeholder {
	color: var(--da-text-faint);
}
.chat-textarea:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* ── Action bar ──────────────────────────────────────────────────────────────── */
.action-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 6px 4px 0;
}
.action-bar-left {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-wrap: wrap;
}
/* ── Extra options ───────────────────────────────────────────────────────────── */
.extra-options {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
}
.option-chip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 3px 10px;
	background: var(--da-surface-soft);
	border: 1px solid var(--da-border);
	border-radius: 16px;
	font-size: 12px;
	color: var(--da-text-muted);
	cursor: pointer;
	transition: border-color 0.1s, background 0.1s;
	user-select: none;
}
.option-chip:hover {
	border-color: var(--da-primary);
	color: var(--da-primary);
}
.option-chip.active {
	background: var(--da-primary-soft);
	border-color: var(--da-primary);
	color: var(--da-primary-heading);
}
.hidden-checkbox {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

/* ── Send button ─────────────────────────────────────────────────────────────── */
.send-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 10px 24px;
	background: var(--da-primary-strong);
	color: var(--da-text-on-dark);
	border: none;
	border-radius: 24px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.15s, opacity 0.15s;
	white-space: nowrap;
}
.send-btn:hover:not(:disabled) {
	background: var(--da-primary-deep);
}
.send-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}
.send-icon {
	flex-shrink: 0;
}

/* ── Stop button ─────────────────────────────────────────────────────────────── */
.stop-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 10px 20px;
	background: var(--da-danger);
	color: var(--da-text-on-dark);
	border: none;
	border-radius: 24px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.15s;
}
.stop-btn:hover {
	background: var(--da-danger-strong);
}

/* ── Human feedback ──────────────────────────────────────────────────────────── */
.human-feedback-panel {
	margin-top: 10px;
	background: var(--da-warning-soft);
	border: 1px solid var(--da-warning-border);
	border-radius: 10px;
	padding: 12px 14px;
}
.feedback-header {
	display: flex;
	align-items: center;
	font-size: 13px;
	font-weight: 600;
	color: var(--da-warning-text-strong);
	margin-bottom: 8px;
}
.feedback-textarea {
	width: 100%;
	background: var(--da-surface);
	border: 1px solid var(--da-warning-border);
	border-radius: 6px;
	padding: 8px 10px;
	font-size: 13px;
	resize: none;
	outline: none;
	color: var(--da-text-strong);
	font-family: inherit;
	margin-bottom: 8px;
}
.feedback-actions {
	display: flex;
	gap: 8px;
}
.feedback-btn {
	display: inline-flex;
	align-items: center;
	padding: 6px 16px;
	border-radius: 6px;
	font-size: 12.5px;
	font-weight: 600;
	border: none;
	cursor: pointer;
	transition: opacity 0.1s;
}
.feedback-btn--accept {
	background: #22c55e;
	color: var(--da-text-on-dark);
}
.feedback-btn--reject {
	background: var(--da-surface);
	color: var(--da-danger);
	border: 1px solid var(--da-danger);
}
.feedback-btn:hover {
	opacity: 0.85;
}

/* ── Transitions ─────────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(10px); opacity: 0; }

@media (max-width: 768px) {
	.input-area {
		padding: 10px 12px 12px;
	}

	.chip-dropdown {
		max-width: calc(100vw - 24px);
	}
}
</style>
