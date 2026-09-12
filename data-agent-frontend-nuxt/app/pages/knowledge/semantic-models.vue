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
			:title="t('knowledge.semantic.title')"
			:subtitle="t('knowledge.semantic.subtitle')"
		>
			<template #actions>
				<v-btn
					class="text-none refresh-btn"
					style="border-color: var(--da-border)"
					variant="outlined"
					prepend-icon="mdi-refresh"
					:loading="loading"
					@click="loadSemanticModels"
				>
					{{ t('knowledge.semantic.refresh') }}
				</v-btn>
				<v-btn
					color="blue-darken-1"
					prepend-icon="mdi-upload"
					class="text-none px-6"
					elevation="0"
					@click="openBatchImportDialog"
				>
					{{ t('knowledge.semantic.batchImport') }}
				</v-btn>
				<v-btn
					color="blue-darken-3"
					prepend-icon="mdi-plus"
					class="text-none px-6"
					elevation="0"
					@click="openCreateDialog"
				>
					{{ t('knowledge.semantic.addModel') }}
				</v-btn>
			</template>
		</KnowledgePageHeader>

		<v-card variant="flat" border class="rounded-lg mb-4 pa-4">
			<div class="d-flex flex-wrap ga-3 align-center">
				<v-text-field
					v-model="searchKeyword"
					:placeholder="t('knowledge.semantic.searchPlaceholder')"
					prepend-inner-icon="mdi-magnify"
					variant="outlined"
					density="compact"
					clearable
					hide-details
					class="search-field"
					style="max-width: 420px"
					@keyup.enter="loadSemanticModels"
					@click:clear="loadSemanticModels"
				/>
				<v-btn
					v-if="selectedModelIds.length > 0"
					variant="tonal"
					color="red-darken-1"
					prepend-icon="mdi-delete"
					class="text-none"
					@click="batchDeleteModels"
				>
					{{
						t('knowledge.semantic.batchDelete', {
							count: selectedModelIds.length,
						})
					}}
				</v-btn>
				<v-spacer />
				<v-chip variant="flat" class="font-weight-medium count-chip">
					{{
						t('knowledge.semantic.totalCount', {
							count: semanticModelList.length,
						})
					}}
				</v-chip>
			</div>
		</v-card>

		<v-card variant="flat" border class="rounded-lg">
			<v-data-table
				v-model="selectedModelIds"
				:headers="headers"
				:items="semanticModelList"
				item-value="id"
				hover
				:loading="loading"
				show-select
			>
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.status="{ item }">
					<v-chip
						:color="item.status === 1 ? 'success' : 'var(--da-text-faint)'"
						size="small"
						variant="tonal"
					>
						{{
							item.status === 1
								? t('knowledge.semantic.statusEnabled')
								: t('knowledge.semantic.statusDisabled')
						}}
					</v-chip>
				</template>

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
								style="max-width: 180px; cursor: help"
							>
								{{ item.synonyms }}
							</span>
						</template>
					</v-tooltip>
					<span v-else>{{ item.synonyms || '—' }}</span>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.createdTime="{ item }">
					{{ formatDateTime(item.createdTime || item.updateTime) }}
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.actions="{ item }">
					<div class="d-flex ga-1 align-center">
						<v-btn
							size="small"
							variant="text"
							color="var(--da-primary-text)"
							icon="mdi-pencil"
							@click="editModel(item)"
						/>
						<v-btn
							size="small"
							variant="text"
							:color="item.status === 1 ? 'orange-darken-1' : 'success'"
							:icon="item.status === 1 ? 'mdi-pause-circle' : 'mdi-play-circle'"
							@click="toggleStatus(item, item.status === 1 ? 0 : 1)"
						>
							<v-tooltip activator="parent" location="top">{{
								item.status === 1
									? t('knowledge.semantic.actionDisable')
									: t('knowledge.semantic.actionEnable')
							}}</v-tooltip>
						</v-btn>
						<v-btn
							size="small"
							variant="text"
							color="red-darken-1"
							icon="mdi-delete"
							@click="deleteModel(item)"
						/>
					</div>
				</template>

				<template #no-data>
					<div class="d-flex flex-column align-center py-12">
						<v-icon
							icon="mdi-vector-intersection"
							size="64"
							color="blue-lighten-3"
							class="mb-4"
						/>
						<p class="text-body-1 text-medium-emphasis mb-2">
							{{ t('knowledge.semantic.emptyTitle') }}
						</p>
						<p class="text-body-2 mb-6" style="color: var(--da-text-muted)">
							{{ t('knowledge.semantic.emptyHint') }}
						</p>
						<v-btn
							color="blue-darken-3"
							prepend-icon="mdi-plus"
							class="text-none"
							elevation="0"
							@click="openCreateDialog"
						>
							{{ t('knowledge.semantic.addModel') }}
						</v-btn>
					</div>
				</template>
			</v-data-table>
		</v-card>

		<v-dialog v-model="dialogVisible" max-width="760" persistent>
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
							? t('knowledge.semantic.editTitle')
							: t('knowledge.semantic.createTitle')
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
						<v-row>
							<v-col cols="12" md="6">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('knowledge.semantic.fieldTableName') }}
									<span class="text-error">*</span>
								</p>
								<v-text-field
									v-model="modelForm.tableName"
									:placeholder="t('knowledge.semantic.tableNamePlaceholder')"
									variant="outlined"
									density="compact"
									:rules="[
										(v) => !!v || t('knowledge.semantic.tableNameRequired'),
									]"
									hide-details="auto"
								/>
							</v-col>
							<v-col cols="12" md="6">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('knowledge.semantic.fieldColumnName') }}
									<span class="text-error">*</span>
								</p>
								<v-text-field
									v-model="modelForm.columnName"
									:placeholder="t('knowledge.semantic.columnNamePlaceholder')"
									variant="outlined"
									density="compact"
									:rules="[
										(v) => !!v || t('knowledge.semantic.columnNameRequired'),
									]"
									hide-details="auto"
								/>
							</v-col>
							<v-col cols="12" md="6">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('knowledge.semantic.fieldBusinessName') }}
									<span class="text-error">*</span>
								</p>
								<v-text-field
									v-model="modelForm.businessName"
									:placeholder="
										t('knowledge.semantic.businessNamePlaceholder')
									"
									variant="outlined"
									density="compact"
									:rules="[
										(v) => !!v || t('knowledge.semantic.businessNameRequired'),
									]"
									hide-details="auto"
								/>
							</v-col>
							<v-col cols="12" md="6">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('knowledge.semantic.fieldDataType') }}
									<span class="text-error">*</span>
								</p>
								<v-text-field
									v-model="modelForm.dataType"
									:placeholder="t('knowledge.semantic.dataTypePlaceholder')"
									variant="outlined"
									density="compact"
									:rules="[
										(v) => !!v || t('knowledge.semantic.dataTypeRequired'),
									]"
									hide-details="auto"
								/>
							</v-col>
							<v-col cols="12">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('knowledge.semantic.fieldSynonyms') }}
								</p>
								<v-textarea
									v-model="modelForm.synonyms"
									:placeholder="t('knowledge.semantic.synonymsPlaceholder')"
									variant="outlined"
									density="compact"
									rows="2"
									hide-details="auto"
								/>
							</v-col>
							<v-col cols="12">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('knowledge.semantic.fieldBusinessDescription') }}
								</p>
								<v-textarea
									v-model="modelForm.businessDescription"
									:placeholder="
										t('knowledge.semantic.businessDescriptionPlaceholder')
									"
									variant="outlined"
									density="compact"
									rows="3"
									hide-details="auto"
								/>
							</v-col>
							<v-col cols="12">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('knowledge.semantic.fieldColumnComment') }}
								</p>
								<v-textarea
									v-model="modelForm.columnComment"
									:placeholder="
										t('knowledge.semantic.columnCommentPlaceholder')
									"
									variant="outlined"
									density="compact"
									rows="2"
									hide-details="auto"
								/>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4 d-flex justify-end ga-2">
					<v-btn variant="outlined" class="text-none px-6" @click="closeDialog">{{
						t('knowledge.semantic.cancel')
					}}</v-btn>
					<v-btn
						color="blue-darken-3"
						class="text-none px-6"
						elevation="0"
						:loading="saveLoading"
						@click="saveModel"
					>
						{{
							isEdit
								? t('knowledge.semantic.saveUpdate')
								: t('knowledge.semantic.createNow')
						}}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="batchImportDialogVisible" max-width="760">
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center pa-6 pb-4">
					<v-icon
						icon="mdi-upload"
						color="blue-darken-2"
						class="mr-3"
						size="28"
					/>
					<span class="text-h6 font-weight-bold">{{
						t('knowledge.semantic.importTitle')
					}}</span>
					<v-spacer />
					<v-btn
						icon="mdi-close"
						variant="text"
						size="small"
						@click="batchImportDialogVisible = false"
					/>
				</v-card-title>
				<v-divider />
				<v-card-text class="pa-6">
					<v-file-input
						v-model="importFile"
						:label="t('knowledge.semantic.importFileLabel')"
						accept=".xlsx,.xls"
						prepend-icon="mdi-file-excel"
						variant="outlined"
						density="compact"
						show-size
						hide-details="auto"
					/>
					<div class="d-flex ga-2 mt-4">
						<v-btn
							variant="tonal"
							color="var(--da-primary-text)"
							prepend-icon="mdi-download"
							class="text-none"
							@click="downloadExcelTemplate"
						>
							{{ t('knowledge.semantic.downloadTemplate') }}
						</v-btn>
						<v-btn
							color="blue-darken-3"
							prepend-icon="mdi-upload"
							class="text-none"
							elevation="0"
							:loading="importLoading"
							@click="executeExcelImport"
						>
							{{ t('knowledge.semantic.startImport') }}
						</v-btn>
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>
	</section>
