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
	<v-app id="app">
		<v-main>
			<BaseDrawer v-model="drawer" :drawer-width="280">
				<template #drawer>
					<div class="d-flex flex-column h-100">
						<div class="pa-4 sidebar-section">
							<div class="d-flex align-center mb-3">
								<v-avatar color="primary" size="36" class="mr-3 rounded-lg">
									<v-icon icon="mdi-robot" color="white" size="22" />
								</v-avatar>
								<div class="text-subtitle-2 font-weight-bold sidebar-brand-title">
									{{ t('brand.title') }}
								</div>
							</div>

							<div class="agent-switcher-box">
								<p
									class="text-caption sidebar-caption mb-2 font-weight-bold"
								>
									{{ t('agent.current') }}
								</p>
								<v-select
									v-model="selectedAgentId"
									:items="agentOptions"
									item-title="title"
									item-value="value"
									variant="outlined"
									density="compact"
									hide-details
									:placeholder="t('agent.selectPlaceholder')"
									class="agent-switcher"
									menu-icon="mdi-chevron-down"
									:menu-props="{
										contentClass: 'agent-switcher-menu',
										offset: [0, 8],
									}"
									:list-props="{
										bgColor: 'var(--da-sidebar-bg)',
									}"
									item-color="var(--da-primary-text)"
									@update:model-value="handleAgentSwitch"
								>
									<template #selection="{ item }">
										<div
											class="agent-option agent-option--selection d-flex align-center w-100"
										>
											<v-avatar size="24" class="mr-2 sidebar-avatar">
												<v-img
													v-if="item.raw.avatar"
													:src="item.raw.avatar"
													cover
												/>
												<v-icon
													v-else
													icon="mdi-robot"
													size="14"
													color="var(--da-primary-text)"
												/>
											</v-avatar>
											<div class="agent-option__text">
												<div
													class="agent-option__title agent-option__title--active"
												>
													{{ item.raw.title }}
												</div>
												<div class="agent-option__subtitle">
													{{ item.raw.subtitle }}
												</div>
											</div>
										</div>
									</template>
									<template #item="{ props, item }">
										<v-list-item
											v-bind="props"
											:title="undefined"
											:subtitle="undefined"
											class="agent-option"
											:class="{
												'agent-option--active':
													item.raw.value === selectedAgentId,
											}"
										>
											<template #prepend>
												<v-avatar size="28" class="mr-2 sidebar-avatar">
													<v-img
														v-if="item.raw.avatar"
														:src="item.raw.avatar"
														cover
													/>
													<v-icon
														v-else
														icon="mdi-robot"
														size="15"
														color="var(--da-primary-text)"
													/>
												</v-avatar>
											</template>
											<v-list-item-title class="agent-option__title">{{
												item.raw.title
											}}</v-list-item-title>
											<v-list-item-subtitle class="agent-option__subtitle">
												<span class="agent-tags-text">{{
													item.raw.subtitle
												}}</span>
											</v-list-item-subtitle>
											<template #append>
												<v-icon
													v-if="item.raw.value === selectedAgentId"
													icon="mdi-check"
													color="var(--da-primary-text)"
													size="16"
												/>
											</template>
										</v-list-item>
									</template>
								</v-select>
							</div>
						</div>

						<v-list
							v-model:opened="openedGroups"
							density="compact"
							nav
							class="flex-grow-1 pa-2 px-4 custom-scrollbar bg-transparent"
						>
							<v-list-item
								prepend-icon="mdi-chat-processing-outline"
								:title="t('menu.chat')"
								:active="isActive('/chat')"
								class="rounded-lg mb-1 navigation-item"
								color="primary"
								@click="navigateToPath('/chat')"
							/>
							<!-- <v-list-item
								prepend-icon="mdi-chart-box-outline"
								:active="isActive('/dashboard')"
								class="rounded-lg mb-1 navigation-item"
								color="primary"
								title="数据看板"
								@click="navigateToPath('/dashboard')"
							/> -->
							<v-list-item
								prepend-icon="mdi-auto-fix"
								:active="isActive('/prompt-config')"
								class="rounded-lg mb-1 navigation-item"
								color="primary"
								:title="t('menu.promptConfig')"
								@click="navigateToPath('/prompt-config')"
							/>

							<v-list-group value="knowledge">
								<template #activator="{ props }">
									<v-list-item
										v-bind="props"
										:title="t('menu.knowledge')"
										class="text-overline sidebar-group-title mt-4"
									/>
								</template>
								<v-list-item
									prepend-icon="mdi-book-open-variant"
									:title="t('menu.businessKnowledge')"
									:active="isActive('/knowledge/business')"
									density="compact"
									class="rounded-lg mb-1 navigation-sub-item"
									color="primary"
									@click="navigateToPath('/knowledge/business')"
								/>
								<v-list-item
									prepend-icon="mdi-brain"
									:title="t('menu.agentKnowledge')"
									:active="isActive('/knowledge/agents')"
									density="compact"
									class="rounded-lg mb-1 navigation-sub-item"
									color="primary"
									@click="navigateToPath('/knowledge/agents')"
								/>
								<v-list-item
									prepend-icon="mdi-vector-intersection"
									:title="t('menu.semanticModels')"
									:active="isActive('/knowledge/semantic-models')"
									density="compact"
									class="rounded-lg mb-1 navigation-sub-item"
									color="primary"
									@click="navigateToPath('/knowledge/semantic-models')"
								/>
							</v-list-group>

							<v-list-group value="system">
								<template #activator="{ props }">
									<v-list-item
										v-bind="props"
										:title="t('menu.settings')"
										class="text-overline sidebar-group-title mt-2"
									/>
								</template>
								<v-list-item
									prepend-icon="mdi-robot-outline"
									:title="t('menu.agentManage')"
									:active="isActive('/system/agents')"
									density="compact"
									class="rounded-lg mb-1 navigation-sub-item"
									color="primary"
									@click="navigateToPath('/system/agents')"
								/>
								<v-list-item
									prepend-icon="mdi-database-refresh-outline"
									:title="t('menu.dataSources')"
									:active="isActive('/system/data-sources')"
									density="compact"
									class="rounded-lg mb-1 navigation-sub-item"
									color="primary"
									@click="navigateToPath('/system/data-sources')"
								/>
								<v-list-item
									prepend-icon="mdi-cpu-64-bit"
									:title="t('menu.modelConfig')"
									:active="isActive('/system/model-config')"
									density="compact"
									class="rounded-lg mb-1 navigation-sub-item"
									color="primary"
									@click="navigateToPath('/system/model-config')"
								/>
							</v-list-group>

							<div class="mt-6 pt-4 sidebar-section-top">
								<v-list-item
									color="primary"
									density="compact"
									:active="isActive('/agent/new')"
									variant="flat"
									class="rounded-xl mx-2 shadow-lg new-agent-item"
									@click="navigateToPath('/agent/new')"
								>
									<div class="d-flex align-center justify-center gap-2 w-100">
										<v-icon icon="mdi-plus-box-outline" size="16" rounded />
										<span class="font-weight-bold text-caption mx-1">{{
											t('menu.newAgent')
										}}</span>
									</div>
								</v-list-item>
							</div>
						</v-list>

						<!-- <div class="pa-2 border-t border-white/5">
							<v-list-item class="rounded-lg navigation-item logout-item" color="red-lighten-2" @click="logout">
								<template #prepend>
									<v-avatar size="24" color="grey-darken-3"><v-icon icon="mdi-account" size="14" color="white" /></v-avatar>
								</template>
								<v-list-item-title class="text-caption font-weight-bold ms-2">root</v-list-item-title>
								<template #append><v-icon icon="mdi-logout" size="24" color="red" /></template>
							</v-list-item>
						</div> -->
					</div>
				</template>

				<template #header="{ toggle, isOpen }">
					<v-btn icon variant="text" size="small" class="mr-2" @click="toggle">
						<v-icon :icon="isOpen ? 'mdi-menu-open' : 'mdi-menu'" />
					</v-btn>
					<div class="text-subtitle-1 font-weight-medium header-title">
						{{ currentRouteTitle }}
					</div>
					<v-spacer />
				</template>

				<slot />
			</BaseDrawer>
		</v-main>

		<ConfirmDialog
			v-model="dialogState.isVisible"
			:title="dialogState.title"
			:message="dialogState.message"
			:prepend-icon="dialogState.icon"
			:confirm-text="dialogState.confirmText"
			@confirm="handleGlobalConfirm"
		/>
		<Tip />
	</v-app>
