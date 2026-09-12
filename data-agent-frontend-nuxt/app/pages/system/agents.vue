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
	<v-container fluid class="pa-8 agents-container">
		<!-- Header Section -->
		<header class="d-flex align-center justify-space-between mb-8">
			<div>
				<h1 class="text-h4 font-weight-bold mb-1 page-title">{{ t('agentManage.pageTitle') }}</h1>
				<p class="text-body-2 text-medium-emphasis">
					{{ t('agentManage.pageSubtitle') }}
				</p>
			</div>
			<div class="d-flex ga-3">
				<v-btn
					variant="outlined"
					prepend-icon="mdi-refresh"
					:loading="loading"
					class="text-none refresh-btn"
					@click="loadAgents"
				>
					{{ t('agentManage.refresh') }}
				</v-btn>
				<v-btn
					color="var(--da-text)"
					prepend-icon="mdi-plus"
					class="text-none px-6"
					elevation="0"
					@click="goToCreateAgent"
				>
					{{ t('agentManage.createAgent') }}
				</v-btn>
			</div>
		</header>

		<!-- Filter and Search Section -->
		<v-card variant="flat" border class="rounded-lg mb-4 pa-4">
			<div class="d-flex flex-wrap ga-3 align-center">
				<v-text-field
					v-model="searchKeyword"
					:placeholder="t('agentManage.searchPlaceholder')"
					prepend-inner-icon="mdi-magnify"
					variant="outlined"
					density="compact"
					clearable
					hide-details
					class="search-field"
					style="max-width: 350px"
				/>

				<v-spacer />

				<v-btn-toggle
					v-model="activeFilter"
					mandatory
					rounded="pill"
					color="primary"
					class="filter-toggle"
					density="comfortable"
					variant="flat"
				>
					<v-btn value="all" variant="flat" class="px-6 text-none font-weight-medium">
						{{ t('agentManage.filterAll') }}
						<v-chip size="x-small" variant="flat" class="ml-2 count-chip">{{ agents.length }}</v-chip>
					</v-btn>
					<v-btn value="published" variant="flat" class="px-6 text-none font-weight-medium">
						{{ t('agentManage.filterPublished') }}
						<v-chip size="x-small" variant="flat" class="ml-2 count-chip count-chip--success">{{ publishedCount }}</v-chip>
					</v-btn>
					<v-btn value="draft" variant="flat" class="px-6 text-none font-weight-medium">
						{{ t('agentManage.filterDraft') }}
						<v-chip size="x-small" variant="flat" class="ml-2 count-chip count-chip--warning">{{ draftCount }}</v-chip>
					</v-btn>
					<v-btn value="offline" variant="flat" class="px-6 text-none font-weight-medium">
						{{ t('agentManage.filterOffline') }}
						<v-chip size="x-small" variant="flat" class="ml-2 count-chip">{{ offlineCount }}</v-chip>
					</v-btn>
				</v-btn-toggle>
			</div>
		</v-card>

		<!-- Data Table -->
		<v-card variant="flat" border class="rounded-lg">
			<v-data-table
				:headers="headers"
				:items="filteredAgents"
				:loading="loading"
				item-value="id"
				hover
				hide-default-footer
			>
				<!-- ID Column -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.id="{ item }">
					<span class="text-body-2 font-weight-medium cell-muted">{{ item.id }}</span>
				</template>

				<!-- Avatar + Name Column -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.name="{ item }">
					<div class="d-flex align-center ga-3">
						<v-avatar size="40" rounded="lg">
							<v-img v-if="item.avatar" :src="item.avatar" />
							<span v-else class="text-caption">{{ getInitials(item.name) }}</span>
						</v-avatar>
						<div>
							<div class="text-subtitle-2 font-weight-bold">{{ item.name }}</div>
							<div class="text-caption text-medium-emphasis">{{ item.category || t('agentManage.uncategorized') }}</div>
						</div>
					</div>
				</template>

				<!-- Description Column -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.description="{ item }">
					<div class="text-body-2 cell-body" style="max-width: 300px;">
						{{ item.description || t('agentManage.noDescription') }}
					</div>
				</template>

				<!-- Tags Column -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.tags="{ item }">
					<div class="d-flex align-center ga-1">
						<template v-if="parseTags(item.tags).length > 0">
							<v-chip
								v-for="(tag, index) in parseTags(item.tags).slice(0, 4)"
								:key="index"
								size="small"
								color="var(--da-primary)"
								variant="tonal"
							>
								{{ tag }}
							</v-chip>
							<v-btn
								v-if="parseTags(item.tags).length > 4"
								variant="text"
								size="small"
								icon
								@click="showAllTags(item)"
							>
								<v-icon size="16">mdi-dots-horizontal</v-icon>
								<v-tooltip activator="parent" location="top">{{ t('agentManage.viewAllTags') }}</v-tooltip>
							</v-btn>
						</template>
						<span v-else class="text-caption cell-faint">{{ t('agentManage.noTags') }}</span>
					</div>
				</template>

				<!-- Status Column -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.status="{ item }">
					<v-chip size="small" :color="getStatusColor(item.status)" variant="tonal">
						{{ getStatusText(item.status) }}
					</v-chip>
				</template>

				<!-- Create Time Column -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.createTime="{ item }">
					<span class="text-body-2 cell-body">{{ formatTime(item.createTime) }}</span>
				</template>

				<!-- Actions Column -->
				<!-- eslint-disable-next-line vue/valid-v-slot -->
				<template #item.actions="{ item }">
					<div class="d-flex ga-1">
						<v-btn
							icon="mdi-pencil-outline"
							variant="text"
							size="small"
							color="var(--da-primary-strong)"
							@click="handleEdit(item)"
						>
							<v-icon size="20" />
							<v-tooltip activator="parent" location="top">{{ t('agentManage.edit') }}</v-tooltip>
						</v-btn>
						<v-btn
							icon="mdi-delete-outline"
							variant="text"
							size="small"
							color="error"
							@click="handleDelete(item)"
						>
							<v-icon size="20" />
							<v-tooltip activator="parent" location="top">{{ t('agentManage.delete') }}</v-tooltip>
						</v-btn>
					</div>
				</template>

				<!-- No Data Slot -->
				<template #no-data>
					<div class="text-center py-16">
						<v-icon icon="mdi-robot-confused-outline" size="64" color="var(--da-surface-alt)" class="mb-4" />
						<h3 class="text-h6 font-weight-medium cell-body">
							{{ debouncedSearch.trim() ? t('agentManage.noMatchTitle') : t('agentManage.emptyTitle') }}
						</h3>
						<p class="text-body-2 cell-faint mb-6">
							{{
								debouncedSearch.trim()
									? t('agentManage.noMatchDesc', { keyword: debouncedSearch.trim() })
									: activeFilter === 'all'
										? t('agentManage.emptyDescAll')
										: t('agentManage.emptyDescFiltered')
							}}
						</p>
						<v-btn
							v-if="activeFilter === 'all' && !debouncedSearch.trim()"
							variant="flat"
							class="create-agent-btn"
							prepend-icon="mdi-plus"
							@click="goToCreateAgent"
						>
							{{ t('agentManage.createAgent') }}
						</v-btn>
					</div>
				</template>

				<!-- Loading Slot -->
				<template #loading>
					<v-skeleton-loader type="table-row@5" />
				</template>
			</v-data-table>
		</v-card>

		<!-- Edit Dialog -->
		<v-dialog v-model="editDialog" max-width="600" persistent>
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center justify-space-between px-6 pt-6 pb-4">
					<div class="d-flex align-center">
						<v-icon icon="mdi-pencil-circle" color="var(--da-primary-strong)" class="mr-3" size="28" />
						<span class="text-h6 font-weight-bold">{{ t('agentManage.editDialogTitle') }}</span>
					</div>
					<v-btn icon="mdi-close" variant="text" size="small" @click="closeEditDialog" />
				</v-card-title>
				<v-divider />

				<v-card-text class="pa-6">
					<v-form ref="editFormRef">
						<div class="mb-4">
							<p class="text-body-2 font-weight-medium field-label mb-2">
								{{ t('agentManage.nameLabel') }} <span class="text-error">*</span>
							</p>
							<v-text-field
								v-model="editForm.name"
								:placeholder="t('agentManage.namePlaceholder')"
								variant="outlined"
								density="compact"
								:rules="[v => !!v?.trim() || t('agentManage.nameRequired')]"
								hide-details="auto"
							/>
						</div>

						<div class="mb-4">
							<p class="text-body-2 font-weight-medium field-label mb-2">{{ t('agentManage.descriptionLabel') }}</p>
							<v-textarea
								v-model="editForm.description"
								:placeholder="t('agentManage.descriptionPlaceholder')"
								variant="outlined"
								density="compact"
								rows="3"
								hide-details
							/>
						</div>

						<div class="mb-4">
							<p class="text-body-2 font-weight-medium field-label mb-2">{{ t('agentManage.categoryLabel') }}</p>
							<v-text-field
								v-model="editForm.category"
								:placeholder="t('agentManage.categoryPlaceholder')"
								variant="outlined"
								density="compact"
								hide-details
							/>
						</div>

						<div class="mb-4">
							<p class="text-body-2 font-weight-medium field-label mb-2">{{ t('agentManage.tagsLabel') }}</p>
							<v-text-field
								v-model="editForm.tags"
								:placeholder="t('agentManage.tagsPlaceholder')"
								variant="outlined"
								density="compact"
								hide-details
							/>
						</div>

						<div class="mb-2">
							<p class="text-body-2 font-weight-medium field-label mb-2">{{ t('agentManage.statusLabel') }}</p>
							<v-select
								v-model="editForm.status"
								:items="statusOptions"
								item-title="label"
								item-value="value"
								variant="outlined"
								density="compact"
								hide-details
							/>
						</div>
					</v-form>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4 d-flex justify-end ga-2">
					<v-btn variant="outlined" class="text-none px-6" @click="closeEditDialog">{{ t('agentManage.cancel') }}</v-btn>
					<v-btn
						color="var(--da-primary-heading)"
						class="text-none px-6"
						elevation="0"
						:loading="saveLoading"
						@click="saveEdit"
					>
						{{ t('agentManage.saveChanges') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Tags Dialog -->
		<v-dialog v-model="tagsDialog" max-width="500">
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center justify-space-between px-6 pt-6 pb-4">
					<div class="d-flex align-center">
						<v-icon icon="mdi-tag-multiple" color="var(--da-primary)" class="mr-3" size="24" />
						<span class="text-h6 font-weight-bold">{{ t('agentManage.allTagsTitle') }}</span>
					</div>
					<v-btn icon="mdi-close" variant="text" size="small" @click="tagsDialog = false" />
				</v-card-title>
				<v-divider />

				<v-card-text class="pa-6">
					<div class="d-flex flex-wrap ga-2">
						<v-chip
							v-for="(tag, index) in currentTags"
							:key="index"
							size="default"
							color="var(--da-primary)"
							variant="tonal"
						>
							{{ tag }}
						</v-chip>
						<div v-if="currentTags.length === 0" class="text-body-2 cell-faint text-center w-100 py-4">
							{{ t('agentManage.noTags') }}
						</div>
					</div>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-4 d-flex justify-end">
					<v-btn variant="text" class="text-none" @click="tagsDialog = false">{{ t('agentManage.close') }}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>

<script setup lang="ts">
import type { Agent } from '~/services/agent/index';
import agentService from '~/services/agent/index';
import { useCrudPage } from '~/composables/useCrudPage/index';

const { $tip } = useNuxtApp();
const { showConfirm } = useConfirm();
const router = useRouter();
const { t, locale } = useI18n();

// ——— 额外状态 ———
const activeFilter = ref<'all' | 'published' | 'draft' | 'offline'>('all');
const searchKeyword = ref('');
const tagsDialog = ref(false);
const currentTags = ref<string[]>([]);
const editingId = ref<number | undefined>(undefined);

// ——— useCrudPage ———
const {
	loading,
	saveLoading,
	items: agents,
	dialogVisible: editDialog,
	formRef: editFormRef,
	formData: editForm,
	loadItems: loadAgents,
	openEditDialog,
	closeDialog: _closeDialog,
} = useCrudPage<Agent>({
	loadFn: () => agentService.list(),
	updateFn: async (id, data) => { const r = await agentService.update(id, data); return r != null; },
	deleteFn: (id) => agentService.delete(id),
	defaultFormFactory: () => ({
		id: undefined,
		name: '',
		description: '',
		category: '',
		tags: '',
		status: 'draft',
	}),
});

// ——— Debounced search ———
const debouncedSearch = ref('');
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchKeyword, (newVal) => {
	if (searchTimer) clearTimeout(searchTimer);
	searchTimer = setTimeout(() => { debouncedSearch.value = newVal; }, 300);
});

// Table Headers（computed 保证切换语言后表头跟随更新）
const headers = computed(() => [
	{ title: t('agentManage.colId'), key: 'id', width: '80px', sortable: false },
	{ title: t('agentManage.colAgent'), key: 'name', minWidth: '200px', sortable: false },
	{ title: t('agentManage.colDescription'), key: 'description', minWidth: '250px', sortable: false },
	{ title: t('agentManage.colTags'), key: 'tags', width: '220px', sortable: false },
	{ title: t('agentManage.colStatus'), key: 'status', width: '100px', sortable: false },
	{ title: t('agentManage.colCreateTime'), key: 'createTime', width: '170px', sortable: false },
	{ title: t('agentManage.colActions'), key: 'actions', width: '120px', sortable: false, align: 'center' as const },
]);

// value 是提交给后端的枚举，label 需随语言切换，因此用 computed
const statusOptions = computed(() => [
	{ label: t('agentManage.statusDraft'), value: 'draft' },
	{ label: t('agentManage.statusPublished'), value: 'published' },
	{ label: t('agentManage.statusOffline'), value: 'offline' },
]);

const publishedCount = computed(() => agents.value.filter(a => a.status === 'published').length);
const draftCount = computed(() => agents.value.filter(a => a.status === 'draft').length);
const offlineCount = computed(() => agents.value.filter(a => a.status === 'offline').length);

const filteredAgents = computed(() => {
	let filtered = agents.value;
	if (activeFilter.value !== 'all') {
		filtered = filtered.filter(agent => agent.status === activeFilter.value);
	}
	if (debouncedSearch.value.trim()) {
		const keyword = debouncedSearch.value.toLowerCase().trim();
		filtered = filtered.filter(agent => {
			const nameMatch = agent.name?.toLowerCase().includes(keyword);
			const descMatch = agent.description?.toLowerCase().includes(keyword);
			const idMatch = agent.id?.toString().includes(keyword);
			return nameMatch || descMatch || idMatch;
		});
	}
	return filtered;
});

function goToCreateAgent() { router.push('/agent/new'); }

function handleEdit(agent: Agent) {
	editingId.value = agent.id;
	openEditDialog(agent);
}

function closeEditDialog() {
	_closeDialog();
	editingId.value = undefined;
}

async function saveEdit() {
	if (!editFormRef.value) return;
	const { valid } = await editFormRef.value.validate();
	if (!valid) return;
	if (!editingId.value) {
		$tip(t('agentManage.tipAgentIdMissing'), { icon: 'mdi-alert-circle', color: 'error' });
		return;
	}
	saveLoading.value = true;
	try {
		const result = await agentService.update(editingId.value, {
			name: editForm.value.name?.trim(),
			description: editForm.value.description?.trim(),
			category: editForm.value.category?.trim(),
			tags: editForm.value.tags?.trim(),
			status: editForm.value.status,
		});
		if (result) {
			$tip(t('agentManage.tipUpdateSuccess'));
			closeEditDialog();
			const index = agents.value.findIndex(a => a.id === editingId.value);
			if (index !== -1) { agents.value[index] = { ...agents.value[index], ...editForm.value }; }
		} else {
			$tip(t('agentManage.tipUpdateFailed'), { icon: 'mdi-alert-circle', color: 'error' });
		}
	} catch {
		$tip(t('agentManage.tipUpdateNetworkError'), { icon: 'mdi-alert-circle', color: 'error' });
	} finally {
		saveLoading.value = false;
	}
}

function showAllTags(agent: Agent) {
	currentTags.value = parseTags(agent.tags);
	tagsDialog.value = true;
}

function handleDelete(agent: Agent) {
	if (!agent.id) {
		$tip(t('agentManage.tipAgentIdMissing'), { icon: 'mdi-alert-circle', color: 'error' });
		return;
	}
	showConfirm({
		title: t('agentManage.deleteConfirmTitle'),
		message: t('agentManage.deleteConfirmMessage', { name: agent.name || '' }),
		icon: 'mdi-help-circle',
		confirmText: t('agentManage.deleteConfirmBtn'),
		onConfirm: async () => {
			try {
				const success = await agentService.delete(agent.id!);
				if (success) {
					$tip(t('agentManage.tipDeleteSuccess'));
					agents.value = agents.value.filter(a => a.id !== agent.id);
				} else {
					$tip(t('agentManage.tipDeleteFailed'), { icon: 'mdi-alert-circle', color: 'error' });
				}
			} catch {
				$tip(t('agentManage.tipDeleteNetworkError'), { icon: 'mdi-alert-circle', color: 'error' });
			}
		},
	});
}

const getInitials = (name?: string) => {
	if (!name) return 'AI';
	return name.substring(0, 2).toUpperCase();
};

const parseTags = (tags?: string) => {
	if (!tags || tags.trim() === '') return [];
	return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
};

const getStatusText = (status?: string) => {
	const statusMap: Record<string, string> = {
		published: t('agentManage.statusPublished'),
		draft: t('agentManage.statusDraft'),
		offline: t('agentManage.statusOffline'),
	};
	return statusMap[status || ''] || status || t('agentManage.statusUnknown');
};

const getStatusColor = (status?: string) => {
	// Vuetify 的 grey 不随深色主题变化，改用语义变量（tonal chip 的文字与底色均由该颜色派生）
	const colorMap: Record<string, string> = {
		published: 'var(--da-success)',
		draft: 'var(--da-warning)',
		offline: 'var(--da-text-faint)',
	};
	return colorMap[status || ''] || 'var(--da-text-faint)';
};

const formatTime = (time?: Date | string) => {
	if (!time) return '';
	const date = typeof time === 'string' ? new Date(time) : time;
	return date.toLocaleString(locale.value === 'en-US' ? 'en-US' : 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => { loadAgents(); });
</script>

<style scoped>
.agents-container {
	/* 原 #f8fafc，与 --da-surface-soft 浅色值一致 */
	background-color: var(--da-surface-soft);
	min-height: 100%;
}

/* 原 .text-slate-900（#0f172a），与 --da-text 浅色值一致 */
.page-title {
	color: var(--da-text);
}

/* 原内联 border-color: #e2e8f0，与 --da-border 浅色值一致；加 .v-btn 前缀压过 Vuetify 变体样式 */
.v-btn.refresh-btn {
	border-color: var(--da-border);
}

.filter-toggle {
	/* 原 #f1f5f9，与 --da-surface-mute 浅色值一致 */
	background-color: var(--da-surface-mute) !important;
	padding: 4px !important;
}

.filter-toggle .v-btn {
	text-transform: none !important;
}

.search-field {
	border-color: var(--da-border);
}

/* 原 grey-lighten-3 计数徽标（浅色下几乎不可见），改用语义变量保证两种皮肤可读；加 .v-chip 前缀压过变体样式 */
.v-chip.count-chip {
	background-color: var(--da-surface-mute);
	color: var(--da-text-secondary);
}

/* 原 success-lighten-3 / warning-lighten-3，浅色底色视觉等价、文字改用可读的深色 */
.v-chip.count-chip--success {
	background-color: var(--da-success-soft);
	color: var(--da-success-text);
}

.v-chip.count-chip--warning {
	background-color: var(--da-warning-soft);
	color: var(--da-warning-text-strong);
}

/* 原 text-grey-darken-2（#616161），--da-text-muted 浅色值 #64748b 视觉等价 */
.field-label,
.cell-muted {
	color: var(--da-text-muted);
}

/* 原 text-grey-darken-1（#424242），--da-text-body 浅色值 #334155 视觉等价 */
.cell-body {
	color: var(--da-text-body);
}

/* 原 text-grey（#9e9e9e）只有 2.6:1；这里承载「暂无标签」等正文信息而非装饰，改用 muted 让两种主题都过 AA */
.cell-faint {
	color: var(--da-text-muted);
}

/* 原 color="black" flat 按钮（黑底白字），深色下反转为亮底深字保证可见；加 .v-btn 前缀压过变体样式 */
.v-btn.create-agent-btn {
	background-color: var(--da-text);
	color: var(--da-surface);
}
</style>
