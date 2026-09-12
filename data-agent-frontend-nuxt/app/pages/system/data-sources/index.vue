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
				<h1 class="text-h4 font-weight-bold mb-1 page-title">
					{{ t('dataSource.title') }}
				</h1>
				<p class="text-body-2 text-medium-emphasis">
					{{ t('dataSource.subtitle') }}
				</p>
			</div>
			<div class="d-flex ga-3">
				<v-btn
					variant="outlined"
					prepend-icon="mdi-refresh"
					:loading="loading"
					class="text-none"
					style="background-color: var(--da-surface); border-color: var(--da-border)"
					@click="fetchDatasources"
				>
					{{ t('dataSource.refresh') }}
				</v-btn>
				<v-btn
					color="primary"
					prepend-icon="mdi-plus"
					class="text-none px-6"
					elevation="0"
					@click="openFormDialog('create')"
				>
					{{ t('dataSource.addDatasource') }}
				</v-btn>
				<v-btn
					v-if="agentId"
					color="primary"
					prepend-icon="mdi-upload"
					class="text-none px-6"
					elevation="0"
					:loading="initStatus"
					@click="handleInitDatasource"
				>
					{{
						initStatus
							? t('dataSource.initializing')
							: t('dataSource.initCurrentAgent')
					}}
				</v-btn>
			</div>
		</header>

		<v-card variant="flat" border class="rounded-lg">
			<v-data-table
				v-model:expanded="expandedRows"
				:headers="headers"
				:items="datasourceList"
				item-value="id"
				show-expand
				hover
				:loading="loading"
				:items-per-page-options="[10, 25, 50, 100]"
				:footer-props="{
					'items-per-page-text': t('dataSource.itemsPerPage'),
					'page-text': t('dataSource.pageText'),
				}"
			>
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template
					#item.data-table-expand="{
						item,
						internalItem,
						toggleExpand,
						isExpanded,
					}"
				>
					<v-btn
						v-if="item.status === 'active' && item.testStatus === 'success'"
						icon
						variant="text"
						size="small"
						@click="toggleExpand(internalItem)"
					>
						<v-icon>{{
							isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'
						}}</v-icon>
					</v-btn>
					<v-btn
						v-else
						icon
						variant="text"
						size="small"
						disabled
						class="expand-disabled"
					>
						<v-icon>mdi-chevron-down</v-icon>
					</v-btn>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.name="{ item }">
					<div class="d-flex align-center py-2">
						<v-avatar
							color="var(--da-primary-wash)"
							rounded="lg"
							size="36"
							class="mr-3"
						>
							<v-icon color="primary" size="20">{{
								getDbIcon(item.type)
							}}</v-icon>
						</v-avatar>
						<div>
							<div class="font-weight-bold">{{ item.name }}</div>
							<div class="text-caption text-medium-emphasis">
								{{ item.host }}:{{ item.port }}
							</div>
						</div>
					</div>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.type="{ item }">
					<v-chip size="small" class="text-uppercase">{{ item.type }}</v-chip>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.status="{ item }">
					<v-chip
						:color="item.status === 'active' ? 'success' : 'default'"
						size="small"
						variant="flat"
						class="px-3"
					>
						{{
							item.status === 'active'
								? t('dataSource.statusActive')
								: t('dataSource.statusInactive')
						}}
					</v-chip>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.testStatus="{ item }">
					<v-chip
						:color="
							item.testStatus === 'success'
								? 'info'
								: item.testStatus === 'fail'
									? 'error'
									: 'default'
						"
						size="small"
						variant="flat"
						class="px-3"
					>
						<span class="d-flex align-center">
							<span
								v-if="item.testStatus === 'success'"
								class="breathing-dot-green"
							/>
							{{ getStatusText(item.testStatus) }}
						</span>
					</v-chip>
				</template>

				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.actions="{ item }">
					<div class="d-flex align-center justify-end ga-1">
						<v-btn
							v-if="agentId"
							variant="text"
							size="small"
							color="primary"
							class="text-none font-weight-bold"
							:loading="bindingDatasourceId === item.id"
							:disabled="activeDatasourceId === item.id"
							@click="handleBindDatasource(item)"
						>
							{{
								activeDatasourceId === item.id
									? t('dataSource.inUse')
									: t('dataSource.setAsCurrent')
							}}
						</v-btn>
						<v-btn
							variant="text"
							size="small"
							color="primary"
							class="text-none font-weight-bold"
							:loading="togglingStatusId === item.id"
							@click="handleToggleStatus(item)"
						>
							{{
								item.status === 'active'
									? t('dataSource.actionDisable')
									: t('dataSource.actionEnable')
							}}
						</v-btn>
						<v-btn
							variant="text"
							size="small"
							color="primary"
							class="text-none font-weight-bold"
							:loading="testingId === item.id"
							@click="handleTestConnection(item)"
						>
							{{ t('dataSource.testConnection') }}
						</v-btn>
						<v-btn
							variant="text"
							size="small"
							color="primary"
							class="text-none font-weight-bold"
							@click="openFkDialog(item)"
						>
							{{ t('dataSource.logicalForeignKey') }}
						</v-btn>
						<v-btn
							icon="mdi-pencil-outline"
							variant="text"
							size="small"
							color="primary"
							@click="openFormDialog('edit', item)"
						/>
						<v-btn
							icon="mdi-delete-outline"
							variant="text"
							size="small"
							color="error"
							@click="handleDelete(item)"
						/>
					</div>
				</template>

				<template #expanded-row="{ columns, item }">
					<tr>
						<td
							:colspan="columns.length"
							class="pa-0"
							style="background-color: var(--da-surface-soft)"
						>
							<ExpandedTableManager
								v-model:selected-tables="selectedTables[item.id!]"
								:all-tables="tableLists[item.id!] ?? []"
								:loading-tables="loadingTablesId === item.id"
								:fetch-error="!!(item.id && tableFetchError[item.id])"
								:updating="updatingTablesId === item.id"
								@update-tables="updateTables(item)"
								@retry="retryFetchTables(item)"
							/>
						</td>
					</tr>
				</template>
			</v-data-table>
		</v-card>

		<DatasourceFormDialog
			v-model="formDialogVisible"
			:is-edit="formDialogMode === 'edit'"
			:datasource="formDialogTarget"
			:saving="saving"
			@submit="handleFormSubmit"
		/>

		<ForeignKeyDialog
			v-model="fkDialogVisible"
			:datasource-id="fkDatasourceId"
			:datasource-name="fkDatasourceName"
		/>
	</section>