</template>

<script setup lang="ts">
import BaseDrawer from '../components/BaseDrawer/index.vue';
import agentService from '~/services/agent/index';
import modelConfigService from '~/services/modelConfig/index';
import { useDisplay } from 'vuetify';

const { dialogState, handleGlobalConfirm } = useConfirm();
const { t } = useI18n();
const drawer = ref(true);
const { mobile } = useDisplay();
const router = useRouter();
const route = useRoute();
// 默认都展开
const openedGroups = ref(['knowledge', 'system']);

watch(
	mobile,
	(isMobile) => {
		if (isMobile) drawer.value = false;
	},
	{ immediate: true },
);

type DrawerAgentOption = {
	id: number;
	name: string;
	title: string;
	value: number;
	subtitle: string;
	avatar?: string;
	tags?: string;
};

const agents = ref<DrawerAgentOption[]>([]);
const selectedAgentId = ref<number | undefined>(undefined);
const globalChatModelName = ref('');

const routeTitleKeyMap: Record<string, string> = {
	'/chat': 'menu.chat',
	'/dashboard': 'menu.dashboard',
	'/prompt-config': 'menu.promptConfig',
	'/knowledge/business': 'menu.businessKnowledge',
	'/knowledge/agents': 'menu.agentKnowledge',
	'/knowledge/semantic-models': 'menu.semanticModels',
	'/system/agents': 'menu.agentManage',
	'/system/data-sources': 'menu.dataSources',
	'/system/model-config': 'menu.modelConfig',
	'/agent/new': 'menu.newAgent',
};