</template>

<script setup lang="ts">
import semanticModelService, {
	type SemanticModel,
	type SemanticModelAddDto,
} from '~/services/semanticModel/index';
import { useCrudPage } from '~/composables/useCrudPage/index';

const DEFAULT_AGENT_ID = 0;
const route = useRoute();
const agentId = computed(() => Number(route.query.agentId) || DEFAULT_AGENT_ID);

const { $tip } = useNuxtApp();
const { showConfirm } = useConfirm();
const { t, locale } = useI18n();

// ——— 额外状态 ———
const importLoading = ref(false);
const batchImportDialogVisible = ref(false);
const importFile = ref<File | null>(null);
const selectedModelIds = ref<number[]>([]);
const currentEditId = ref<number | null>(null);

// ——— useCrudPage ———
const searchKeyword = ref('');

const {
	loading,
	saveLoading,
	items: semanticModelList,
	dialogVisible,
	isEdit,
	formRef,
	formData: modelForm,
	loadItems: loadSemanticModels,
	openCreateDialog: _openCreateDialog,
	openEditDialog,
	closeDialog,
	saveItem,
	deleteItem,
} = useCrudPage<SemanticModel, SemanticModelAddDto, SemanticModel>({
	loadFn: () =>
		semanticModelService.list(agentId.value, searchKeyword.value || undefined),
	createFn: (data) => semanticModelService.create(data),
	updateFn: (id, data) => semanticModelService.update(id, data),
	deleteFn: (id) => semanticModelService.delete(id),
	defaultFormFactory: () => ({
		agentId: agentId.value,
		tableName: '',
		columnName: '',
		businessName: '',
		synonyms: '',
		businessDescription: '',
		columnComment: '',
		dataType: '',
		status: 1,
	}),
});