</template>

<script setup lang="ts">
import datasourceService, { type Datasource } from '@/services/datasource';
import agentDatasourceService from '@/services/agentDatasource';
import DatasourceFormDialog from './DatasourceFormDialog.vue';
import ForeignKeyDialog from './ForeignKeyDialog.vue';
import ExpandedTableManager from './ExpandedTableManager.vue';

const route = useRoute();
const { t } = useI18n();
const { showConfirm } = useConfirm();
const { $tip } = useNuxtApp();

const loading = ref(false);
const saving = ref(false);
const testingId = ref<number | null>(null);
const togglingStatusId = ref<number | null>(null);
const bindingDatasourceId = ref<number | null>(null);
const datasourceList = ref<Datasource[]>([]);
const expandedRows = ref<readonly string[]>([]);
const tableLists = ref<Record<number, string[]>>({});
const selectedTables = ref<Record<number, string[]>>({});
const loadingTablesId = ref<number | null>(null);
const tableFetchError = ref<Record<number, boolean>>({});
const updatingTablesId = ref<number | null>(null);
const initStatus = ref(false);
const activeDatasourceId = ref<number | null>(null);

const agentId = computed(() => {
	const id = route.params.agentId || route.query.agentId;
	return id ? String(id) : null;
});

const formDialogVisible = ref(false);
const formDialogMode = ref<'create' | 'edit'>('create');
const formDialogTarget = ref<Datasource | null>(null);

const fkDialogVisible = ref(false);
const fkDatasourceId = ref(0);
const fkDatasourceName = ref('');

// 用 computed 包一层，切语言后表头才会跟着更新
const headers = computed(() => [
	{ title: t('dataSource.name'), key: 'name', align: 'start' as const },
	{ title: t('dataSource.type'), key: 'type', align: 'center' as const },
	{ title: t('dataSource.status'), key: 'status', align: 'center' as const },
	{
		title: t('dataSource.connectionStatus'),
		key: 'testStatus',
		align: 'center' as const,
	},
	{
		title: t('dataSource.actions'),
		key: 'actions',
		align: 'end' as const,
		sortable: false,
	},
]);

function getDbIcon(type: string | undefined) {
	if (type === 'mysql') return 'mdi-database';
	if (type === 'postgresql') return 'mdi-elephant';
	if (type === 'oracle') return 'mdi-alpha-o-circle';
	return 'mdi-database-outline';
}

function getStatusText(status: string | undefined) {
	if (status === 'success') return t('dataSource.connSuccess');
	if (status === 'fail') return t('dataSource.connFail');
	return t('dataSource.connUntested');
}

async function fetchDatasources() {
	loading.value = true;
	try {
		datasourceList.value = await datasourceService.getAllDatasource();
	} catch {
		$tip(t('dataSource.fetchListFailed'), { color: 'error', icon: 'mdi-alert-circle' });
	} finally {
		loading.value = false;
	}
}

