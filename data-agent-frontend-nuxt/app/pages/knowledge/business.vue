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
		<KnowledgePageHeader
			:title="t('knowledge.business.title')"
			:subtitle="t('knowledge.business.subtitle')"
		>
			<template #actions>
				<v-btn
					class="text-none refresh-btn"
					style="border-color: var(--da-border)"
					variant="outlined"
					prepend-icon="mdi-refresh"
					:loading="loading"
					@click="loadBusinessKnowledge"
				>
					{{ t('knowledge.business.refresh') }}
				</v-btn>
				<v-btn
					color="blue-darken-1"
					prepend-icon="mdi-sync"
					class="text-none px-6"
					elevation="0"
					:loading="refreshLoading"
					@click="handleRefreshVectorStore"
				>
					{{ t('knowledge.business.syncToVector') }}
				</v-btn>
				<v-btn
					color="blue-darken-3"
					prepend-icon="mdi-plus"
					class="text-none px-6"
					elevation="0"
					@click="openCreateDialog"
				>
					{{ t('knowledge.business.addKnowledge') }}
				</v-btn>
			</template>
		</KnowledgePageHeader>

		<!-- 搜索栏 -->
		<v-card variant="flat" border class="rounded-lg mb-4 pa-4">
			<v-text-field
				v-model="searchKeyword"
				:placeholder="t('knowledge.business.searchPlaceholder')"
				prepend-inner-icon="mdi-magnify"
				variant="outlined"
				density="compact"
				clearable
				hide-details
				class="search-field"
				style="max-width: 400px"
				@keyup.enter="loadBusinessKnowledge"
				@click:clear="handleClearSearch"
			/>
		</v-card>

		<!-- 数据表格 -->
		<v-card variant="flat" border class="rounded-lg">
			<v-data-table
				:headers="headers"
				:items="businessKnowledgeList"
				item-value="id"
				hover
				:loading="loading"
				:items-per-page-options="[10, 25, 50]"
			>
				<!-- 向量化状态 -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.embeddingStatus="{ item }">
					<v-chip
						:color="getVectorStatusColor(item.embeddingStatus)"
						size="small"
						variant="tonal"
						class="font-weight-medium"
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
						{{ getVectorStatusLabel(item.embeddingStatus) }}
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

				<!-- 是否召回 -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.isRecall="{ item }">
					<v-chip
						:color="item.isRecall ? 'var(--da-primary-text)' : 'var(--da-text-faint)'"
						size="small"
						variant="tonal"
						class="font-weight-medium"
					>
						<v-icon
							:icon="item.isRecall ? 'mdi-check' : 'mdi-minus'"
							size="14"
							class="mr-1"
						/>
						{{
							item.isRecall
								? t('knowledge.business.recalling')
								: t('knowledge.business.notRecalled')
						}}
					</v-chip>
				</template>

				<!-- 同义词：超长截断 -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.synonyms="{ item }">
					<v-tooltip
						v-if="item.synonyms && item.synonyms.length > 30"
						:text="item.synonyms"
						location="top"
					>
						<template #activator="{ props }">
							<span
								v-bind="props"
								class="text-truncate d-inline-block"
								style="max-width: 160px; cursor: help"
							>
								{{ item.synonyms }}
							</span>
						</template>
					</v-tooltip>
					<span v-else>{{ item.synonyms || '—' }}</span>
				</template>

				<!-- 描述：超长截断 -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.description="{ item }">
					<v-tooltip
						v-if="item.description && item.description.length > 40"
						:text="item.description"
						location="top"
					>
						<template #activator="{ props }">
							<span
								v-bind="props"
								class="text-truncate d-inline-block"
								style="max-width: 200px; cursor: help"
							>
								{{ item.description }}
							</span>
						</template>
					</v-tooltip>
					<span v-else>{{ item.description || '—' }}</span>
				</template>

				<!-- 操作列 -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.actions="{ item }">
					<div class="d-flex ga-1 align-center">
						<v-btn
							size="small"
							variant="text"
							color="var(--da-primary-text)"
							icon="mdi-pencil"
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
							@click="retryEmbedding(item)"
						/>
						<v-btn
							v-if="item.isRecall"
							size="small"
							variant="text"
							color="var(--da-text-muted)"
							icon="mdi-bookmark-off"
							@click="toggleRecall(item, false)"
						>
							<v-tooltip activator="parent" location="top">{{
								t('knowledge.business.disableRecall')
							}}</v-tooltip>
						</v-btn>
						<v-btn
							v-else
							size="small"
							variant="text"
							color="var(--da-primary-text)"
							icon="mdi-bookmark-plus"
							@click="toggleRecall(item, true)"
						>
							<v-tooltip activator="parent" location="top">{{
								t('knowledge.business.enableRecall')
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

				<!-- 空状态 -->
				<template #no-data>
					<div class="d-flex flex-column align-center py-12">
						<v-icon
							icon="mdi-book-open-blank-variant"
							size="64"
							color="blue-lighten-3"
							class="mb-4"
						/>
						<p class="text-body-1 text-medium-emphasis mb-2">
							{{ t('knowledge.business.emptyTitle') }}
						</p>
						<p class="text-body-2 mb-6" style="color: var(--da-text-muted)">
							{{ t('knowledge.business.emptyHint') }}
						</p>
						<v-btn
							color="blue-darken-3"
							prepend-icon="mdi-plus"
							class="text-none"
							elevation="0"
							@click="openCreateDialog"
						>
							{{ t('knowledge.business.addKnowledge') }}
						</v-btn>
					</div>
				</template>
			</v-data-table>
		</v-card>

		<!-- 添加/编辑 Dialog -->
		<v-dialog v-model="dialogVisible" max-width="640" persistent>
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
							? t('knowledge.business.editTitle')
							: t('knowledge.business.createTitle')
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
								{{ t('knowledge.business.fieldTerm') }}
								<span class="text-error">*</span>
							</p>
							<v-text-field
								v-model="knowledgeForm.businessTerm"
								:placeholder="t('knowledge.business.termPlaceholder')"
								variant="outlined"
								density="compact"
								:rules="[(v) => !!v || t('knowledge.business.termRequired')]"
								hide-details="auto"
							/>
						</div>

						<div class="mb-5">
							<p class="text-body-2 font-weight-medium form-label mb-2">
								{{ t('knowledge.business.fieldDescription') }}
								<span class="text-error">*</span>
							</p>
							<v-textarea
								v-model="knowledgeForm.description"
								:placeholder="t('knowledge.business.descriptionPlaceholder')"
								variant="outlined"
								density="compact"
								rows="3"
								:rules="[
									(v) => !!v || t('knowledge.business.descriptionRequired'),
								]"
								hide-details="auto"
							/>
						</div>

						<div class="mb-2">
							<p class="text-body-2 font-weight-medium form-label mb-2">
								{{ t('knowledge.business.fieldSynonyms') }}
							</p>
							<v-textarea
								v-model="knowledgeForm.synonyms"
								:placeholder="t('knowledge.business.synonymsPlaceholder')"
								variant="outlined"
								density="compact"
								rows="2"
								hide-details="auto"
							/>
						</div>
					</v-form>
				</v-card-text>

				<v-divider />

				<v-card-actions class="pa-4 d-flex justify-end ga-2">
					<v-btn
						variant="outlined"
						class="text-none px-6"
						@click="dialogVisible = false"
					>
						{{ t('knowledge.business.cancel') }}
					</v-btn>
					<v-btn
						color="blue-darken-3"
						class="text-none px-6"
						elevation="0"
						:loading="saveLoading"
						@click="saveKnowledge"
					>
						{{
							isEdit
								? t('knowledge.business.saveUpdate')
								: t('knowledge.business.createNow')
						}}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</section>
</template>

<script setup lang="ts">
import businessKnowledgeService, {
	type BusinessKnowledgeVO,
	type CreateBusinessKnowledgeDTO,
	type UpdateBusinessKnowledgeDTO,
} from '~/services/businessKnowledge/index';
import { useCrudPage } from '~/composables/useCrudPage/index';

// ——— 常量 ———
const DEFAULT_AGENT_ID = 0;

// ——— 路由 ———
const route = useRoute();
const agentId = computed(() => Number(route.query.agentId) || DEFAULT_AGENT_ID);

// ——— 全局工具 ———
const { $tip } = useNuxtApp();
const { showConfirm } = useConfirm();
const { t } = useI18n();

// ——— 额外状态 ———
const refreshLoading = ref(false);
const searchKeyword = ref('');
const currentEditId = ref<number | null>(null);
const retryLoadingMap = ref<Record<number, boolean>>({});

// ——— useCrudPage ———
const {
	loading,
	saveLoading,
	items: businessKnowledgeList,
	dialogVisible,
	isEdit,
	formRef,
	formData: knowledgeForm,
	loadItems: loadBusinessKnowledge,
	openCreateDialog: _openCreateDialog,
	openEditDialog,
	closeDialog,
	saveItem,
	deleteItem,
} = useCrudPage<
	BusinessKnowledgeVO,
	CreateBusinessKnowledgeDTO,
	UpdateBusinessKnowledgeDTO
>({
	loadFn: () =>
		businessKnowledgeService.list(
			agentId.value,
			searchKeyword.value || undefined,
		),
	createFn: async (data) => {
		await businessKnowledgeService.create(data);
		return true;
	},
	updateFn: async (id, data) => {
		const r = await businessKnowledgeService.update(id, data);
		return r != null;
	},
	deleteFn: (id) => businessKnowledgeService.delete(id),
	defaultFormFactory: () => ({
		businessTerm: '',
		description: '',
		synonyms: '',
		isRecall: false,
		agentId: agentId.value,
	}),
});

function openCreateDialog() {
	// Ensure agentId is current before opening
	_openCreateDialog();
	knowledgeForm.value.agentId = agentId.value;
}

// ——— 表格列定义 ———
// computed 保证切换语言后表头跟随更新
const headers = computed(() => [
	{ title: t('knowledge.business.col.id'), key: 'id', width: '70px', sortable: true },
	{
		title: t('knowledge.business.col.businessTerm'),
		key: 'businessTerm',
		minWidth: '130px',
	},
	{
		title: t('knowledge.business.col.description'),
		key: 'description',
		minWidth: '180px',
		sortable: false,
	},
	{
		title: t('knowledge.business.col.synonyms'),
		key: 'synonyms',
		minWidth: '160px',
		sortable: false,
	},
	{
		title: t('knowledge.business.col.embeddingStatus'),
		key: 'embeddingStatus',
		width: '140px',
		sortable: false,
	},
	{
		title: t('knowledge.business.col.recallStatus'),
		key: 'isRecall',
		width: '120px',
		sortable: false,
	},
	{
		title: t('knowledge.business.col.createdTime'),
		key: 'createdTime',
		width: '160px',
	},
	{
		title: t('knowledge.business.col.actions'),
		key: 'actions',
		width: '160px',
		sortable: false,
	},
]);

// ——— 工具函数 ———
function getVectorStatusColor(status?: string): string {
	switch (status) {
		case 'COMPLETED':
			return 'success';
		case 'FAILED':
			return 'error';
		case 'PENDING':
			return 'warning';
		case 'PROCESSING':
			return 'var(--da-primary-text)';
		default:
			// 原 color="grey"：浅色视觉等价，深色下跟随文本变量
			return 'var(--da-text-faint)';
	}
}

function getVectorStatusLabel(status?: string): string {
	switch (status) {
		case 'COMPLETED':
			return t('knowledge.business.status.completed');
		case 'FAILED':
			return t('knowledge.business.status.failed');
		case 'PENDING':
			return t('knowledge.business.status.pending');
		case 'PROCESSING':
			return t('knowledge.business.status.processing');
		default:
			return t('knowledge.business.status.unknown');
	}
}

function handleClearSearch() {
	searchKeyword.value = '';
	loadBusinessKnowledge();
}

function editKnowledge(knowledge: BusinessKnowledgeVO) {
	currentEditId.value = knowledge.id ?? null;
	openEditDialog(knowledge);
}

async function saveKnowledge() {
	const createData: CreateBusinessKnowledgeDTO = {
		businessTerm: knowledgeForm.value.businessTerm,
		description: knowledgeForm.value.description,
		synonyms: knowledgeForm.value.synonyms,
		isRecall: knowledgeForm.value.isRecall,
		agentId: agentId.value,
	};
	const updateData: UpdateBusinessKnowledgeDTO = {
		businessTerm: knowledgeForm.value.businessTerm,
		description: knowledgeForm.value.description,
		synonyms: knowledgeForm.value.synonyms,
		agentId: agentId.value,
	};
	const ok = await saveItem(createData, updateData, currentEditId.value);
	if (ok) {
		$tip(
			isEdit.value
				? t('knowledge.business.updateSuccess')
				: t('knowledge.business.createSuccess'),
		);
	} else {
		$tip(
			isEdit.value
				? t('knowledge.business.updateFailedRetry')
				: t('knowledge.business.createFailedRetry'),
			{
				color: 'error',
				icon: 'mdi-alert-circle',
			},
		);
	}
}

function deleteKnowledge(knowledge: BusinessKnowledgeVO) {
	if (!knowledge.id) return;
	showConfirm({
		title: t('knowledge.business.deleteConfirmTitle'),
		message: t('knowledge.business.deleteConfirmMessage', {
			term: knowledge.businessTerm,
		}),
		confirmText: t('knowledge.business.deleteConfirmBtn'),
		icon: 'mdi-delete',
		onConfirm: async () => {
			const ok = await deleteItem(knowledge.id!);
			if (ok) {
				$tip(t('knowledge.business.deleteSuccess'));
			} else {
				$tip(t('knowledge.business.deleteFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

async function toggleRecall(knowledge: BusinessKnowledgeVO, isRecall: boolean) {
	if (!knowledge.id) return;
	try {
		const result = await businessKnowledgeService.recallKnowledge(
			knowledge.id,
			isRecall,
		);
		if (result) {
			$tip(
				isRecall
					? t('knowledge.business.recallEnabled')
					: t('knowledge.business.recallDisabled'),
			);
			knowledge.isRecall = isRecall;
		} else {
			$tip(t('knowledge.business.operationFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} catch {
		$tip(t('knowledge.business.operationFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	}
}

async function retryEmbedding(knowledge: BusinessKnowledgeVO) {
	if (!knowledge.id) return;
	retryLoadingMap.value[knowledge.id] = true;
	try {
		const result = await businessKnowledgeService.retryEmbedding(knowledge.id);
		if (result) {
			$tip(t('knowledge.business.retrySuccess'));
			await loadBusinessKnowledge();
		} else {
			$tip(t('knowledge.business.retryFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} catch {
		$tip(t('knowledge.business.retryFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	} finally {
		retryLoadingMap.value[knowledge.id] = false;
	}
}

function handleRefreshVectorStore() {
	showConfirm({
		title: t('knowledge.business.syncConfirmTitle'),
		message: t('knowledge.business.syncConfirmMessage'),
		confirmText: t('knowledge.business.syncConfirmBtn'),
		icon: 'mdi-sync',
		onConfirm: async () => {
			refreshLoading.value = true;
			try {
				const result =
					await businessKnowledgeService.refreshAllKnowledgeToVectorStore(
						agentId.value.toString(),
					);
				if (result) {
					$tip(t('knowledge.business.syncSuccess'));
				} else {
					$tip(t('knowledge.business.syncFailed'), {
						color: 'error',
						icon: 'mdi-alert-circle',
					});
				}
			} catch {
				$tip(t('knowledge.business.syncFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			} finally {
				refreshLoading.value = false;
			}
		},
	});
}

// ——— 生命周期 ———
onMounted(() => loadBusinessKnowledge());
</script>

<style scoped>
/* 原 bg-white：浅色仍是 #ffffff，深色跟随面板色 */
.refresh-btn {
	background-color: var(--da-surface);
}

/* 原 text-grey-darken-2：浅色视觉等价，深色下提高亮度 */
.form-label {
	color: var(--da-text-muted);
}

/* 覆盖 main.css 里写死的 .search-field 边框色，浅色值完全一致 */
.search-field :deep(.v-field__outline) {
	--v-field-border-color: var(--da-border);
}
</style>
