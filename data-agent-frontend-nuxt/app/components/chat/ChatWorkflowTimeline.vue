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
	<div ref="timelineRef" class="workflow-timeline">
		<!-- Title + global toggle -->
		<div class="timeline-title-bar">
			<v-card-title class="timeline-title pa-0">
				<v-icon size="18" color="blue" class="mr-1"
					>mdi-rocket-launch-outline</v-icon
				>
				{{ t('chat.taskStarted') }}
			</v-card-title>
			<v-btn
				variant="outlined"
				size="x-small"
				color="var(--da-text-muted)"
				class="toggle-all-btn"
				:prepend-icon="
					allExpanded
						? 'mdi-unfold-less-horizontal'
						: 'mdi-unfold-more-horizontal'
				"
				@click="toggleAll"
			>
				{{ allExpanded ? t('chat.collapseAll') : t('chat.expandAll') }}
			</v-btn>
		</div>

		<v-timeline density="compact" side="end" truncate-line="both">
			<v-timeline-item
				v-for="step in timelineSteps"
				:key="step.stepId"
				:dot-color="dotColor(step.status)"
				:icon="dotIcon(step.status)"
				size="small"
			>
				<!-- Step header: clickable to toggle -->
				<div class="step-header" @click="toggleStep(step)">
					<div class="step-header-left">
						<span class="step-label">{{ step.label }}</span>
						<span v-if="step.status === 'active'" class="step-badge active">
							<span class="badge-dot" />{{ t('chat.statusRunning') }}
						</span>
						<span v-else-if="step.status === 'done'" class="step-badge done">{{
							t('chat.statusDone')
						}}</span>
					</div>
					<v-icon size="16" color="var(--da-text-faint)">
						{{ step.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
					</v-icon>
				</div>

				<!-- Collapsible content -->
				<v-expand-transition>
					<div
						v-show="step.expanded"
						class="step-content"
						:class="{ 'is-muted': step.status === 'done' && !step.isReport }"
					>
						<!-- Report node: show brief status, not full content -->
						<div v-if="step.isReport" class="text-body report-brief">
							<v-icon size="14" color="#16a34a" class="mr-1"
								>mdi-file-chart-outline</v-icon
							>
							<span v-if="step.status === 'active'">{{
								t('chat.reportStreaming')
							}}</span>
							<span v-else>{{ t('chat.reportReady') }}</span>
						</div>
						<!-- Preserve typed code inside mixed status/code output. -->
						<div v-else-if="step.contentBlock.length" class="timeline-content">
							<template
								v-for="(segment, index) in segmentWorkflowContent(
									step.contentBlock,
								)"
								:key="`${segment.kind}-${index}`"
							>
								<div
									v-if="segment.kind === 'code'"
									v-html="renderCode(segment.items)"
								/>
								<div
									v-else
									class="text-body"
									v-html="renderTextWithJsonDetection(segment.items)"
								/>
							</template>
						</div>
						<!-- RESULT_SET arrives as another block from the same node. -->
						<ChatResultSet
							v-if="step.resultSetText && store.requestOptions.showSqlResults"
							:data="safeParseJson(step.resultSetText)"
							:page-size="10"
						/>
					</div>
				</v-expand-transition>
			</v-timeline-item>
		</v-timeline>
	</div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify';
import { useEchartsRenderer } from '~/composables/useEchartsRenderer';
import { hljs } from '~/utils/markdown/markdown-plugin-highlight';
import { TextType, type GraphNodeResponse } from '~/services/graph/index';
import type { ResultData } from '~/services/resultSet/index';
import ChatResultSet from './ChatResultSet.vue';
import { useChatStore } from '~/stores/chat';
import {
	groupWorkflowTimeline,
	segmentWorkflowContent,
} from '~/utils/workflowTimeline';

const store = useChatStore();
const { t } = useI18n();

const props = withDefaults(
	defineProps<{
		nodeBlocks: GraphNodeResponse[][];
		completed?: boolean;
	}>(),
	{
		completed: false,
	},
);

const expandedSteps = ref<Record<string, boolean>>({});

const allExpanded = computed(() => {
	const steps = timelineSteps.value;
	if (steps.length === 0) return false;
	return steps.some((s) => s.expanded);
});

function toggleAll() {
	const shouldExpand = !allExpanded.value;
	for (const step of timelineSteps.value) {
		expandedSteps.value[step.stepId] = shouldExpand;
	}
}

function toggleStep(step: TimelineStep) {
	const defaultExpanded = getDefaultExpanded(step.nodeName);
	expandedSteps.value[step.stepId] = !(
		expandedSteps.value[step.stepId] ?? defaultExpanded
	);
}

function getDefaultExpanded(nodeName: string): boolean {
	if (!props.completed) return true;
	if (nodeName === 'ReportGeneratorNode') return true;
	return false;
}

interface NodeDef {
	nodeName: string;
	labelKey: string;
	icon: string;
}

const NODE_LABEL_MAP: Record<string, NodeDef> = {
	IntentRecognitionNode: {
		nodeName: 'IntentRecognitionNode',
		labelKey: 'chat.node.intentRecognition',
		icon: 'mdi-magnify',
	},
	QueryEnhanceNode: {
		nodeName: 'QueryEnhanceNode',
		labelKey: 'chat.node.queryEnhance',
		icon: 'mdi-text-search',
	},
	SchemaRecallNode: {
		nodeName: 'SchemaRecallNode',
		labelKey: 'chat.node.schemaRecall',
		icon: 'mdi-database-search',
	},
	FeasibilityAssessmentNode: {
		nodeName: 'FeasibilityAssessmentNode',
		labelKey: 'chat.node.feasibilityAssessment',
		icon: 'mdi-check-circle-outline',
	},
	EvidenceRecallNode: {
		nodeName: 'EvidenceRecallNode',
		labelKey: 'chat.node.evidenceRecall',
		icon: 'mdi-file-search-outline',
	},
	TableRelationNode: {
		nodeName: 'TableRelationNode',
		labelKey: 'chat.node.tableRelation',
		icon: 'mdi-table-network',
	},
	PlannerNode: {
		nodeName: 'PlannerNode',
		labelKey: 'chat.node.planner',
		icon: 'mdi-clipboard-list-outline',
	},
	HumanFeedbackNode: {
		nodeName: 'HumanFeedbackNode',
		labelKey: 'chat.node.humanFeedback',
		icon: 'mdi-account-check-outline',
	},
	PlanExecutorNode: {
		nodeName: 'PlanExecutorNode',
		labelKey: 'chat.node.planExecutor',
		icon: 'mdi-play-circle-outline',
	},
	SqlGenerateNode: {
		nodeName: 'SqlGenerateNode',
		labelKey: 'chat.node.sqlGenerate',
		icon: 'mdi-code-braces',
	},
	SemanticConsistencyNode: {
		nodeName: 'SemanticConsistencyNode',
		labelKey: 'chat.node.semanticConsistency',
		icon: 'mdi-check-decagram',
	},
	SqlExecuteNode: {
		nodeName: 'SqlExecuteNode',
		labelKey: 'chat.node.sqlExecute',
		icon: 'mdi-database-arrow-right',
	},
	PythonGenerateNode: {
		nodeName: 'PythonGenerateNode',
		labelKey: 'chat.node.pythonGenerate',
		icon: 'mdi-language-python',
	},
	PythonAnalyzeNode: {
		nodeName: 'PythonAnalyzeNode',
		labelKey: 'chat.node.pythonAnalyze',
		icon: 'mdi-chart-line',
	},
	PythonExecuteNode: {
		nodeName: 'PythonExecuteNode',
		labelKey: 'chat.node.pythonExecute',
		icon: 'mdi-play-outline',
	},
	ReportGeneratorNode: {
		nodeName: 'ReportGeneratorNode',
		labelKey: 'chat.node.reportGenerator',
		icon: 'mdi-file-chart-outline',
	},
};

interface TimelineStep {
	stepId: string;
	nodeName: string;
	label: string;
	icon: string;
	attempt: number;
	status: 'pending' | 'active' | 'done';
	contentBlock: GraphNodeResponse[];
	resultSetText?: string;
	expanded: boolean;
	isReport: boolean;
}

const timelineSteps = computed<TimelineStep[]>(() => {
	const groups = groupWorkflowTimeline(props.nodeBlocks);
	if (groups.length === 0) return [];
	const lastIdx = groups.length - 1;

	return groups.map((group, idx) => {
		const { nodeName, stepId, attempt, items: block } = group;
		const def = NODE_LABEL_MAP[nodeName];
		const baseLabel = def ? t(def.labelKey) : nodeName;
		const contentBlock = block.filter(
			(item) => item.textType !== TextType.RESULT_SET,
		);
		const resultSetText = [...block].reverse().find(
			(item) => item.textType === TextType.RESULT_SET && item.text,
		)?.text;
		const isReport = nodeName === 'ReportGeneratorNode';

		let status: 'pending' | 'active' | 'done' = 'pending';
		if (props.completed) {
			status = 'done';
		} else {
			status = idx < lastIdx ? 'done' : 'active';
		}

		return {
			stepId,
			nodeName,
			label:
				attempt > 1
					? t('chat.retryStep', { label: baseLabel, attempt })
					: baseLabel,
			icon: def?.icon || 'mdi-lightning-bolt',
			attempt,
			status,
			contentBlock,
			resultSetText,
			expanded: expandedSteps.value[stepId] ?? getDefaultExpanded(nodeName),
			isReport,
		};
	});
});

function dotColor(status: string): string {
	if (status === 'done') return 'green';
	if (status === 'active') return 'blue-darken-2';
	return 'grey-lighten-1';
}

function dotIcon(status: string): string {
	if (status === 'done') return 'mdi-check';
	if (status === 'active') return 'mdi-dots-horizontal';
	return '';
}

function safeParseJson(content: string): ResultData | null {
	try {
		return JSON.parse(content);
	} catch {
		return null;
	}
}

function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

const timelineRef = ref<HTMLElement | null>(null);
const { renderECharts } = useEchartsRenderer();

const SANITIZE_OPTIONS = {
	ADD_TAGS: ['pre', 'code'],
	ADD_ATTR: ['class'],
	RETURN_TRUSTED_TYPE: false as const,
};

function renderCode(block: GraphNodeResponse[]): string {
	const lang = (block[0]?.textType || 'text').toLowerCase();
	const code = block.map((n) => n.text).join('');
	try {
		const h = hljs.highlight(code, { language: lang });
		return DOMPurify.sanitize(
			`<pre class="tl-code"><code class="hljs ${lang}">${h.value}</code></pre>`,
			SANITIZE_OPTIONS,
		) as string;
	} catch {
		return DOMPurify.sanitize(
			`<pre class="tl-code"><code>${escapeHtml(code)}</code></pre>`,
			SANITIZE_OPTIONS,
		) as string;
	}
}

function tryExtractJson(
	text: string,
): { before: string; json: string; after: string } | null {
	const start = text.indexOf('{');
	const end = text.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) return null;
	const candidate = text.substring(start, end + 1);
	try {
		JSON.parse(candidate);
		return {
			before: text.substring(0, start).trim(),
			json: candidate,
			after: text.substring(end + 1).trim(),
		};
	} catch {
		return null;
	}
}

