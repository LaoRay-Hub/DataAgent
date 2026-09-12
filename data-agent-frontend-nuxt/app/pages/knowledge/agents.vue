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
	<section class="page-shell">
		<header class="d-flex align-center justify-space-between mb-8">
			<div>
				<h1
					class="text-h4 font-weight-bold mb-1"
					style="color: var(--da-primary-heading)"
				>
					{{ t('agentKnowledge.pageTitle') }}
				</h1>
				<p class="text-body-2 text-medium-emphasis">
					{{ t('agentKnowledge.pageSubtitle') }}
				</p>
			</div>
			<div class="d-flex ga-3">
				<v-btn
					class="text-none refresh-btn"
					variant="outlined"
					prepend-icon="mdi-refresh"
					:loading="loading"
					@click="loadKnowledgeList"
				>
					{{ t('agentKnowledge.refresh') }}
				</v-btn>
				<v-btn
					:color="filterVisible ? 'var(--da-primary-text)' : 'var(--da-text-muted)'"
					prepend-icon="mdi-filter-variant"
					class="text-none px-6"
					elevation="0"
					@click="toggleFilter"
				>
					{{ t('agentKnowledge.filter') }}
				</v-btn>
				<v-btn
					color="blue-darken-3"
					prepend-icon="mdi-plus"
					class="text-none px-6"
					elevation="0"
					@click="openCreateDialog"
				>
					{{ t('agentKnowledge.addKnowledge') }}
				</v-btn>
			</div>
		</header>

		<v-card variant="flat" border class="rounded-lg mb-4 pa-4">
			<div class="d-flex flex-wrap ga-3 align-center">
				<v-text-field
					v-model="queryParams.title"
					:placeholder="t('agentKnowledge.searchPlaceholder')"
					prepend-inner-icon="mdi-magnify"
					variant="outlined"
					density="compact"
					clearable
					hide-details
					class="search-field"
					style="max-width: 420px"
					@keyup.enter="handleSearch"
					@click:clear="handleSearch"
				/>
				<v-spacer />
				<v-chip variant="flat" class="font-weight-medium total-chip">
					{{ t('agentKnowledge.totalCount', { count: total }) }}
				</v-chip>
			</div>

			<v-expand-transition>
				<div
					v-show="filterVisible"
					class="mt-4 pt-4"
					style="border-top: 1px solid var(--da-border)"
				>
					<div class="d-flex flex-wrap ga-3">
						<v-select
							v-model="queryParams.type"
							:label="t('agentKnowledge.knowledgeType')"
							:items="knowledgeTypeOptions"
							item-title="label"
							item-value="value"
							variant="outlined"
							density="compact"
							clearable
							hide-details
							style="max-width: 180px"
							@update:model-value="handleSearch"
						/>
						<v-select
							v-model="queryParams.embeddingStatus"
							:label="t('agentKnowledge.processStatus')"
							:items="embeddingStatusOptions"
							item-title="label"
							item-value="value"
							variant="outlined"
							density="compact"
							clearable
							hide-details
							style="max-width: 180px"
							@update:model-value="handleSearch"
						/>
						<v-btn
							variant="outlined"
							prepend-icon="mdi-filter-off"
							class="text-none"
							@click="clearFilters"
						>
							{{ t('agentKnowledge.clearFilters') }}
						</v-btn>
					</div>
				</div>
			</v-expand-transition>
		</v-card>

		<v-card variant="flat" border class="rounded-lg">
			<v-data-table
				:headers="headers"
				:items="knowledgeList"
				item-value="id"
				hover
				:loading="loading"
				hide-default-footer
			>
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.type="{ item }">
					<v-chip size="small" variant="tonal" :color="getTypeColor(item.type)">
						{{ getTypeLabel(item.type) }}
					</v-chip>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.embeddingStatus="{ item }">
					<v-chip
						size="small"
						variant="tonal"
						:color="getEmbeddingStatusColor(item.embeddingStatus)"
					>
						<v-icon
							v-if="item.embeddingStatus === 'FAILED'"
							icon="mdi-alert-circle"
							size="14"
							class="mr-1"
						/>
						<v-icon
							v-else-if="item.embeddingStatus === 'COMPLETED'"
							icon="mdi-check-circle"
							size="14"
							class="mr-1"
						/>
						<v-icon
							v-else-if="item.embeddingStatus === 'PROCESSING'"
							icon="mdi-loading mdi-spin"
							size="14"
							class="mr-1"
						/>
						{{ getStatusLabel(item.embeddingStatus) }}
					</v-chip>
					<v-tooltip
						v-if="item.embeddingStatus === 'FAILED' && item.errorMsg"
						:text="item.errorMsg"
						location="top"
					>
						<template #activator="{ props }">
							<v-icon
								v-bind="props"
								icon="mdi-information-outline"
								size="16"
								color="error"
								class="ml-1 cursor-pointer"
							/>
						</template>
					</v-tooltip>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.isRecall="{ item }">
					<v-chip
						:color="item.isRecall ? 'var(--da-primary-text)' : 'var(--da-text-faint)'"
						size="small"
						variant="tonal"
					>
						{{
							item.isRecall
								? t('agentKnowledge.recallOn')
								: t('agentKnowledge.recallOff')
						}}
					</v-chip>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.actions="{ item }">
					<div class="d-flex ga-1 align-center">
						<v-btn
							size="small"
							variant="text"
							color="var(--da-primary-text)"
							icon="mdi-cog"
							@click="editKnowledge(item)"
						/>
						<v-btn
							v-if="item.embeddingStatus === 'FAILED'"
							size="small"
							variant="text"
							color="orange-darken-1"
							icon="mdi-reload"
							:loading="
								item.id !== undefined ? retryLoadingMap[item.id] : false
							"
							@click="handleRetry(item)"
						/>
						<v-btn
							size="small"
							variant="text"
							:color="item.isRecall ? 'var(--da-text-muted)' : 'var(--da-primary-text)'"
							:icon="item.isRecall ? 'mdi-bookmark-off' : 'mdi-bookmark-plus'"
							@click="toggleStatus(item)"
						>
							<v-tooltip activator="parent" location="top">{{
								item.isRecall
									? t('agentKnowledge.cancelRecall')
									: t('agentKnowledge.setRecall')
							}}</v-tooltip>
						</v-btn>
						<v-btn
							size="small"
							variant="text"
							color="red-darken-1"
							icon="mdi-delete"
							@click="deleteKnowledge(item)"
						/>
					</div>
				</template>

				<template #no-data>
					<div class="d-flex flex-column align-center py-12">
						<v-icon
							icon="mdi-brain"
							size="64"
							color="var(--da-primary-lighter)"
							class="mb-4"
						/>
						<p class="text-body-1 text-medium-emphasis mb-2">
							{{ t('agentKnowledge.emptyTitle') }}
						</p>
						<p class="text-body-2 mb-6" style="color: var(--da-text-muted)">
							{{ t('agentKnowledge.emptyHint') }}
						</p>
						<v-btn
							color="blue-darken-3"
							prepend-icon="mdi-plus"
							class="text-none"
							elevation="0"
							@click="openCreateDialog"
						>
							{{ t('agentKnowledge.addKnowledge') }}
						</v-btn>
					</div>
				</template>
			</v-data-table>

			<div
				class="d-flex align-center justify-end ga-4 px-4 py-4"
				style="border-top: 1px solid var(--da-border)"
			>
				<v-select
					:model-value="queryParams.pageSize"
					:items="[10, 20, 50, 100]"
					variant="outlined"
					density="compact"
					hide-details
					style="max-width: 120px"
					@update:model-value="handleSizeChange"
				/>
				<v-pagination
					:model-value="queryParams.pageNum"
					:length="totalPages"
					density="comfortable"
					color="var(--da-primary-text)"
					@update:model-value="handleCurrentChange"
				/>
			</div>
		</v-card>

		<v-dialog v-model="dialogVisible" max-width="820" persistent>
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center pa-6 pb-4">
					<v-icon
						:icon="isEdit ? 'mdi-pencil-circle' : 'mdi-plus-circle'"
						color="blue-darken-2"
						class="mr-3"
						size="28"
					/>
					<span class="text-h6 font-weight-bold">{{
						isEdit
							? t('agentKnowledge.editTitle')
							: t('agentKnowledge.createTitle')
					}}</span>
					<v-spacer />
					<v-btn
						icon="mdi-close"
						variant="text"
						size="small"
						@click="closeDialog"
					/>
				</v-card-title>
				<v-divider />

				<v-card-text class="pa-6">
					<v-form ref="formRef">
						<div class="mb-5">
							<p class="text-body-2 font-weight-medium form-label mb-2">
								{{ t('agentKnowledge.knowledgeType') }}
								<span class="text-error">*</span>
							</p>
							<v-select
								v-model="knowledgeForm.type"
								:items="knowledgeTypeOptions"
								item-title="label"
								item-value="value"
								:placeholder="t('agentKnowledge.selectTypePlaceholder')"
								variant="outlined"
								density="compact"
								:disabled="isEdit"
								:rules="[(v) => !!v || t('agentKnowledge.typeRequired')]"
								hide-details="auto"
								@update:model-value="handleTypeChange"
							/>
						</div>

						<v-alert
							v-if="knowledgeForm.type === 'QA'"
							type="info"
							variant="tonal"
							density="compact"
							class="mb-4"
						>
							{{ t('agentKnowledge.qaAlert') }}
						</v-alert>
						<v-alert
							v-if="knowledgeForm.type === 'FAQ'"
							type="info"
							variant="tonal"
							density="compact"
							class="mb-4"
						>
							{{ t('agentKnowledge.faqAlert') }}
						</v-alert>
						<v-alert
							v-if="knowledgeForm.type === 'DOCUMENT'"
							type="info"
							variant="tonal"
							density="compact"
							class="mb-4"
						>
							{{ t('agentKnowledge.documentAlert') }}
						</v-alert>

						<div class="mb-5">
							<p class="text-body-2 font-weight-medium form-label mb-2">
								{{ t('agentKnowledge.knowledgeTitle') }}
								<span class="text-error">*</span>
							</p>
							<v-text-field
								v-model="knowledgeForm.title"
								:placeholder="t('agentKnowledge.titlePlaceholder')"
								variant="outlined"
								density="compact"
								:rules="[(v) => !!v?.trim() || t('agentKnowledge.titleRequired')]"
								hide-details="auto"
							/>
						</div>

						<div v-if="knowledgeForm.type === 'DOCUMENT'" class="mb-5">
							<p
								v-if="!isEdit"
								class="text-body-2 font-weight-medium form-label mb-2"
							>
								{{ t('agentKnowledge.splitterStrategy') }}
							</p>
							<v-select
								v-if="!isEdit"
								v-model="knowledgeForm.splitterType"
								:items="splitterTypeOptions"
								item-title="label"
								item-value="value"
								variant="outlined"
								density="compact"
								hide-details
							/>

							<v-file-input
								v-if="!isEdit"
								v-model="selectedFile"
								:label="t('agentKnowledge.uploadFile')"
								variant="outlined"
								density="compact"
								prepend-icon="mdi-paperclip"
								accept=".pdf,.doc,.docx,.txt,.md"
								show-size
								class="mt-4"
								hide-details="auto"
								@update:model-value="handleFileChange"
							/>

							<v-alert v-else type="info" variant="tonal" density="compact">
								{{ t('agentKnowledge.documentEditAlert') }}
							</v-alert>
						</div>

						<template
							v-if="knowledgeForm.type === 'QA' || knowledgeForm.type === 'FAQ'"
						>
							<div class="mb-5">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('agentKnowledge.questionLabel') }}
									<span class="text-error">*</span>
								</p>
								<v-textarea
									v-model="knowledgeForm.question"
									:placeholder="t('agentKnowledge.questionPlaceholder')"
									variant="outlined"
									density="compact"
									rows="2"
									:rules="[
										(v) =>
											knowledgeForm.type === 'QA' ||
											knowledgeForm.type === 'FAQ'
												? !!v?.trim() || t('agentKnowledge.questionRequired')
												: true,
									]"
									hide-details="auto"
								/>
							</div>
							<div class="mb-2">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('agentKnowledge.answerLabel') }}
									<span class="text-error">*</span>
								</p>
								<v-textarea
									v-model="knowledgeForm.answer"
									:placeholder="t('agentKnowledge.answerPlaceholder')"
									variant="outlined"
									density="compact"
									rows="5"
									:rules="[
										(v) =>
											knowledgeForm.type === 'QA' ||
											knowledgeForm.type === 'FAQ'
												? !!v?.trim() || t('agentKnowledge.answerRequired')
												: true,
									]"
									hide-details="auto"
								/>
							</div>
						</template>
					</v-form>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4 d-flex justify-end ga-2">
					<v-btn variant="outlined" class="text-none px-6" @click="closeDialog">{{
						t('agentKnowledge.cancel')
					}}</v-btn>
					<v-btn
						color="blue-darken-3"
						class="text-none px-6"
						elevation="0"
						:loading="saveLoading"
						@click="saveKnowledge"
					>
						{{
							isEdit
								? t('agentKnowledge.saveUpdate')
								: t('agentKnowledge.addAndProcess')
						}}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</section>