function openCreateDialog() {
	_openCreateDialog();
	modelForm.value.agentId = agentId.value;
}

// computed 保证切换语言后表头跟随更新
const headers = computed(() => [
	{
		title: t('knowledge.semantic.col.tableName'),
		key: 'tableName',
		minWidth: '120px',
	},
	{
		title: t('knowledge.semantic.col.columnName'),
		key: 'columnName',
		minWidth: '130px',
	},
	{
		title: t('knowledge.semantic.col.businessName'),
		key: 'businessName',
		minWidth: '140px',
	},
	{
		title: t('knowledge.semantic.col.synonyms'),
		key: 'synonyms',
		minWidth: '170px',
		sortable: false,
	},
	{
		title: t('knowledge.semantic.col.dataType'),
		key: 'dataType',
		width: '110px',
	},
	{
		title: t('knowledge.semantic.col.status'),
		key: 'status',
		width: '100px',
		sortable: false,
	},
	{
		title: t('knowledge.semantic.col.createdTime'),
		key: 'createdTime',
		width: '180px',
	},
	{
		title: t('knowledge.semantic.col.actions'),
		key: 'actions',
		width: '140px',
		sortable: false,
	},
]);

function formatDateTime(dateTime?: string) {
	if (!dateTime) return '-';
	try {
		// 日期格式跟随宿主下发的语言
		return new Date(dateTime).toLocaleString(locale.value, {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		});
	} catch {
		return dateTime;
	}
}

function editModel(model: SemanticModel) {
	currentEditId.value = model.id || null;
	openEditDialog(model);
}