function renderTextWithJsonDetection(block: GraphNodeResponse[]): string {
	const fullText = block.map((n) => n.text).join('');

	const extracted = tryExtractJson(fullText);
	if (extracted) {
		const parts: string[] = [];
		if (extracted.before) {
			parts.push(
				`<div class="text-body">${escapeHtml(extracted.before).replace(/\n/g, '<br>')}</div>`,
			);
		}
		try {
			const formatted = JSON.stringify(JSON.parse(extracted.json), null, 2);
			const h = hljs.highlight(formatted, { language: 'json' });
			parts.push(
				`<pre class="tl-code"><code class="hljs json">${h.value}</code></pre>`,
			);
		} catch {
			parts.push(
				`<pre class="tl-code"><code>${escapeHtml(extracted.json)}</code></pre>`,
			);
		}
		if (extracted.after) {
			parts.push(
				`<div class="text-body">${escapeHtml(extracted.after).replace(/\n/g, '<br>')}</div>`,
			);
		}
		return DOMPurify.sanitize(parts.join(''), SANITIZE_OPTIONS) as string;
	}

	return DOMPurify.sanitize(
		`<div class="text-body">${escapeHtml(fullText).replace(/\n/g, '<br>')}</div>`,
		SANITIZE_OPTIONS,
	) as string;
}

