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
	<v-dialog
		:model-value="modelValue"
		max-width="900"
		persistent
		@update:model-value="$emit('update:modelValue', $event)"
	>
		<v-card rounded="xl" class="pa-4">
			<v-card-title
				class="d-flex align-center justify-space-between border-b pb-4"
			>
				<div class="d-flex align-center">
					<v-icon color="primary" class="mr-3">mdi-relation-one-to-many</v-icon>
					<span class="font-weight-bold"
						>{{ t('dataSource.fkConfig') }} - {{ datasourceName }}</span
					>
				</div>
				<v-btn
					icon="mdi-close"
					variant="text"
					size="small"
					@click="$emit('update:modelValue', false)"
				/>
			</v-card-title>

			<v-card-text class="pa-6">
				<div class="mb-8">
					<div class="text-overline mb-2" style="color: var(--da-text-muted)">
						{{ t('dataSource.activeRelations') }}
					</div>
					<v-table
						density="comfortable"
						class="border rounded-lg overflow-hidden"
					>
						<thead style="background-color: var(--da-surface-mute)">
							<tr>
								<th class="text-left">{{ t('dataSource.sourceTableCol') }}</th>
								<th class="text-center">{{ t('dataSource.relation') }}</th>
								<th class="text-left">{{ t('dataSource.targetTableCol') }}</th>
								<th class="text-right">{{ t('dataSource.actions') }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(fk, index) in relations" :key="index">
								<td>
									<div class="font-weight-bold" style="color: var(--da-primary-text)">
										{{ fk.sourceTableName }}
									</div>
									<div class="text-caption" style="color: var(--da-text-muted)">
										{{ fk.sourceColumnName }}
									</div>
								</td>
								<td class="text-center">
									<v-icon size="16" color="var(--da-text-faint)">mdi-link-variant</v-icon>
									<div
										class="text-caption font-weight-bold"
										style="color: var(--da-text-secondary)"
									>
										{{ fk.relationType }}
									</div>
								</td>
								<td>
									<div class="font-weight-bold" style="color: var(--da-success-text)">
										{{ fk.targetTableName }}
									</div>
									<div class="text-caption" style="color: var(--da-text-muted)">
										{{ fk.targetColumnName }}
									</div>
								</td>
								<td class="text-right">
									<v-btn
										icon="mdi-trash-can-outline"
										variant="text"
										size="small"
										color="error"
										:loading="deletingRelationId === fk.id"
										@click="handleDelete(fk.id!)"
									/>
								</td>
							</tr>
							<tr v-if="relations.length === 0">
								<td colspan="4" class="text-center py-4" style="color: var(--da-text-muted)">
									{{ t('dataSource.noRelations') }}
								</td>
							</tr>
						</tbody>
					</v-table>
				</div>

				<div class="pa-5 rounded-lg border" style="background-color: var(--da-surface-soft)">
					<v-row dense>
						<v-col cols="12" md="5">
							<v-select
								v-model="fkForm.sourceTableName"
								:label="t('dataSource.labelSourceTable')"
								:items="tables"
								variant="outlined"
								density="compact"
								:placeholder="t('dataSource.placeholderSelectSourceTable')"
								clearable
								@update:model-value="fetchColumns($event ?? '', 'source')"
							/>
							<v-select
								v-model="fkForm.sourceColumnName"
								:label="t('dataSource.labelSourceColumn')"
								:items="sourceColumns"
								variant="outlined"
								density="compact"
								:disabled="!fkForm.sourceTableName"
								:loading="loadingSourceColumns"
								:placeholder="t('dataSource.placeholderSelectSourceFirst')"
								clearable
							/>
						</v-col>
						<v-col cols="12" md="2" class="d-flex align-center justify-center">
							<v-icon color="var(--da-text-faint)" size="32"
								>mdi-arrow-right-bold</v-icon
							>
						</v-col>
						<v-col cols="12" md="5">
							<v-select
								v-model="fkForm.targetTableName"
								:label="t('dataSource.labelTargetTable')"
								:items="tables"
								variant="outlined"
								density="compact"
								:placeholder="t('dataSource.placeholderSelectTargetTable')"
								clearable
								@update:model-value="fetchColumns($event ?? '', 'target')"
							/>
							<v-select
								v-model="fkForm.targetColumnName"
								:label="t('dataSource.labelTargetColumn')"
								:items="targetColumns"
								variant="outlined"
								density="compact"
								:disabled="!fkForm.targetTableName"
								:loading="loadingTargetColumns"
								:placeholder="t('dataSource.placeholderSelectTargetFirst')"
								clearable
							/>
						</v-col>
						<v-col cols="12" class="d-flex ga-2 mt-2">
							<v-select
								v-model="fkForm.relationType"
								:label="t('dataSource.relation')"
								:items="['1:1', '1:N', 'N:1']"
								variant="outlined"
								density="compact"
								class="flex-grow-1"
							/>
							<v-btn
								color="primary"
								height="40"
								elevation="0"
								class="px-8"
								:loading="addingRelation"
								:disabled="!isFormValid"
								@click="handleAdd"
								>{{ t('dataSource.addRelation') }}</v-btn
							>
						</v-col>
					</v-row>
				</div>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script setup lang="ts">
import datasourceService from '@/services/datasource';
import type { LogicalRelation } from '@/services/datasource';

const props = defineProps<{
	modelValue: boolean;
	datasourceId: number;
	datasourceName: string;
}>();

defineEmits<{
	'update:modelValue': [value: boolean];
}>();

const relations = ref<LogicalRelation[]>([]);
const tables = ref<string[]>([]);
const sourceColumns = ref<string[]>([]);
const targetColumns = ref<string[]>([]);
const loadingSourceColumns = ref(false);
const loadingTargetColumns = ref(false);
const addingRelation = ref(false);
const deletingRelationId = ref<number | null>(null);

const fkForm = reactive({
	sourceTableName: '',
	sourceColumnName: '',
	targetTableName: '',
	targetColumnName: '',
	relationType: '1:N',
});

const isFormValid = computed(
	() =>
		fkForm.sourceTableName &&
		fkForm.sourceColumnName &&
		fkForm.targetTableName &&
		fkForm.targetColumnName &&
		fkForm.relationType,
);

const { $tip } = useNuxtApp();
const { t } = useI18n();

watch(
	() => props.modelValue,
	async (visible) => {
		if (!visible || !props.datasourceId) return;
		resetForm();
		try {
			const [relationsRes, tableData] = await Promise.all([
				datasourceService.getLogicalRelations(props.datasourceId),
				datasourceService.getDatasourceTables(props.datasourceId),
			]);
			if (relationsRes.success) relations.value = relationsRes.data || [];
			tables.value = tableData || [];
		} catch {
			$tip(t('dataSource.loadFkFailed'), { color: 'error', icon: 'mdi-alert-circle' });
		}
	},
);

function resetForm() {
	fkForm.sourceTableName = '';
	fkForm.sourceColumnName = '';
	fkForm.targetTableName = '';
	fkForm.targetColumnName = '';
	sourceColumns.value = [];
	targetColumns.value = [];
}

async function fetchColumns(tableName: string, type: 'source' | 'target') {
	if (type === 'source') {
		fkForm.sourceColumnName = '';
		sourceColumns.value = [];
	} else {
		fkForm.targetColumnName = '';
		targetColumns.value = [];
	}
	if (!props.datasourceId || !tableName) return;

	if (type === 'source') loadingSourceColumns.value = true;
	else loadingTargetColumns.value = true;
	try {
		const columns = await datasourceService.getTableColumns(
			props.datasourceId,
			tableName,
		);
		if (type === 'source') sourceColumns.value = columns;
		else targetColumns.value = columns;
	} catch {
		if (type === 'source') sourceColumns.value = [];
		else targetColumns.value = [];
	} finally {
		if (type === 'source') loadingSourceColumns.value = false;
		else loadingTargetColumns.value = false;
	}
}

async function handleAdd() {
	if (!props.datasourceId) return;
	addingRelation.value = true;
	try {
		const res = await datasourceService.addLogicalRelation(props.datasourceId, {
			...fkForm,
			description: '',
		});
		if (res.success && res.data) {
			relations.value.push(res.data);
			$tip(t('dataSource.addRelationSuccess'));
			resetForm();
		} else {
			$tip(res.message || t('dataSource.addFailed'), {
				color: 'error',
				icon: 'mdi-alert-circle',
			});
		}
	} catch {
		$tip(t('dataSource.addFailed'), { color: 'error', icon: 'mdi-alert-circle' });
	} finally {
		addingRelation.value = false;
	}
}

function handleDelete(relationId: number) {
	const { showConfirm } = useConfirm();
	showConfirm({
		title: t('dataSource.deleteConfirmTitle'),
		message: t('dataSource.deleteFkConfirmMessage'),
		confirmText: t('dataSource.delete'),
		icon: 'mdi-alert-circle',
		onConfirm: async () => {
			deletingRelationId.value = relationId;
			try {
				const res = await datasourceService.deleteLogicalRelation(
					props.datasourceId,
					relationId,
				);
				if (res.success) {
					relations.value = relations.value.filter(
						(item) => item.id !== relationId,
					);
					$tip(t('dataSource.deleteSuccess'));
				} else {
					$tip(res.message || t('dataSource.deleteFailed'), {
						color: 'error',
						icon: 'mdi-alert-circle',
					});
				}
			} catch {
				$tip(t('dataSource.deleteFailed'), {
					color: 'error',
					icon: 'mdi-alert-circle',
				});
			} finally {
				deletingRelationId.value = null;
			}
		},
	});
}
</script>