async function fetchActiveDatasourceForAgent() {
	if (!agentId.value) {
		activeDatasourceId.value = null;
		return;
	}
	try {
		const res = await agentDatasourceService.getActiveAgentDatasource(agentId.value);
		activeDatasourceId.value = res.success ? res.data?.datasourceId ?? null : null;
		if (res.success && res.data?.datasourceId && res.data.selectTables) {
			selectedTables.value[res.data.datasourceId] = [...res.data.selectTables];
		}
	} catch {
		activeDatasourceId.value = null;
	}
}

function openFormDialog(mode: 'create' | 'edit', item?: Datasource) {
	formDialogMode.value = mode;
	formDialogTarget.value = mode === 'edit' && item ? { ...item } : null;
	formDialogVisible.value = true;
}

async function handleFormSubmit(data: Datasource) {
	saving.value = true;
	try {
		if (formDialogMode.value === 'create') {
			await datasourceService.createDatasource(data);
			$tip(t('dataSource.createSuccess'));
		} else if (data.id) {
			await datasourceService.updateDatasource(data.id, data);
			$tip(t('dataSource.updateSuccess'));
		}
		formDialogVisible.value = false;
		fetchDatasources();
	} catch {
		$tip(t('dataSource.operationFailedCheck'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
	} finally {
		saving.value = false;
	}
}

async function handleBindDatasource(item: Datasource) {
	if (!agentId.value || !item.id) return;
	if (activeDatasourceId.value === item.id) {
		$tip(t('dataSource.alreadyInUse'));
		return;
	}
	bindingDatasourceId.value = item.id;
	try {
		const res = await agentDatasourceService.addDatasourceToAgent(agentId.value, item.id);
		if (res.success) {
			activeDatasourceId.value = item.id;
			$tip(t('dataSource.setAsCurrentSuccess'));
		} else {
			$tip(res.message || t('dataSource.bindFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} catch {
		$tip(t('dataSource.bindFailed'), { color: 'error', icon: 'mdi-alert-circle' });
	} finally {
		bindingDatasourceId.value = null;
	}
}

function handleDelete(item: Datasource) {
	if (!item.id) return;
	showConfirm({
		title: t('dataSource.deleteConfirmTitle'),
		message: t('dataSource.deleteConfirmMessage', { name: item.name ?? '' }),
		confirmText: t('dataSource.delete'),
		icon: 'mdi-alert-circle',
		onConfirm: async () => {
			try {
				const res = await datasourceService.deleteDatasource(item.id!);
				if (res.success) {
					$tip(t('dataSource.deleteSuccess'));
					fetchDatasources();
				} else
					$tip(res.message || t('dataSource.deleteFailed'), {
						color: 'error',
						icon: 'mdi-alert-circle',
					});
			} catch {
				$tip(t('dataSource.deleteFailed'), { color: 'error', icon: 'mdi-alert-circle' });
			}
		},
	});
}

async function handleToggleStatus(item: Datasource) {
	if (!item.id) return;
	togglingStatusId.value = item.id;
	const newStatus = item.status === 'active' ? 'inactive' : 'active';
	try {
		await datasourceService.updateDatasource(item.id, {
			...item,
			status: newStatus,
		});
		item.status = newStatus;
		$tip(
			newStatus === 'active'
				? t('dataSource.enabledTip')
				: t('dataSource.disabledTip'),
		);
	} catch {
		$tip(t('dataSource.operationFailed'), { color: 'error', icon: 'mdi-alert-circle' });
	} finally {
		togglingStatusId.value = null;
	}
}

async function handleTestConnection(item: Datasource) {
	if (!item.id) return;
	testingId.value = item.id;
	try {
		const res = await datasourceService.testConnection(item.id);
		if (res.success) {
			$tip(t('dataSource.testConnSuccess'));
			item.testStatus = 'success';
		} else {
			$tip(t('dataSource.testConnFail'), { color: 'error', icon: 'mdi-alert-circle' });
			item.testStatus = 'fail';
		}
	} catch {
		$tip(t('dataSource.testConnRequestFail'), { color: 'error', icon: 'mdi-alert-circle' });
		item.testStatus = 'fail';
	} finally {
		testingId.value = null;
	}
}

function openFkDialog(item: Datasource) {
	if (!item.id) return;
	fkDatasourceId.value = item.id;
	fkDatasourceName.value = item.name || '';
	fkDialogVisible.value = true;
}

// ── 展开行相关 ──────────────────────────────────────────────────────────────

function getDatasourceFromRow(row: unknown): Datasource | null {
	if (row && typeof row === 'object' && 'id' in row) {
		const id = (row as Datasource).id;
		return (
			datasourceList.value.find((ds) => ds.id === id) ?? (row as Datasource)
		);
	}
	const id =
		typeof row === 'number'
			? row
			: typeof row === 'string'
				? Number(row)
				: null;
	if (id != null && !Number.isNaN(id))
		return datasourceList.value.find((ds) => ds.id === id) ?? null;
	return null;
}

watch(
	expandedRows,
	(rows) => {
		const list = Array.isArray(rows) ? rows : [];
		const invalidRows: unknown[] = [];
		for (const row of list) {
			const ds = getDatasourceFromRow(row);
			const canExpand =
				ds && ds.status === 'active' && (ds.testStatus ?? '') === 'success';
			if (!canExpand && ds) invalidRows.push(row);
		}
		if (invalidRows.length > 0) {
			expandedRows.value = list.filter((row) => {
				const ds = getDatasourceFromRow(row);
				return (
					ds && ds.status === 'active' && (ds.testStatus ?? '') === 'success'
				);
			});
			const hasInactive = invalidRows.some((row) => {
				const ds = getDatasourceFromRow(row);
				return ds && ds.status !== 'active';
			});
			const hasConnFail = invalidRows.some((row) => {
				const ds = getDatasourceFromRow(row);
				return ds && (ds.testStatus ?? '') !== 'success';
			});
			if (hasInactive && hasConnFail)
				$tip(t('dataSource.expandNeedBoth'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			else if (hasInactive)
				$tip(t('dataSource.expandNeedActive'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			else
				$tip(t('dataSource.expandNeedTest'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
		}
	},
	{ immediate: false },
);

watch(
	expandedRows,
	async (rows) => {
		const list = Array.isArray(rows) ? rows : [];
		for (const row of list) {
			const dsId =
				typeof row === 'object' && row !== null && 'id' in row && row.id != null
					? row.id
					: Number(row);
			if (dsId && !tableLists.value[dsId]) {
				selectedTables.value[dsId] = selectedTables.value[dsId] ?? [];
				await fetchTablesForDatasource(dsId);
			}
		}
	},
	{ immediate: false },
);

async function fetchTablesForDatasource(datasourceId: number) {
	loadingTablesId.value = datasourceId;
	tableFetchError.value = { ...tableFetchError.value, [datasourceId]: false };
	try {
		const tables = await datasourceService.getDatasourceTables(datasourceId);
		tableLists.value[datasourceId] = tables ?? [];
		if (!selectedTables.value[datasourceId])
			selectedTables.value[datasourceId] = [];
	} catch {
		tableLists.value[datasourceId] = [];
		selectedTables.value[datasourceId] = [];
		tableFetchError.value = { ...tableFetchError.value, [datasourceId]: true };
	} finally {
		loadingTablesId.value = null;
	}
}

function retryFetchTables(item: Datasource) {
	if (item.id) fetchTablesForDatasource(item.id);
}

async function updateTables(item: Datasource) {
	if (!item.id) return;
	updatingTablesId.value = item.id;
	try {
		const res = await agentDatasourceService.updateDatasourceTables(agentId.value || '', {
			datasourceId: item.id,
			tables: selectedTables.value[item.id] ?? [],
		});
		if (res.success) {
			$tip(
				t('dataSource.savedTables', {
					count: selectedTables.value[item.id]?.length ?? 0,
				}),
			);
		} else {
			$tip(res.message || t('dataSource.updateFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} finally {
		updatingTablesId.value = null;
	}
}

async function handleInitDatasource() {
	if (!agentId.value) {
		$tip(t('dataSource.missingAgentId'), {
			color: 'error',
			icon: 'mdi-alert-circle',
		});
		return;
	}
	initStatus.value = true;
	try {
		if (activeDatasourceId.value == null) await fetchActiveDatasourceForAgent();
		const activeRes = await agentDatasourceService.getActiveAgentDatasource(
			agentId.value,
		);
		if (!activeRes.success || !activeRes.data) {
			$tip(t('dataSource.noBoundDatasource'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
			return;
		}
		const activeDatasource = activeRes.data;
		activeDatasourceId.value = activeDatasource.datasourceId ?? null;
		if (
			!activeDatasource.selectTables ||
			activeDatasource.selectTables.length === 0
		) {
			$tip(t('dataSource.noSelectedTables'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
			return;
		}
		const res = await agentDatasourceService.initSchema(agentId.value);
		if (res.success) $tip(t('dataSource.initSuccess'));
		else
			$tip(res.message || t('dataSource.initFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
	} catch (error: unknown) {
		const errMsg =
			error instanceof Error ? error.message : t('dataSource.initFailed');
		$tip(errMsg, { color: 'error', icon: 'mdi-alert-circle' });
	} finally {
		initStatus.value = false;
	}
}

onMounted(() => {
	fetchDatasources();
	fetchActiveDatasourceForAgent();
});
</script>

<style scoped>
/* 原 text-slate-900 未在全局定义，改用主题变量保证深色下标题可读 */
.page-title {
	color: var(--da-text);
}

.expand-disabled {
	opacity: 0.4;
	cursor: not-allowed;
}
</style>