const agentOptions = computed(() => agents.value);

const currentRouteTitle = computed(() => {
	if (route.path.startsWith('/agent/') && route.path !== '/agent/new') {
		return t('page.agentDetail');
	}
	const key = routeTitleKeyMap[route.path];
	return key ? t(key) : t('brand.title');
});

function parseRouteAgentId() {
	const pathId = Number(route.params.id);
	if (
		route.path.startsWith('/agent/') &&
		route.path !== '/agent/new' &&
		Number.isFinite(pathId) &&
		pathId > 0
	) {
		return pathId;
	}
	const queryId = Number(route.query.agentId);
	if (Number.isFinite(queryId) && queryId > 0) {
		return queryId;
	}
	return undefined;
}

function getQueryWithAgentId(agentId?: number) {
	const query: Record<string, string> = {};
	Object.keys(route.query).forEach((key) => {
		const value = route.query[key];
		if (key === 'agentId') return;
		if (Array.isArray(value)) {
			if (value[0]) query[key] = String(value[0]);
		} else if (value !== undefined) {
			query[key] = String(value);
		}
	});
	if (agentId) query.agentId = String(agentId);
	return query;
}

function applyAgentToCurrentRoute(agentId: number, replace = false) {
	if (route.path === '/agent/new') return;
	const target =
		route.path.startsWith('/agent/') && route.path !== '/agent/new'
			? { path: `/agent/${agentId}` }
			: { path: route.path, query: getQueryWithAgentId(agentId) };
	if (replace) {
		router.replace(target);
	} else {
		router.push(target);
	}
}

function navigateToPath(path: string) {
	if (path === '/agent/new') {
		if (route.path !== path) router.push({ path });
		return;
	}
	if (
		route.path === path &&
		path.startsWith('/agent/') &&
		selectedAgentId.value
	) {
		return;
	}
	if (selectedAgentId.value) {
		if (path.startsWith('/agent/') && path !== '/agent/new') {
			router.push({ path: `/agent/${selectedAgentId.value}` });
			return;
		}
		router.push({ path, query: { agentId: String(selectedAgentId.value) } });
		return;
	}
	router.push({ path });
}

function handleAgentSwitch(value: number | string | undefined) {
	const id = Number(value);
	if (!Number.isFinite(id) || id <= 0) return;
	selectedAgentId.value = id;
	applyAgentToCurrentRoute(id);
}

const isActive = (path: string) => route.path === path;

async function loadGlobalModelName() {
	try {
		const configs = await modelConfigService.list();
		const activeChat = configs.find(
			(item) => item.modelType === 'CHAT' && item.isActive,
		);
		globalChatModelName.value = activeChat?.modelName || '';
	} catch (e) {
		console.error('Failed to load global model name', e);
	}
}