watch(
	() => props.nodeBlocks,
	() => {
		nextTick(() => renderECharts(timelineRef.value));
	},
	{ deep: true },
);
</script>

<style scoped>
.workflow-timeline {
	width: 100%;
}

/* ── Title bar ───────────────────────────────────────────────────────────────── */
.timeline-title-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	padding: 0 2px;
}

.timeline-title {
	font-size: 15px !important;
	font-weight: 700;
	color: var(--da-primary-heading);
	display: flex;
	align-items: center;
	line-height: 1;
}

.toggle-all-btn {
	font-size: 11px !important;
	text-transform: none !important;
	letter-spacing: 0 !important;
}

/* ── Step header ─────────────────────────────────────────────────────────────── */
.step-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	padding: 2px 0;
	user-select: none;
}

.step-header-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.step-label {
	font-size: 13px;
	font-weight: 600;
	color: var(--da-text-strong);
}

/* ── Badge ───────────────────────────────────────────────────────────────────── */
.step-badge {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 10.5px;
	padding: 2px 7px;
	border-radius: 10px;
}

.step-badge.active {
	background: var(--da-primary-tint);
	color: var(--da-primary-text);
}

.step-badge.done {
	background: var(--da-success-soft);
	color: var(--da-success-text);
}

.badge-dot {
	width: 5px;
	height: 5px;
	background: var(--da-primary-strong);
	border-radius: 50%;
	animation: dotBlink 1s infinite;
}

