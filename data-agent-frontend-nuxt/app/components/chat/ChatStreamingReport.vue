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
	<div class="streaming-report">
		<div class="report-header">
			<v-icon color="primary" size="18" class="mr-2"
				>mdi-file-document-edit-outline</v-icon
			>
			<span>{{ t('chat.generatingReport') }}</span>
			<span class="typing-indicator">
				<span class="typing-dot" />
				<span class="typing-dot typing-dot--2" />
				<span class="typing-dot typing-dot--3" />
			</span>
		</div>
		<div ref="bodyRef" class="report-body">
			<div class="markdown-body streaming" v-html="renderedHtml" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue';
import DOMPurify from 'dompurify';
import { renderMarkdownContent } from '~/utils/markdown';
import { useTypewriter } from '~/composables/useTypewriter';
import { useEchartsRenderer } from '~/composables/useEchartsRenderer';

const props = defineProps<{ content: string }>();
const bodyRef = ref<HTMLElement | null>(null);
const { t } = useI18n();

const { displayedText, append, reset } = useTypewriter();
const { renderECharts } = useEchartsRenderer();

// Track what we've already fed to the typewriter
let lastFedLength = 0;

watch(
	() => props.content,
	(newVal, _oldVal) => {
		// If content was reset (new stream started), reset the typewriter
		if (!newVal || newVal.length < lastFedLength) {
			reset();
			lastFedLength = 0;
		}
		// Feed only the new delta to the typewriter queue
		if (newVal && newVal.length > lastFedLength) {
			const chunk = newVal.slice(lastFedLength);
			lastFedLength = newVal.length;
			append(chunk);
		}
	},
	{ immediate: true },
);

// Render markdown from the typewriter's displayed text (incremental)
// We use a throttled computed: only re-render when displayedText changes.
// This is much cheaper than re-rendering the full content on every SSE event.
const SANITIZE_OPTIONS = {
	ADD_TAGS: ['div'],
	ADD_ATTR: ['style', 'class', 'data-echarts-config'],
};

const renderedHtml = computed(() => {
	const text = displayedText.value;
	if (!text) return '';
	return DOMPurify.sanitize(
		renderMarkdownContent(text),
		SANITIZE_OPTIONS,
	) as string;
});

// After each render, try to initialize any completed echarts blocks
watch(renderedHtml, () => {
	nextTick(() => renderECharts(bodyRef.value));
});

onBeforeUnmount(() => {
	lastFedLength = 0;
});
</script>

<style scoped>
.streaming-report {
	background: var(--da-surface);
}

.report-header {
	display: flex;
	align-items: center;
	padding: 10px 14px;
	background: var(--da-surface-soft);
	border-bottom: 1px solid var(--da-border-mute);
	font-size: 13.5px;
	font-weight: 600;
	color: var(--da-text-strong);
}

.typing-indicator {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	margin-left: 8px;
}

.typing-dot {
	width: 4px;
	height: 4px;
	background: var(--da-primary);
	border-radius: 50%;
	animation: typingBounce 1.2s infinite;
}
.typing-dot--2 {
	animation-delay: 0.2s;
}
.typing-dot--3 {
	animation-delay: 0.4s;
}
@keyframes typingBounce {
	0%,
	60%,
	100% {
		opacity: 0.3;
		transform: translateY(0);
	}
	30% {
		opacity: 1;
		transform: translateY(-2px);
	}
}

.report-body {
	padding: 16px;
	position: relative;
}

/* Blinking dot cursor — appended after last inline content via CSS ::after
 * Markdown renders block elements (p, h, li), so we target the last child.
 * The dot stays inline at the end of the last line of text.
 */
.markdown-body.streaming :deep(> :last-child::after) {
	content: '';
	display: inline-block;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--da-primary);
	margin-left: 3px;
	vertical-align: middle;
	animation: cursorDotBlink 0.7s step-end infinite;
}
@keyframes cursorDotBlink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
}