</template>

<script setup lang="ts">
import agentKnowledgeService, {
	type AgentKnowledge,
	type AgentKnowledgeQueryDTO,
} from '~/services/agentKnowledge/index';
import agentService from '~/services/agent/index';
import { useCrudPage } from '~/composables/useCrudPage/index';

interface KnowledgeForm extends AgentKnowledge {
	answer?: string;
	splitterType?: string;
}

const { t } = useI18n();

const DEFAULT_AGENT_ID = 0;
const route = useRoute();
const agentId = ref<number>(DEFAULT_AGENT_ID);

async function resolveAgentId() {
	const routeAgentId = Number(route.query.agentId);
	if (Number.isFinite(routeAgentId) && routeAgentId > 0) {
		agentId.value = routeAgentId;
		return;
	}
	try {
		const agents = await agentService.list();
		const fallbackId = agents.find((item) => item.id && item.id > 0)?.id;
		agentId.value = fallbackId ?? DEFAULT_AGENT_ID;
	} catch {
		agentId.value = DEFAULT_AGENT_ID;
	}
}

const { $tip } = useNuxtApp();
const { showConfirm } = useConfirm();

// ——— 额外状态 ———
const filterVisible = ref(false);
const total = ref(0);
const currentEditId = ref<number | null>(null);
const selectedFile = ref<File | null>(null);
const retryLoadingMap = ref<Record<number, boolean>>({});