@keyframes dotBlink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.3;
	}
}

/* ── Step content ────────────────────────────────────────────────────────────── */
.step-content {
	margin-top: 6px;
	font-size: 13px;
	line-height: 1.65;
	color: var(--da-text-strong);
	min-width: 0;
	overflow: hidden;
}

.text-body {
	white-space: pre-wrap;
	word-break: break-word;
}

.is-muted .text-body {
	color: var(--da-text-faint);
	font-style: italic;
}

.report-body {
	color: var(--da-text-strong) !important;
	font-style: normal !important;
}

.report-brief {
	display: flex;
	align-items: center;
	color: var(--da-text-muted) !important;
	font-style: normal !important;
	font-size: 12.5px;
}

:deep(.tl-code) {
	background: var(--da-surface-soft);
	border: 1px solid var(--da-border);
	border-radius: 8px;
	padding: 10px 12px;
	font-size: 12.5px;
	overflow-x: auto;
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	word-break: break-word;
	margin: 4px 0 0;
}

:deep(.tl-code code) {
	white-space: inherit;
	overflow-wrap: inherit;
	word-break: inherit;
}

/* ── Markdown inside step content ────────────────────────────────────────────── */
.md-body :deep(h1),
.md-body :deep(h2),
.md-body :deep(h3) {
	font-weight: 700;
	margin: 10px 0 4px;
}
.md-body :deep(p) {
	margin-bottom: 6px;
}
.md-body :deep(ul),
.md-body :deep(ol) {
	padding-left: 18px;
	margin-bottom: 6px;
}
.md-body :deep(code:not(pre code)) {
	background: var(--da-code-bg);
	border: 1px solid var(--da-border-soft);
	padding: 1px 5px;
	border-radius: 3px;
	font-size: 12px;
	color: var(--da-accent);
}
.md-body :deep(table) {
	width: 100%;
	border-collapse: collapse;
	margin: 6px 0;
	display: block;
	overflow-x: auto;
}
.md-body :deep(thead) {
	display: table-header-group;
}
.md-body :deep(tbody) {
	display: table-row-group;
}
.md-body :deep(tr) {
	display: table-row;
	border-top: 1px solid var(--da-border-strong);
}
.md-body :deep(th) {
	display: table-cell;
	background: var(--da-surface-mute);
	padding: 6px 10px;
	border: 1px solid var(--da-border);
	font-weight: 600;
	font-size: 12px;
}
.md-body :deep(td) {
	display: table-cell;
	padding: 6px 10px;
	border: 1px solid var(--da-border);
	font-size: 12px;
}

/* ── Code block with header ─────────────────────────────────────────────────── */
.md-body :deep(.code-block-wrapper) {
	margin: 8px 0;
	border: 1px solid var(--da-border-soft);
	border-radius: 6px;
	overflow: auto;
	background: var(--da-code-bg);
}
.md-body :deep(.code-block-header) {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: var(--da-code-bg);
	padding: 4px 10px;
	border-bottom: 1px solid var(--da-border-soft);
	font-size: 11px;
}
.md-body :deep(.code-language) {
	color: var(--da-code-label);
	font-weight: 600;
	font-family: 'Monaco', 'Menlo', monospace;
	font-size: 10px;
	text-transform: uppercase;
}
.md-body :deep(.code-copy-button) {
	background: transparent;
	border: 1px solid var(--da-border-strong);
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 10px;
	cursor: pointer;
	transition: all 0.2s;
	color: var(--da-text);
}
.md-body :deep(.code-copy-button:hover) {
	background: var(--da-surface-alt);
	border-color: var(--da-border-strong);
}
.md-body :deep(.code-copy-button.copied) {
	background: var(--da-success);
	border-color: var(--da-success);
	color: var(--da-text-on-dark);
}
.md-body :deep(pre.hljs) {
	margin: 0;
	padding: 8px 10px;
	overflow-x: auto;
	overflow-y: hidden;
	background: var(--da-code-bg);
	font-size: 11px;
	line-height: 1.35;
	white-space: pre;
}
.md-body :deep(pre.hljs code) {
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
	margin: 8px 0;
	border-radius: 6px;
}
</style>