/* ── Markdown body ───────────────────────────────────────────────────────────── */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
	font-weight: 700;
	margin: 14px 0 6px;
	color: var(--da-text);
}
.markdown-body :deep(h1) {
	font-size: 20px;
}
.markdown-body :deep(h2) {
	font-size: 17px;
}
.markdown-body :deep(h3) {
	font-size: 15px;
}
.markdown-body :deep(p) {
	margin-bottom: 10px;
	line-height: 1.75;
	color: var(--da-text-body);
	font-size: 14px;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
	padding-left: 22px;
	margin-bottom: 10px;
}
.markdown-body :deep(li) {
	line-height: 1.7;
	font-size: 14px;
	color: var(--da-text-body);
}
.markdown-body :deep(code:not(pre code)) {
	background: var(--da-code-bg);
	border: 1px solid var(--da-border-soft);
	padding: 2px 5px;
	border-radius: 3px;
	font-size: 12.5px;
	color: var(--da-accent);
}
.markdown-body :deep(table) {
	width: 100%;
	border-collapse: collapse;
	margin: 10px 0;
	display: block;
	overflow-x: auto;
}
.markdown-body :deep(thead) {
	display: table-header-group;
}
.markdown-body :deep(tbody) {
	display: table-row-group;
}
.markdown-body :deep(tr) {
	display: table-row;
	border-top: 1px solid var(--da-border-strong);
}
.markdown-body :deep(th) {
	display: table-cell;
	background: var(--da-surface-mute);
	padding: 8px 12px;
	border: 1px solid var(--da-border);
	font-weight: 600;
	font-size: 13px;
	text-align: left;
}
.markdown-body :deep(td) {
	display: table-cell;
	padding: 8px 12px;
	border: 1px solid var(--da-border-mute);
	font-size: 13px;
}
.markdown-body :deep(tr:nth-child(even) td) {
	background: var(--da-surface-soft);
}
.markdown-body :deep(blockquote) {
	border-left: 3px solid var(--da-primary);
	padding: 8px 14px;
	margin-left: 0;
	background: var(--da-primary-soft);
	border-radius: 0 6px 6px 0;
	color: var(--da-text-body);
}

/* ── Code block with header ─────────────────────────────────────────────────── */
.markdown-body :deep(.code-block-wrapper) {
	margin: 10px 0;
	border: 1px solid var(--da-border-soft);
	border-radius: 6px;
	overflow: auto;
	background: var(--da-code-bg);
}
.markdown-body :deep(.code-block-header) {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: var(--da-code-bg);
	padding: 6px 10px;
	border-bottom: 1px solid var(--da-border-soft);
	font-size: 11px;
}
.markdown-body :deep(.code-language) {
	color: var(--da-code-label);
	font-weight: 600;
	font-family: 'Monaco', 'Menlo', monospace;
	font-size: 10px;
	text-transform: uppercase;
}
.markdown-body :deep(.code-copy-button) {
	background: transparent;
	border: 1px solid var(--da-border-strong);
	padding: 3px 10px;
	border-radius: 4px;
	font-size: 10px;
	cursor: pointer;
	transition: all 0.2s;
	color: var(--da-text);
}
.markdown-body :deep(.code-copy-button:hover) {
	background: var(--da-surface-alt);
	border-color: var(--da-border-strong);
}
.markdown-body :deep(.code-copy-button.copied) {
	background: var(--da-success);
	border-color: var(--da-success);
	color: var(--da-text-on-dark);
}
.markdown-body :deep(pre.hljs) {
	margin: 0;
	padding: 10px;
	overflow-x: auto;
	overflow-y: hidden;
	background: var(--da-code-bg);
	color: var(--da-text-body);
	font-size: 12px;
	line-height: 1.4;
	white-space: pre;
}
.markdown-body :deep(pre.hljs code) {
	display: block;
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	font-family: 'Monaco', 'Menlo', monospace;
	color: inherit;
	white-space: pre;
	min-width: max-content;
}

/* ── ECharts containers ─────────────────────────────────────────────────────── */
:deep(.md-echarts) {
	margin: 10px 0;
	border-radius: 6px;
}

/* ── ECharts skeleton placeholder (while streaming) ────────────────────────── */
:deep(.md-echarts-skeleton) {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	margin: 10px 0;
	height: 120px;
	border-radius: 8px;
	border: 1px dashed var(--da-border-faint);
	background: linear-gradient(
		90deg,
		var(--da-surface-soft) 25%,
		var(--da-surface-mute) 50%,
		var(--da-surface-soft) 75%
	);
	background-size: 200% 100%;
	animation: skeletonShimmer 1.6s ease-in-out infinite;
	color: var(--da-text-faint);
	font-size: 13px;
}
:deep(.md-echarts-skeleton-icon) {
	font-size: 22px;
	animation: spinPulse 1.6s ease-in-out infinite;
}
:deep(.md-echarts-skeleton-text) {
	font-weight: 500;
	letter-spacing: 0.3px;
}
@keyframes skeletonShimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}
@keyframes spinPulse {
	0%,
	100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.5;
		transform: scale(0.9);
	}
}
</style>