const queryParams = reactive<AgentKnowledgeQueryDTO>({
	agentId: agentId.value,
	title: '',
	type: '',
	embeddingStatus: '',
	pageNum: 1,
	pageSize: 10,
});

const totalPages = computed(() => {
	const pageSize = queryParams.pageSize || 10;
	return Math.max(1, Math.ceil(total.value / pageSize));
});

// ——— useCrudPage ———
const {
	loading,
	saveLoading,
	items: knowledgeList,
	dialogVisible,
	isEdit,
	formRef,
	formData: knowledgeForm,
	openCreateDialog: _openCreateDialog,
	openEditDialog,
	closeDialog,
} = useCrudPage<KnowledgeForm>({
	loadFn: async () => {
		queryParams.agentId = agentId.value;
		const result = await agentKnowledgeService.queryByPage({
			...queryParams,
			type: queryParams.type || '',
			embeddingStatus: queryParams.embeddingStatus || '',
		});
		if (result.success) {
			total.value = result.total || 0;
			return result.data || [];
		}
		$tip(result.message || t('agentKnowledge.loadFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
		return [];
	},
	defaultFormFactory: () => ({
		agentId: agentId.value,
		title: '',
		content: '',
		type: 'DOCUMENT',
		isRecall: true,
		question: '',
		answer: '',
		splitterType: 'recursive',
	}),
});

async function loadKnowledgeList() {
	// Delegate to useCrudPage's loadItems — re-create wrapper since loadFn is dynamic
	queryParams.agentId = agentId.value;
	loading.value = true;
	try {
		const result = await agentKnowledgeService.queryByPage({
			...queryParams,
			type: queryParams.type || '',
			embeddingStatus: queryParams.embeddingStatus || '',
		});
		if (result.success) {
			knowledgeList.value = result.data || [];
			total.value = result.total || 0;
		} else {
			$tip(result.message || t('agentKnowledge.loadFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} catch {
		$tip(t('agentKnowledge.loadFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	} finally {
		loading.value = false;
	}
}

function openCreateDialog() {
	_openCreateDialog();
	knowledgeForm.value.agentId = agentId.value;
	selectedFile.value = null;
}

// computed 保证切换语言后表头与下拉选项跟随更新
const headers = computed(() => [
	{ title: t('agentKnowledge.colTitle'), key: 'title', minWidth: '170px' },
	{
		title: t('agentKnowledge.colType'),
		key: 'type',
		width: '110px',
		sortable: false,
	},
	{
		title: t('agentKnowledge.colStatus'),
		key: 'embeddingStatus',
		width: '150px',
		sortable: false,
	},
	{
		title: t('agentKnowledge.colRecall'),
		key: 'isRecall',
		width: '110px',
		sortable: false,
	},
	{
		title: t('agentKnowledge.colCreatedTime'),
		key: 'createdTime',
		width: '170px',
	},
	{
		title: t('agentKnowledge.colActions'),
		key: 'actions',
		width: '170px',
		sortable: false,
	},
]);

const knowledgeTypeOptions = computed(() => [
	{ label: t('agentKnowledge.typeDocument'), value: 'DOCUMENT' },
	{ label: t('agentKnowledge.typeQA'), value: 'QA' },
	{ label: t('agentKnowledge.typeFAQ'), value: 'FAQ' },
]);

const embeddingStatusOptions = computed(() => [
	{ label: t('agentKnowledge.statusCompleted'), value: 'COMPLETED' },
	{ label: t('agentKnowledge.statusProcessing'), value: 'PROCESSING' },
	{ label: t('agentKnowledge.statusFailed'), value: 'FAILED' },
	{ label: t('agentKnowledge.statusPending'), value: 'PENDING' },
]);

const splitterTypeOptions = computed(() => [
	{ label: t('agentKnowledge.splitterToken'), value: 'token' },
	{ label: t('agentKnowledge.splitterRecursive'), value: 'recursive' },
	{ label: t('agentKnowledge.splitterSentence'), value: 'sentence' },
	{ label: t('agentKnowledge.splitterParagraph'), value: 'paragraph' },
	{ label: t('agentKnowledge.splitterSemantic'), value: 'semantic' },
]);

function getTypeLabel(type?: string) {
	switch (type) {
		case 'DOCUMENT':
			return t('agentKnowledge.typeDocument');
		case 'QA':
			return t('agentKnowledge.typeQA');
		case 'FAQ':
			return t('agentKnowledge.typeFAQ');
		default:
			return type || t('agentKnowledge.unknown');
	}
}

function getStatusLabel(status?: string) {
	switch (status) {
		case 'COMPLETED':
			return t('agentKnowledge.statusCompleted');
		case 'PROCESSING':
			return t('agentKnowledge.statusProcessing');
		case 'FAILED':
			return t('agentKnowledge.statusFailed');
		case 'PENDING':
			return t('agentKnowledge.statusPending');
		default:
			return status || t('agentKnowledge.unknown');
	}
}

function getTypeColor(type?: string) {
	switch (type) {
		case 'DOCUMENT':
			return 'var(--da-primary-text)';
		case 'QA':
			return 'indigo';
		case 'FAQ':
			return 'cyan-darken-1';
		default:
			return 'var(--da-text-faint)';
	}
}

function getEmbeddingStatusColor(status?: string) {
	switch (status) {
		case 'COMPLETED':
			return 'success';
		case 'PROCESSING':
			return 'var(--da-primary-text)';
		case 'FAILED':
			return 'error';
		case 'PENDING':
			return 'warning';
		default:
			return 'var(--da-text-faint)';
	}
}

function toggleFilter() {
	filterVisible.value = !filterVisible.value;
}

function clearFilters() {
	queryParams.type = '';
	queryParams.embeddingStatus = '';
	handleSearch();
}

function handleSearch() {
	queryParams.pageNum = 1;
	loadKnowledgeList();
}

function handleSizeChange(val: number | string | null) {
	queryParams.pageSize = Number(val) || 10;
	queryParams.pageNum = 1;
	loadKnowledgeList();
}

function handleCurrentChange(val: number) {
	queryParams.pageNum = val;
	loadKnowledgeList();
}

function handleTypeChange() {
	knowledgeForm.value.content = '';
	knowledgeForm.value.question = '';
	knowledgeForm.value.answer = '';
	selectedFile.value = null;
}

function handleFileChange(file: File | File[] | null) {
	if (Array.isArray(file)) {
		selectedFile.value = file[0] || null;
		return;
	}
	selectedFile.value = file;
}

function editKnowledge(knowledge: AgentKnowledge) {
	currentEditId.value = knowledge.id ?? null;
	openEditDialog({
		...knowledge,
		answer:
			knowledge.type === 'QA' || knowledge.type === 'FAQ'
				? knowledge.content
				: '',
		splitterType: 'recursive',
	});
}

function toggleStatus(knowledge: AgentKnowledge) {
	if (!knowledge.id) return;
	const nextRecallStatus = !knowledge.isRecall;
	showConfirm({
		title: t('agentKnowledge.statusConfirmTitle'),
		message: nextRecallStatus
			? t('agentKnowledge.setRecallConfirm', { title: knowledge.title ?? '' })
			: t('agentKnowledge.cancelRecallConfirm', { title: knowledge.title ?? '' }),
		confirmText: t('agentKnowledge.confirm'),
		onConfirm: async () => {
			const result = await agentKnowledgeService.updateRecallStatus(
				knowledge.id!,
				nextRecallStatus,
			);
			if (result) {
				knowledge.isRecall = nextRecallStatus;
				$tip(
					nextRecallStatus
						? t('agentKnowledge.setRecallSuccess')
						: t('agentKnowledge.cancelRecallSuccess'),
				);
			} else {
				$tip(t('agentKnowledge.operationFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

async function handleRetry(knowledge: AgentKnowledge) {
	if (!knowledge.id) return;
	retryLoadingMap.value[knowledge.id] = true;
	try {
		const success = await agentKnowledgeService.retryEmbedding(knowledge.id);
		if (success) {
			$tip(t('agentKnowledge.retrySent'));
			await loadKnowledgeList();
		} else {
			$tip(t('agentKnowledge.retryFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} catch {
		$tip(t('agentKnowledge.retryFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	} finally {
		retryLoadingMap.value[knowledge.id] = false;
	}
}

function deleteKnowledge(knowledge: AgentKnowledge) {
	if (!knowledge.id) return;
	showConfirm({
		title: t('agentKnowledge.deleteConfirmTitle'),
		message: t('agentKnowledge.deleteConfirmMessage', {
			title: knowledge.title ?? '',
		}),
		confirmText: t('agentKnowledge.deleteConfirmText'),
		icon: 'mdi-delete',
		onConfirm: async () => {
			const result = await agentKnowledgeService.delete(knowledge.id!);
			if (result) {
				$tip(t('agentKnowledge.deleteSuccess'));
				await loadKnowledgeList();
			} else {
				$tip(t('agentKnowledge.deleteFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

async function saveKnowledge() {
	const validateResult = await formRef.value?.validate();
	const valid = validateResult?.valid;
	if (!valid) return;

	if (
		knowledgeForm.value.type === 'DOCUMENT' &&
		!isEdit.value &&
		!selectedFile.value
	) {
		$tip(t('agentKnowledge.pleaseUploadFile'), { color: 'warning' });
		return;
	}
	if (
		(knowledgeForm.value.type === 'QA' || knowledgeForm.value.type === 'FAQ') &&
		!knowledgeForm.value.question?.trim()
	) {
		$tip(t('agentKnowledge.pleaseInputQuestion'), { color: 'warning' });
		return;
	}
	if (
		(knowledgeForm.value.type === 'QA' || knowledgeForm.value.type === 'FAQ') &&
		!knowledgeForm.value.answer?.trim()
	) {
		$tip(t('agentKnowledge.pleaseInputAnswer'), { color: 'warning' });
		return;
	}

	saveLoading.value = true;
	try {
		if (isEdit.value && currentEditId.value) {
			const updateData = {
				...knowledgeForm.value,
				type: knowledgeForm.value.type?.toUpperCase(),
				content:
					knowledgeForm.value.type === 'QA' ||
					knowledgeForm.value.type === 'FAQ'
						? knowledgeForm.value.answer
						: knowledgeForm.value.content,
			};
			const result = await agentKnowledgeService.update(
				currentEditId.value,
				updateData,
			);
			if (result) {
				$tip(t('agentKnowledge.updateSuccess'));
			} else {
				$tip(t('agentKnowledge.updateFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
				return;
			}
		} else {
			const fd = new FormData();
			fd.append('agentId', String(agentId.value));
			fd.append('title', knowledgeForm.value.title || '');
			fd.append('type', knowledgeForm.value.type || 'DOCUMENT');
			fd.append('isRecall', knowledgeForm.value.isRecall ? '1' : '0');
			if (knowledgeForm.value.type === 'DOCUMENT' && selectedFile.value) {
				fd.append('file', selectedFile.value);
				if (knowledgeForm.value.splitterType) {
					fd.append('splitterType', knowledgeForm.value.splitterType);
				}
			} else {
				fd.append('question', knowledgeForm.value.question || '');
				fd.append('content', knowledgeForm.value.answer || '');
			}
			const result = await agentKnowledgeService.createWithFile(fd);
			if (result.success) {
				$tip(t('agentKnowledge.createSuccess'));
			} else {
				$tip(result.message || t('agentKnowledge.createFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
				return;
			}
		}
		closeDialog();
		await loadKnowledgeList();
	} catch {
		$tip(
			isEdit.value
				? t('agentKnowledge.updateFailed')
				: t('agentKnowledge.createFailed'),
			{
				color: 'error',
				icon: 'mdi-alert-circle',
			},
		);
	} finally {
		saveLoading.value = false;
	}
}

onMounted(async () => {
	await resolveAgentId();
	queryParams.agentId = agentId.value;
	knowledgeForm.value.agentId = agentId.value;
	await loadKnowledgeList();
});
</script>

<style scoped>
/* 表单必填项标签：浅色对应原 text-grey-darken-2，深色跟随语义变量 */
.form-label {
	color: var(--da-text-body);
}

/* 顶部 outlined 刷新按钮：浅色对应原 bg-white + #e2e8f0 边框 */
.refresh-btn {
	background: var(--da-surface);
	border-color: var(--da-border);
}

/* 总数 chip：浅色对应原 blue-lighten-5 浅蓝底 + 深色文字 */
.total-chip {
	background: var(--da-primary-wash);
	color: var(--da-text);
}
</style>
