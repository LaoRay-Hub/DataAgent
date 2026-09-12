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
	<div class="result-set-wrap">
		<!-- Error state -->
		<div v-if="errorMsg" class="result-error">
			<v-icon size="14" color="error" class="mr-1">mdi-alert-circle-outline</v-icon>
			{{ errorMsg }}
		</div>

		<!-- Empty state -->
		<div v-else-if="!columns.length" class="result-empty">
			{{ t('chat.noData') }}
		</div>

		<!-- Table -->
		<template v-else>
			<div class="result-header">
				<span class="result-count">{{ t('chat.recordCount', { count: totalRows }) }}</span>
				<div v-if="totalPages > 1" class="pagination">
					<span class="pagination-info">{{
						t('chat.pageInfo', { current: currentPage, total: totalPages })
					}}</span>
					<button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
						<v-icon size="13">mdi-chevron-left</v-icon>
					</button>
					<button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
						<v-icon size="13">mdi-chevron-right</v-icon>
					</button>
				</div>
			</div>
			<div class="table-container custom-scrollbar">
				<table class="result-table">
					<thead>
						<tr>
							<th v-for="col in columns" :key="col">{{ col }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(row, i) in pageData" :key="i">
							<td v-for="col in columns" :key="col">{{ row[col] ?? '' }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ResultData } from '~/services/resultSet/index';

const props = defineProps<{
	data: ResultData | null;
	pageSize?: number;
}>();

const { t } = useI18n();
const currentPage = ref(1);
const pageSz = computed(() => props.pageSize || 20);
const columns = computed(() => props.data?.resultSet?.column || []);
const allRows = computed(() => props.data?.resultSet?.data || []);
const totalRows = computed(() => allRows.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalRows.value / pageSz.value)));
const pageData = computed(() => {
	const start = (currentPage.value - 1) * pageSz.value;
	return allRows.value.slice(start, start + pageSz.value);
});
const errorMsg = computed(() => props.data?.resultSet?.errorMsg || '');
</script>

<style scoped>
.result-set-wrap {
	font-size: 13px;
}
.result-error {
	display: flex;
	align-items: center;
	background: var(--da-danger-soft);
	color: var(--da-danger-strong);
	padding: 10px 14px;
	font-size: 13px;
}
.result-empty {
	text-align: center;
	color: var(--da-text-faint);
	padding: 16px;
	font-size: 13px;
}
.result-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 12px;
	background: var(--da-surface-soft);
	border-bottom: 1px solid var(--da-border-mute);
}
.result-count {
	font-size: 12px;
	color: var(--da-text-muted);
}
.pagination {
	display: flex;
	align-items: center;
	gap: 4px;
}
.pagination-info {
	font-size: 11.5px;
	color: var(--da-text-muted);
	padding: 0 4px;
}
.page-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	background: var(--da-surface);
	border: 1px solid var(--da-border);
	border-radius: 4px;
	color: var(--da-text);
	cursor: pointer;
	transition: background 0.1s;
}
.page-btn:hover:not(:disabled) {
	background: var(--da-surface-mute);
}
.page-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}
.table-container {
	overflow-x: auto;
}
.result-table {
	width: 100%;
	border-collapse: collapse;
}
.result-table th {
	background: var(--da-surface-soft);
	padding: 8px 12px;
	border-bottom: 1px solid var(--da-border);
	font-weight: 600;
	color: var(--da-text-secondary);
	font-size: 12.5px;
	text-align: left;
	white-space: nowrap;
}
.result-table td {
	padding: 7px 12px;
	border-bottom: 1px solid var(--da-surface-mute);
	color: var(--da-text-body);
	font-size: 12.5px;
	word-break: break-word;
	max-width: 200px;
}
.result-table tr:hover td {
	background: var(--da-surface-soft);
}
.custom-scrollbar::-webkit-scrollbar { height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--da-border-faint); border-radius: 4px; }
</style>