async function loadAgents() {
	const list = await agentService.list();
	agents.value = list
		.filter((item) => item.id !== undefined && item.id > 0)
		.map((item) => {
			const raw = item as unknown as Record<string, unknown>;
			return {
				id: item.id as number,
				name: item.name || `Agent ${item.id}`,
				title: item.name || `Agent ${item.id}`,
				value: item.id as number,
				subtitle: typeof raw.tags === 'string' ? raw.tags : '',
				avatar: typeof raw.avatar === 'string' ? raw.avatar : undefined,
				tags: typeof raw.tags === 'string' ? raw.tags : '',
			};
		});
}

function syncSelectedFromRoute() {
	const routeAgentId = parseRouteAgentId();
	if (routeAgentId && agents.value.some((item) => item.id === routeAgentId)) {
		selectedAgentId.value = routeAgentId;
	}
}

onMounted(async () => {
	await loadGlobalModelName();
	await loadAgents();
	syncSelectedFromRoute();
	const firstAgent = agents.value[0];
	if (!selectedAgentId.value && firstAgent?.id) {
		selectedAgentId.value = firstAgent.id;
		applyAgentToCurrentRoute(selectedAgentId.value, true);
	}
});

watch(
	() => route.fullPath,
	() => {
		syncSelectedFromRoute();
	},
);
</script>

<style scoped>
.header-title {
	color: var(--da-text);
}

.sidebar-section {
	border-bottom: 1px solid var(--da-sidebar-border);
}

.sidebar-section-top {
	border-top: 1px solid var(--da-sidebar-border);
}

.sidebar-avatar {
	border: 1px solid var(--da-sidebar-border);
}

.sidebar-brand-title {
	color: var(--da-text-strong);
}

.sidebar-caption {
	color: var(--da-primary-text);
}

.sidebar-group-title {
	color: var(--da-text-muted);
}

.new-agent-item {
	background: var(--da-primary-deep) !important;
	color: var(--da-text-on-dark) !important;
}

.agent-switcher :deep(.v-field) {
	background: var(--da-sidebar-field);
	border-radius: 10px;
}

.agent-switcher :deep(.v-field__input),
.agent-switcher :deep(.v-field-label),
.agent-switcher :deep(.v-icon) {
	color: var(--da-text);
}

:deep(.agent-switcher-menu) {
	background: var(--da-sidebar-bg) !important;
	border: 1px solid var(--da-primary-border) !important;
	border-radius: 12px !important;
	overflow: hidden;
}

:deep(.agent-switcher-menu .v-list) {
	background: transparent !important;
	padding: 4px !important;
}

:deep(.agent-switcher-menu .v-list-item) {
	border-radius: 8px !important;
	margin-bottom: 2px !important;
	min-height: 44px !important;
}

:deep(.agent-switcher-menu .v-list-item:hover) {
	background: var(--da-primary-soft) !important;
}

.agent-option__text {
	min-width: 0;
	flex: 1;
}

.agent-option__title {
	font-size: 13px;
	line-height: 1.2;
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 170px;
}

.agent-option__title--active {
	color: var(--da-primary-text);
}

.agent-option__subtitle {
	font-size: 10px;
	line-height: 1.2;
	color: var(--da-text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 170px;
	margin-top: 2px;
}

.agent-tags-text {
	background: var(--da-primary-soft);
	color: var(--da-primary-text);
	padding: 1px 6px;
	border-radius: 4px;
	font-size: 9px;
	border: 1px solid var(--da-primary-border);
}

.agent-option--selection .agent-option__title {
	max-width: 145px;
}

.agent-option--selection .agent-option__subtitle {
	max-width: 145px;
}

.navigation-item {
	--v-list-item-padding-start: 16px;
	--v-list-item-min-height: 36px;
}

.navigation-sub-item {
	--v-list-item-padding-start: 28px;
	--v-list-item-min-height: 36px;
}

.custom-scrollbar::-webkit-scrollbar {
	width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
	background: var(--da-sidebar-scrollbar);
	border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
	background: var(--da-sidebar-scrollbar-hover);
}

:deep(.v-list-group__items .v-list-item) {
	padding-inline-start: 16px !important;
}

:deep(.flex-grow-1.v-list .v-list-item) {
	min-height: 36px !important;
}

:deep(.v-list-item__spacer) {
	width: 12px !important;
}
</style>