function deleteModel(model: SemanticModel) {
	if (!model.id) return;
	showConfirm({
		title: t('knowledge.semantic.deleteConfirmTitle'),
		message: t('knowledge.semantic.deleteConfirmMessage', {
			name: model.businessName,
		}),
		confirmText: t('knowledge.semantic.deleteConfirmBtn'),
		icon: 'mdi-delete',
		onConfirm: async () => {
			const ok = await deleteItem(model.id!);
			if (ok) {
				$tip(t('knowledge.semantic.deleteSuccess'));
			} else {
				$tip(t('knowledge.semantic.deleteFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

function toggleStatus(model: SemanticModel, status: number) {
	if (!model.id) return;
	const ids = [model.id];
	const actionKey = status === 1 ? 'enable' : 'disable';
	showConfirm({
		title: t(`knowledge.semantic.${actionKey}ConfirmTitle`),
		message: t(`knowledge.semantic.${actionKey}ConfirmMessage`, {
			name: model.businessName,
		}),
		confirmText: t('knowledge.semantic.confirmBtn'),
		onConfirm: async () => {
			let result = false;
			if (status === 1) {
				result = await semanticModelService.enable(ids);
			} else {
				result = await semanticModelService.disable(ids);
			}
			if (result) {
				model.status = status;
				$tip(t(`knowledge.semantic.${actionKey}Success`));
			} else {
				$tip(t(`knowledge.semantic.${actionKey}Failed`), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

function batchDeleteModels() {
	if (selectedModelIds.value.length === 0) return;
	const ids = [...selectedModelIds.value];
	showConfirm({
		title: t('knowledge.semantic.batchDeleteConfirmTitle'),
		message: t('knowledge.semantic.batchDeleteConfirmMessage', {
			count: ids.length,
		}),
		confirmText: t('knowledge.semantic.deleteConfirmBtn'),
		icon: 'mdi-delete',
		onConfirm: async () => {
			const result = await semanticModelService.batchDelete(ids);
			if (result) {
				$tip(
					t('knowledge.semantic.batchDeleteSuccess', { count: ids.length }),
				);
				selectedModelIds.value = [];
				await loadSemanticModels();
			} else {
				$tip(t('knowledge.semantic.batchDeleteFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

async function saveModel() {
	const createData: SemanticModelAddDto = {
		agentId: agentId.value,
		tableName: modelForm.value.tableName,
		columnName: modelForm.value.columnName,
		businessName: modelForm.value.businessName,
		synonyms: modelForm.value.synonyms,
		businessDescription: modelForm.value.businessDescription,
		columnComment: modelForm.value.columnComment,
		dataType: modelForm.value.dataType,
	};
	const updateData: SemanticModel = {
		...modelForm.value,
		id: currentEditId.value ?? undefined,
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const ok = await saveItem(createData as any, updateData, currentEditId.value);
	if (ok) {
		$tip(
			isEdit.value
				? t('knowledge.semantic.updateSuccess')
				: t('knowledge.semantic.createSuccess'),
		);
	} else {
		$tip(
			isEdit.value
				? t('knowledge.semantic.updateFailed')
				: t('knowledge.semantic.createFailed'),
			{
				color: 'error',
				icon: 'mdi-alert-circle',
			},
		);
	}
}

async function downloadExcelTemplate() {
	try {
		await semanticModelService.downloadTemplate();
		$tip(t('knowledge.semantic.templateDownloadSuccess'));
	} catch {
		$tip(t('knowledge.semantic.templateDownloadFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	}
}

async function executeExcelImport() {
	if (!importFile.value) {
		$tip(t('knowledge.semantic.selectFileFirst'), { color: 'warning' });
		return;
	}
	importLoading.value = true;
	try {
		const result = await semanticModelService.importExcel(
			importFile.value,
			agentId.value,
		);
		$tip(
			t('knowledge.semantic.importDone', {
				success: result.successCount,
				fail: result.failCount,
			}),
		);
		if (result.errors?.length) {
			$tip(
				t('knowledge.semantic.importPartialFail', {
					error: result.errors[0],
				}),
				{ color: 'warning' },
			);
		}
		batchImportDialogVisible.value = false;
		importFile.value = null;
		await loadSemanticModels();
	} catch {
		$tip(t('knowledge.semantic.importFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	} finally {
		importLoading.value = false;
	}
}

// Note: loadSemanticModels passes searchKeyword on each call

function openBatchImportDialog() {
	batchImportDialogVisible.value = true;
	importFile.value = null;
}

onMounted(() => loadSemanticModels());
</script>

<style scoped>
/* 原 bg-white：浅色仍是 #ffffff，深色跟随面板色 */
.refresh-btn {
	background-color: var(--da-surface);
}

/* 原 color="blue-lighten-5"：浅色是近似的淡蓝底，深色下改用半透明主色保证可读 */
.count-chip {
	background-color: var(--da-primary-soft);
	color: var(--da-primary-text);
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
