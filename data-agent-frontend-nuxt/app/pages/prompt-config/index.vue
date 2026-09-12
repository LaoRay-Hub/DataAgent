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
			:title="t('promptConfig.title')"
			:subtitle="t('promptConfig.subtitle')"
		>
			<template #actions>
				<v-btn
					class="text-none refresh-btn"
					style="border-color: var(--da-border)"
					variant="outlined"
					prepend-icon="mdi-refresh"
					:loading="loading"
					@click="loadConfigs"
				>
					{{ t('promptConfig.refresh') }}
				</v-btn>
				<v-btn
					v-if="selectedIds.length > 0"
					color="blue-darken-1"
					prepend-icon="mdi-check-circle"
					class="text-none"
					elevation="0"
					@click="batchEnable"
				>
					{{ t('promptConfig.batchEnable') }}
				</v-btn>
				<v-btn
					v-if="selectedIds.length > 0"
					color="orange-darken-1"
					prepend-icon="mdi-pause-circle"
					class="text-none"
					elevation="0"
					@click="batchDisable"
				>
					{{ t('promptConfig.batchDisable') }}
				</v-btn>
				<v-btn
					color="blue-darken-3"
					prepend-icon="mdi-plus"
					class="text-none px-6"
					elevation="0"
					@click="openCreateDialog"
				>
					{{ t('promptConfig.addConfig') }}
				</v-btn>
			</template>
		</KnowledgePageHeader>

		<v-card variant="flat" border class="rounded-lg mb-4 pa-4">
			<div class="d-flex flex-wrap ga-3 align-center">
				<v-select
					v-model="selectedAgentId"
					:items="agentOptions"
					:label="t('promptConfig.filterAgent')"
					item-title="title"
					item-value="value"
					variant="outlined"
					density="compact"
					hide-details
					style="max-width: 220px"
					@update:model-value="handleFilterChange"
				/>
				<v-select
					v-model="promptType"
					:items="promptTypeOptions"
					:label="t('promptConfig.filterPromptType')"
					item-title="title"
					item-value="value"
					variant="outlined"
					density="compact"
					hide-details
					style="max-width: 220px"
					@update:model-value="handleFilterChange"
				/>
				<v-text-field
					v-model="searchKeyword"
					:placeholder="t('promptConfig.searchPlaceholder')"
					prepend-inner-icon="mdi-magnify"
					variant="outlined"
					density="compact"
					clearable
					hide-details
					class="search-field"
					style="max-width: 320px"
				/>
				<v-spacer />
				<v-chip variant="flat" class="font-weight-medium count-chip">
					{{ t('promptConfig.recordCount', { count: filteredConfigs.length }) }}
				</v-chip>
			</div>
		</v-card>

		<v-card variant="flat" border class="rounded-lg">
			<v-data-table
				v-model="selectedIds"
				:headers="headers"
				:items="filteredConfigs"
				item-value="id"
				show-select
				hover
				:loading="loading"
			>
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.description="{ item }">
					<v-tooltip
						v-if="item.description && item.description.length > 24"
						:text="item.description"
						location="top"
					>
						<template #activator="{ props }">
							<span
								v-bind="props"
								class="text-truncate d-inline-block"
								style="max-width: 180px; cursor: help"
							>
								{{ item.description }}
							</span>
						</template>
					</v-tooltip>
					<span v-else>{{ item.description || '—' }}</span>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.optimizationPrompt="{ item }">
					<v-tooltip
						v-if="
							item.optimizationPrompt && item.optimizationPrompt.length > 40
						"
						:text="item.optimizationPrompt"
						location="top"
					>
						<template #activator="{ props }">
							<span
								v-bind="props"
								class="text-truncate d-inline-block"
								style="max-width: 260px; cursor: help"
							>
								{{ item.optimizationPrompt }}
							</span>
						</template>
					</v-tooltip>
					<span v-else>{{ item.optimizationPrompt }}</span>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.enabled="{ item }">
					<v-chip
						:color="item.enabled ? 'success' : 'var(--da-text-muted)'"
						size="small"
						variant="tonal"
					>
						{{
							item.enabled
								? t('promptConfig.statusEnabled')
								: t('promptConfig.statusDisabled')
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
							icon="mdi-pencil"
							@click="editConfig(item)"
						/>
						<v-btn
							size="small"
							variant="text"
							color="amber-darken-2"
							icon="mdi-sort-numeric-descending"
							@click="openPriorityDialog(item)"
						/>
						<v-btn
							size="small"
							variant="text"
							:color="item.enabled ? 'orange-darken-1' : 'success'"
							:icon="item.enabled ? 'mdi-pause-circle' : 'mdi-check-circle'"
							@click="toggleEnabled(item)"
						>
							<v-tooltip activator="parent" location="top">{{
								item.enabled
									? t('promptConfig.actionDisable')
									: t('promptConfig.actionEnable')
							}}</v-tooltip>
						</v-btn>
						<v-btn
							size="small"
							variant="text"
							color="red-darken-1"
							icon="mdi-delete"
							@click="deleteConfig(item)"
						/>
					</div>
				</template>

				<template #no-data>
					<div class="d-flex flex-column align-center py-12">
						<v-icon
							icon="mdi-text-box-edit-outline"
							size="64"
							color="blue-lighten-3"
							class="mb-4"
						/>
						<p class="text-body-1 text-medium-emphasis mb-2">
							{{ t('promptConfig.emptyTitle') }}
						</p>
						<p class="text-body-2 mb-6" style="color: var(--da-text-muted)">
							{{ t('promptConfig.emptyHint') }}
						</p>
						<v-btn
							color="blue-darken-3"
							prepend-icon="mdi-plus"
							class="text-none"
							elevation="0"
							@click="openCreateDialog"
						>
							{{ t('promptConfig.addConfig') }}
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
							? t('promptConfig.dialogEditTitle')
							: t('promptConfig.dialogCreateTitle')
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
						<div class="mb-4">
							<p class="text-body-2 font-weight-medium form-label mb-2">
								{{ t('promptConfig.fieldName') }}
								<span class="text-error">*</span>
							</p>
							<v-text-field
								v-model="formData.name"
								:placeholder="t('promptConfig.namePlaceholder')"
								variant="outlined"
								density="compact"
								:rules="[(v) => !!v?.trim() || t('promptConfig.nameRequired')]"
								hide-details="auto"
							/>
						</div>
						<div class="mb-4">
							<p class="text-body-2 font-weight-medium form-label mb-2">
								{{ t('promptConfig.fieldDescription') }}
							</p>
							<v-text-field
								v-model="formData.description"
								:placeholder="t('promptConfig.descriptionPlaceholder')"
								variant="outlined"
								density="compact"
								hide-details="auto"
							/>
						</div>
						<div class="mb-4">
							<p class="text-body-2 font-weight-medium form-label mb-2">
								{{ t('promptConfig.fieldOptimizationPrompt') }}
								<span class="text-error">*</span>
							</p>
							<v-textarea
								v-model="formData.optimizationPrompt"
								:placeholder="t('promptConfig.optimizationPromptPlaceholder')"
								variant="outlined"
								density="compact"
								rows="5"
								:rules="[
									(v) => !!v?.trim() || t('promptConfig.optimizationPromptRequired'),
								]"
								hide-details="auto"
							/>
						</div>
						<v-row>
							<v-col cols="12" md="6">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('promptConfig.fieldPriority') }}
								</p>
								<v-text-field
									v-model.number="formData.priority"
									type="number"
									min="0"
									max="100"
									variant="outlined"
									density="compact"
									hide-details="auto"
								/>
							</v-col>
							<v-col cols="12" md="6">
								<p class="text-body-2 font-weight-medium form-label mb-2">
									{{ t('promptConfig.fieldDisplayOrder') }}
								</p>
								<v-text-field
									v-model.number="formData.displayOrder"
									type="number"
									min="0"
									variant="outlined"
									density="compact"
									hide-details="auto"
								/>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4 d-flex justify-end ga-2">
					<v-btn variant="outlined" class="text-none px-6" @click="closeDialog">{{
						t('promptConfig.cancel')
					}}</v-btn>
					<v-btn
						color="blue-darken-3"
						class="text-none px-6"
						elevation="0"
						:loading="saveLoading"
						@click="saveConfig"
					>
						{{ isEdit ? t('promptConfig.saveUpdate') : t('promptConfig.createNow') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="priorityDialogVisible" max-width="480" persistent>
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center pa-6 pb-4">
					<v-icon
						icon="mdi-sort-numeric-descending"
						color="blue-darken-2"
						class="mr-3"
						size="26"
					/>
					<span class="text-h6 font-weight-bold">{{
						t('promptConfig.priorityDialogTitle')
					}}</span>
					<v-spacer />
					<v-btn
						icon="mdi-close"
						variant="text"
						size="small"
						@click="closePriorityDialog"
					/>
				</v-card-title>
				<v-divider />
				<v-card-text class="pa-6">
					<v-text-field
						v-model.number="priorityValue"
						type="number"
						:label="t('promptConfig.priorityFieldLabel')"
						min="0"
						max="100"
						variant="outlined"
						density="compact"
						hide-details="auto"
					/>
				</v-card-text>
				<v-card-actions class="pa-4 d-flex justify-end ga-2">
					<v-btn variant="outlined" class="text-none" @click="closePriorityDialog">{{
						t('promptConfig.cancel')
					}}</v-btn>
					<v-btn
						color="blue-darken-3"
						class="text-none"
						elevation="0"
						@click="updatePriority"
						>{{ t('promptConfig.save') }}</v-btn
					>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</section>
</template>

<script setup lang="ts">
import agentService from '~/services/agent/index';
import { promptService, type PromptConfig } from '~/services/prompt/index';
import { useCrudPage } from '~/composables/useCrudPage/index';

const route = useRoute();
const { t } = useI18n();
const { $tip } = useNuxtApp();
const { showConfirm } = useConfirm();

// ——— 额外状态 ———
const priorityDialogVisible = ref(false);
const selectedAgentId = ref<number | undefined>(undefined);
const promptType = ref('report-generator');
const searchKeyword = ref('');
const selectedIds = ref<number[]>([]);
const editingId = ref<number | undefined>(undefined);
const priorityEditId = ref<number | undefined>(undefined);
const priorityValue = ref(0);
const rawConfigs = ref<PromptConfig[]>([]);
const agentOptions = ref<{ title: string; value: number }[]>([]);

const headers = computed(() => [
	{ title: t('promptConfig.headerName'), key: 'name', minWidth: '140px' },
	{
		title: t('promptConfig.headerDescription'),
		key: 'description',
		minWidth: '160px',
		sortable: false,
	},
	{
		title: t('promptConfig.headerOptimizationPrompt'),
		key: 'optimizationPrompt',
		minWidth: '240px',
		sortable: false,
	},
	{ title: t('promptConfig.headerPriority'), key: 'priority', width: '90px' },
	{ title: t('promptConfig.headerDisplayOrder'), key: 'displayOrder', width: '90px' },
	{
		title: t('promptConfig.headerStatus'),
		key: 'enabled',
		width: '100px',
		sortable: false,
	},
	{
		title: t('promptConfig.headerActions'),
		key: 'actions',
		width: '170px',
		sortable: false,
	},
]);

const promptTypeOptions = computed(() => [
	{ title: t('promptConfig.typeReportGenerator'), value: 'report-generator' },
	{ title: t('promptConfig.typePlanner'), value: 'planner' },
	{ title: t('promptConfig.typeSqlGenerator'), value: 'sql-generator' },
	{ title: t('promptConfig.typeGeneralChat'), value: 'general-chat' },
]);

const filteredConfigs = computed(() => {
	const keyword = searchKeyword.value.trim().toLowerCase();
	if (!keyword) return rawConfigs.value;
	return rawConfigs.value.filter((item) =>
		[item.name, item.description, item.optimizationPrompt]
			.filter(Boolean)
			.some((text) => String(text).toLowerCase().includes(keyword)),
	);
});

// ——— useCrudPage ———
const {
	loading,
	saveLoading,
	dialogVisible,
	isEdit,
	formRef,
	formData,
	openCreateDialog: _openCreateDialog,
	closeDialog: _closeDialog,
} = useCrudPage<PromptConfig>({
	loadFn: async () => {
		const list = await promptService.listByType(
			promptType.value,
			selectedAgentId.value,
		);
		list.sort((a, b) => {
			const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
			if (orderDiff !== 0) return orderDiff;
			return (b.priority ?? 0) - (a.priority ?? 0);
		});
		rawConfigs.value = list;
		selectedIds.value = [];
		return list;
	},
	defaultFormFactory: () => ({
		name: '',
		description: '',
		optimizationPrompt: '',
		priority: 0,
		displayOrder: 0,
		enabled: true,
		promptType: promptType.value,
		agentId: selectedAgentId.value ?? null,
		creator: 'user',
	}),
});

async function loadConfigs() {
	loading.value = true;
	try {
		rawConfigs.value = await promptService.listByType(
			promptType.value,
			selectedAgentId.value,
		);
		rawConfigs.value.sort((a, b) => {
			const orderA = a.displayOrder ?? 0;
			const orderB = b.displayOrder ?? 0;
			if (orderA !== orderB) return orderA - orderB;
			return (b.priority ?? 0) - (a.priority ?? 0);
		});
		selectedIds.value = [];
	} catch {
		$tip(t('promptConfig.loadFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	} finally {
		loading.value = false;
	}
}

function resetFormData() {
	formData.value = {
		name: '',
		description: '',
		optimizationPrompt: '',
		priority: 0,
		displayOrder: 0,
		enabled: true,
		promptType: promptType.value,
		agentId: selectedAgentId.value ?? null,
		creator: 'user',
	};
	editingId.value = undefined;
}

function openCreateDialog() {
	_openCreateDialog();
	formData.value.promptType = promptType.value;
	formData.value.agentId = selectedAgentId.value ?? null;
	editingId.value = undefined;
}

function editConfig(config: PromptConfig) {
	isEdit.value = true;
	editingId.value = config.id;
	formData.value = {
		...config,
		promptType: promptType.value,
		agentId: selectedAgentId.value ?? null,
	};
	dialogVisible.value = true;
}

function closeDialog() {
	_closeDialog();
	resetFormData();
}

function handleFilterChange() {
	loadConfigs();
}

async function saveConfig() {
	const validateResult = await formRef.value?.validate();
	const valid = validateResult?.valid;
	if (!valid) return;

	saveLoading.value = true;
	try {
		const payload: PromptConfig = {
			...formData.value,
			id: editingId.value,
			promptType: promptType.value,
			agentId: selectedAgentId.value ?? null,
			enabled: formData.value.enabled ?? true,
			creator: formData.value.creator || 'user',
		};
		const result = await promptService.save(payload);
		if (!result.success) {
			$tip(
				result.message ||
					(isEdit.value
						? t('promptConfig.updateFailed')
						: t('promptConfig.createFailed')),
				{
					color: 'error',
					icon: 'mdi-alert-circle',
				},
			);
			return;
		}
		$tip(
			result.message ||
				(isEdit.value
					? t('promptConfig.updateSuccess')
					: t('promptConfig.createSuccess')),
		);
		dialogVisible.value = false;
		resetFormData();
		await loadConfigs();
	} catch {
		$tip(
			isEdit.value ? t('promptConfig.updateFailed') : t('promptConfig.createFailed'),
			{
				color: 'error',
				icon: 'mdi-alert-circle',
			},
		);
	} finally {
		saveLoading.value = false;
	}
}

function toggleEnabled(config: PromptConfig) {
	if (!config.id) return;
	const toEnable = !config.enabled;
	showConfirm({
		title: toEnable
			? t('promptConfig.enableConfirmTitle')
			: t('promptConfig.disableConfirmTitle'),
		message: toEnable
			? t('promptConfig.enableConfirmMessage', { name: config.name })
			: t('promptConfig.disableConfirmMessage', { name: config.name }),
		confirmText: t('promptConfig.confirm'),
		onConfirm: async () => {
			const result = toEnable
				? await promptService.enable(config.id!)
				: await promptService.disable(config.id!);
			if (result.success) {
				$tip(
					result.message ||
						(toEnable
							? t('promptConfig.enableSuccess')
							: t('promptConfig.disableSuccess')),
				);
				await loadConfigs();
			} else {
				$tip(
					result.message ||
						(toEnable
							? t('promptConfig.enableFailed')
							: t('promptConfig.disableFailed')),
					{
						color: 'error',
						icon: 'mdi-alert-circle',
					},
				);
			}
		},
	});
}

function deleteConfig(config: PromptConfig) {
	if (!config.id) return;
	showConfirm({
		title: t('promptConfig.deleteConfirmTitle'),
		message: t('promptConfig.deleteConfirmMessage', { name: config.name }),
		confirmText: t('promptConfig.deleteConfirmText'),
		icon: 'mdi-delete',
		onConfirm: async () => {
			const result = await promptService.delete(config.id!);
			if (result.success) {
				$tip(result.message || t('promptConfig.deleteSuccess'));
				await loadConfigs();
			} else {
				$tip(result.message || t('promptConfig.deleteFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

function batchEnable() {
	if (selectedIds.value.length === 0) return;
	showConfirm({
		title: t('promptConfig.batchEnableConfirmTitle'),
		message: t('promptConfig.batchEnableConfirmMessage', {
			count: selectedIds.value.length,
		}),
		confirmText: t('promptConfig.batchEnableConfirmText'),
		onConfirm: async () => {
			const result = await promptService.batchEnable(selectedIds.value);
			if (result.success) {
				$tip(result.message || t('promptConfig.batchEnableSuccess'));
				await loadConfigs();
			} else {
				$tip(result.message || t('promptConfig.batchEnableFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

function batchDisable() {
	if (selectedIds.value.length === 0) return;
	showConfirm({
		title: t('promptConfig.batchDisableConfirmTitle'),
		message: t('promptConfig.batchDisableConfirmMessage', {
			count: selectedIds.value.length,
		}),
		confirmText: t('promptConfig.batchDisableConfirmText'),
		onConfirm: async () => {
			const result = await promptService.batchDisable(selectedIds.value);
			if (result.success) {
				$tip(result.message || t('promptConfig.batchDisableSuccess'));
				await loadConfigs();
			} else {
				$tip(result.message || t('promptConfig.batchDisableFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			}
		},
	});
}

function openPriorityDialog(config: PromptConfig) {
	if (!config.id) return;
	priorityEditId.value = config.id;
	priorityValue.value = config.priority ?? 0;
	priorityDialogVisible.value = true;
}

function closePriorityDialog() {
	priorityDialogVisible.value = false;
	priorityEditId.value = undefined;
	priorityValue.value = 0;
}

async function updatePriority() {
	if (!priorityEditId.value) return;
	try {
		const result = await promptService.updatePriority(
			priorityEditId.value,
			priorityValue.value,
		);
		if (result.success) {
			$tip(result.message || t('promptConfig.priorityUpdateSuccess'));
			closePriorityDialog();
			await loadConfigs();
		} else {
			$tip(result.message || t('promptConfig.priorityUpdateFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} catch {
		$tip(t('promptConfig.priorityUpdateFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	}
}

async function resolveAgent() {
	const routeAgentId = Number(route.query.agentId);
	const agents = await agentService.list();
	agentOptions.value = agents
		.filter((item) => item.id !== undefined && item.id > 0)
		.map((item) => ({
			title: item.name || `Agent ${item.id}`,
			value: item.id as number,
		}));
	if (Number.isFinite(routeAgentId) && routeAgentId > 0) {
		selectedAgentId.value = routeAgentId;
		return;
	}
	selectedAgentId.value = agentOptions.value[0]?.value;
}

onMounted(async () => {
	try {
		await resolveAgent();
	} catch {
		$tip(t('promptConfig.loadAgentsFailed'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	}
	await loadConfigs();
});
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
