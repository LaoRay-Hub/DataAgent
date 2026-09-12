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
	<v-container fluid class="pa-8 model-config-container">
		<!-- Header Section -->
		<header class="d-flex align-center justify-space-between mb-8">
			<div>
				<h1 class="text-h4 font-weight-bold mb-1 page-title">
					{{ t('modelConfig.title') }}
				</h1>
				<p class="text-body-2 text-medium-emphasis">
					{{ t('modelConfig.subtitle') }}
				</p>
			</div>
			<div class="d-flex ga-3">
				<v-btn
					variant="outlined"
					prepend-icon="mdi-refresh"
					:loading="loading"
					class="text-none"
					style="border-color: var(--da-border)"
					@click="fetchConfigs"
				>
					{{ t('modelConfig.refresh') }}
				</v-btn>
				<v-btn
					class="btn-inverse text-none px-6"
					prepend-icon="mdi-plus"
					elevation="0"
					@click="openCreateDialog(activeTab)"
				>
					{{
						activeTab === 'CHAT'
							? t('modelConfig.addChatModel')
							: t('modelConfig.addEmbeddingModel')
					}}
				</v-btn>
			</div>
		</header>

		<!-- Tab Navigation (Segmented Toggle) -->
		<div class="d-flex justify-center mb-8">
			<v-btn-toggle
				v-model="activeTab"
				mandatory
				rounded="pill"
				color="primary"
				class="segmented-toggle border"
				density="comfortable"
				variant="flat"
			>
				<v-btn
					value="CHAT"
					variant="flat"
					class="px-8 text-none font-weight-bold"
					>{{ t('modelConfig.tabChat') }}</v-btn
				>
				<v-btn
					value="EMBEDDING"
					variant="flat"
					class="px-8 text-none font-weight-bold"
					>{{ t('modelConfig.tabEmbedding') }}</v-btn
				>
			</v-btn-toggle>
		</div>

		<v-row justify="center">
			<v-col cols="12" xl="10">
				<!-- Hint Alert (Commented out) -->
				<!--
				<v-alert
					v-if="activeTab === 'EMBEDDING'"
					icon="mdi-information-outline"
					variant="tonal"
					color="blue-grey"
					class="mb-6 rounded-lg text-body-2"
					border="start"
				>
					提示：处理中文建议使用
					<strong>bge-large-zh</strong>；多语言场景推荐使用 OpenAI 系列。
				</v-alert>
				-->

				<!-- Loading State -->
				<div v-if="loading" class="d-flex flex-column ga-4">
					<v-skeleton-loader
						v-for="i in 3"
						:key="i"
						type="list-item-avatar-three-line"
						class="border rounded-lg"
					></v-skeleton-loader>
				</div>

				<!-- List Content -->
				<div v-else>
					<TransitionGroup name="list" tag="div" class="list-container">
						<div
							v-for="model in filteredModels"
							:key="model.id"
							class="list-item-wrap"
						>
							<v-card
								variant="outlined"
								class="model-item-card"
								:class="{ 'is-active': model.isActive }"
								rounded="lg"
							>
								<div class="pa-5 d-flex align-center">
									<!-- Icon -->
									<v-avatar
										:color="
											model.isActive ? 'primary' : 'var(--da-surface-mute)'
										"
										:class="{ 'text-white': model.isActive }"
										size="48"
										rounded="lg"
										class="mr-4"
									>
										<v-icon
											:icon="
												model.modelType === 'CHAT'
													? 'mdi-chat-processing-outline'
													: 'mdi-database-search-outline'
											"
										></v-icon>
									</v-avatar>

									<!-- Info -->
									<div class="flex-grow-1">
										<div class="d-flex align-center mb-1">
											<span class="text-subtitle-1 font-weight-bold mr-2">{{
												model.modelName
											}}</span>
											<!-- 带有呼吸灯的默认标签 -->
											<v-chip
												v-if="model.isActive"
												size="x-small"
												color="primary"
												variant="flat"
												class="px-2 font-weight-bold d-inline-flex align-center"
											>
												<span class="breathing-dot"></span>
												{{ t('modelConfig.defaultBadge') }}
											</v-chip>
										</div>
										<div
											class="d-flex align-center text-caption text-medium-emphasis ga-4"
										>
											<span class="d-flex align-center">
												<v-icon size="14" class="mr-1">mdi-tray-full</v-icon>
												{{ providerLabel(model.provider) }}
											</span>
											<span class="d-flex align-center">
												<v-icon size="14" class="mr-1">mdi-link-variant</v-icon>
												{{ model.baseUrl || t('modelConfig.defaultEndpoint') }}
											</span>
										</div>
									</div>

									<!-- Actions -->
									<div class="d-flex align-center ga-4">
										<v-btn
											v-if="!model.isActive"
											variant="outlined"
											color="primary"
											size="small"
											class="text-none font-weight-bold"
											style="border-width: 1px"
											:loading="activatingId === model.id"
											@click="handleActivate(model)"
										>
											{{ t('modelConfig.setDefault') }}
										</v-btn>

										<v-btn
											variant="outlined"
											size="small"
											class="text-none"
											style="border-color: var(--da-border)"
											:loading="testingId === model.id"
											@click="handleTestConnection(model)"
										>
											{{ t('modelConfig.testConnection') }}
										</v-btn>

										<v-divider vertical inset class="mx-1"></v-divider>

										<div class="d-flex align-center ga-1">
											<v-btn
												icon="mdi-pencil-outline"
												variant="text"
												size="small"
												color="var(--da-text-muted)"
												@click="handleEdit(model)"
											></v-btn>
											<v-btn
												icon="mdi-delete-outline"
												variant="text"
												size="small"
												color="error"
												@click="handleDelete(model)"
											></v-btn>
										</div>
									</div>
								</div>
							</v-card>
						</div>

						<!-- Empty State (Inside TransitionGroup) -->
						<div
							v-if="filteredModels.length === 0"
							:key="activeTab + 'empty'"
							class="empty-state text-center py-16 border-dashed rounded-xl"
						>
							<v-icon
								icon="mdi-robot-vacuum-variant-off"
								size="64"
								class="empty-icon mb-4"
							></v-icon>
							<h3 class="text-h6 font-weight-medium empty-title">
								{{ t('modelConfig.emptyTitle') }}
							</h3>
							<p class="text-body-2 empty-text mb-6">
								{{ t('modelConfig.emptyText') }}
							</p>
							<v-btn
								class="btn-inverse"
								variant="flat"
								@click="openCreateDialog(activeTab)"
								>{{ t('modelConfig.addNow') }}</v-btn
							>
						</div>
					</TransitionGroup>
				</div>
			</v-col>
		</v-row>

		<!-- Config Dialog -->
		<v-dialog v-model="dialog.visible" max-width="500" persistent>
			<v-card rounded="lg" class="pa-2">
				<v-card-title
					class="d-flex align-center justify-space-between px-4 pt-4"
				>
					<span class="text-h6 font-weight-bold">{{ dialogTitle }}</span>
					<v-btn
						icon="mdi-close"
						variant="text"
						size="small"
						@click="closeDialog"
					/>
				</v-card-title>

				<v-card-text class="pt-4">
					<v-form ref="formRef" v-model="formValid" fast-fail>
						<v-row dense>
							<v-col cols="12">
								<span class="custom-label">{{ t('modelConfig.labelProvider') }}</span>
								<v-select
									v-model="form.provider"
									:items="providerOptions"
									variant="outlined"
									density="compact"
									:rules="[rules.required]"
								/>
							</v-col>
							<v-col cols="12">
								<span class="custom-label">{{ t('modelConfig.labelModelName') }}</span>
								<v-text-field
									v-model="form.modelName"
									:placeholder="t('modelConfig.modelNamePlaceholder')"
									variant="outlined"
									density="compact"
									:rules="[rules.required]"
								/>
							</v-col>
							<v-col cols="12">
								<span class="custom-label">{{ t('modelConfig.labelApiKey') }}</span>
								<v-text-field
									v-model="form.apiKey"
									:type="showApiKey ? 'text' : 'password'"
									:append-inner-icon="
										form.apiKey
											? showApiKey
												? 'mdi-eye-off'
												: 'mdi-eye'
											: undefined
									"
									:placeholder="
										dialog.mode === 'edit'
											? t('modelConfig.apiKeySavedPlaceholder', {
													mask: storedApiKeyMask,
												})
											: 'sk-...'
									"
									:hint="
										dialog.mode === 'edit'
											? t('modelConfig.apiKeySecurityHint')
											: undefined
									"
									:persistent-hint="dialog.mode === 'edit'"
									variant="outlined"
									density="compact"
									:rules="
										form.provider === 'custom' || dialog.mode === 'edit'
											? []
											: [rules.required]
									"
									@click:append-inner="
										form.apiKey && (showApiKey = !showApiKey)
									"
								/>
							</v-col>
							<v-col cols="12">
								<span class="custom-label">{{ t('modelConfig.labelBaseUrl') }}</span>
								<v-text-field
									v-model="form.baseUrl"
									placeholder="https://api.example.com/v1"
									variant="outlined"
									density="compact"
									:rules="[rules.required]"
								/>
							</v-col>

							<!-- Extra fields from original but styled like new -->
							<v-col v-if="form.modelType === 'CHAT'" cols="12">
								<span class="custom-label">{{
									t('modelConfig.labelCompletionsPath')
								}}</span>
								<v-text-field
									v-model="form.completionsPath"
									:placeholder="t('modelConfig.completionsPathPlaceholder')"
									variant="outlined"
									density="compact"
								/>
							</v-col>

							<v-col v-if="form.modelType === 'EMBEDDING'" cols="12">
								<span class="custom-label">{{
									t('modelConfig.labelEmbeddingsPath')
								}}</span>
								<v-text-field
									v-model="form.embeddingsPath"
									:placeholder="t('modelConfig.embeddingsPathPlaceholder')"
									variant="outlined"
									density="compact"
								/>
							</v-col>

							<v-col cols="6">
								<span class="custom-label">{{
									t('modelConfig.labelTemperature', {
										value: form.temperature,
									})
								}}</span>
								<v-slider
									v-model="form.temperature"
									min="0"
									max="2"
									step="0.1"
									color="var(--da-text)"
									density="compact"
									hide-details
								/>
							</v-col>
							<v-col cols="6">
								<span class="custom-label">{{ t('modelConfig.labelMaxTokens') }}</span>
								<v-text-field
									v-model.number="form.maxTokens"
									type="number"
									variant="outlined"
									density="compact"
									hide-details
									:rules="[rules.maxTokens]"
								/>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>

				<v-card-actions class="pa-4 pt-0">
					<v-spacer></v-spacer>
					<v-btn variant="text" class="text-none" @click="closeDialog">{{
						t('modelConfig.cancel')
					}}</v-btn>
					<v-btn
						class="btn-inverse text-none px-8"
						elevation="0"
						:loading="saving"
						@click="handleSubmit"
						>{{ t('modelConfig.confirmSave') }}</v-btn
					>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>

<script setup lang="ts">
import type { VForm } from 'vuetify/components';
import modelConfigService, {
	type ModelConfig,
	type ModelType,
} from '@/services/modelConfig';

const { $tip } = useNuxtApp();
const { t } = useI18n();

const providerOptions = [
	{ title: 'DeepSeek', value: 'deepseek' },
	{ title: 'Qwen', value: 'qwen' },
	{ title: 'OpenAI', value: 'openai' },
	{ title: 'Siliconflow', value: 'siliconflow' },
	{ title: 'Custom Provider', value: 'custom' },
];

const providerBaseUrlMap: Record<string, string> = {
	deepseek: 'https://api.deepseek.com',
	qwen: 'https://dashscope.aliyuncs.com/compatible-mode',
	openai: 'https://api.openai.com',
	siliconflow: 'https://api.siliconflow.cn',
	custom: '',
};

const loading = ref(false);
const configs = ref<ModelConfig[]>([]);
const activeTab = ref<ModelType>('CHAT');
const testingId = ref<number | null>(null);
const activatingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const saving = ref(false);
const showApiKey = ref(false);
const storedApiKeyMask = ref('');

const formRef = ref<VForm | null>(null);
const formValid = ref(false);
const form = reactive<ModelConfig>({
	provider: providerOptions[0]?.value || 'deepseek',
	apiKey: '',
	baseUrl: providerBaseUrlMap[providerOptions[0]?.value || 'deepseek'] || '',
	modelName: '',
	modelType: 'CHAT',
	temperature: 0,
	maxTokens: 2000,
	completionsPath: '',
	embeddingsPath: '',
	isActive: false,
});

const dialog = reactive<{
	visible: boolean;
	mode: 'create' | 'edit';
	presetTab: ModelType;
}>({
	visible: false,
	mode: 'create',
	presetTab: 'CHAT',
});

// 用 computed 包一层，切语言后校验消息才会跟着更新
const rules = computed(() => ({
	required: (value: string | number | null | undefined) =>
		value !== null && value !== undefined && value !== ''
			? true
			: t('modelConfig.ruleRequired'),
	maxTokens: (value: number) =>
		value >= 100 && value <= 10000 ? true : t('modelConfig.ruleMaxTokens'),
}));

const dialogTitle = computed(() =>
	dialog.mode === 'edit'
		? t('modelConfig.dialogEditTitle')
		: t('modelConfig.dialogCreateTitle'),
);

const filteredModels = computed(() =>
	configs.value.filter((model) => model.modelType === activeTab.value),
);


const providerLabel = (value: string) => {
	const item = providerOptions.find((option) => option.value === value);
	return item ? item.title : value;
};

const resetForm = (type: ModelType) => {
	storedApiKeyMask.value = '';
	showApiKey.value = false;
	form.provider = providerOptions[0]?.value || 'deepseek';
	form.apiKey = '';
	form.baseUrl = providerBaseUrlMap[form.provider] || '';
	form.modelName = '';
	form.modelType = type;
	form.temperature = 0;
	form.maxTokens = 2000;
	form.completionsPath = '';
	form.embeddingsPath = '';
	form.isActive = false;
};

const fetchConfigs = async () => {
	loading.value = true;
	try {
		const response = await modelConfigService.list();
		console.log(response);
		configs.value = response || [];
	} catch {
		$tip(t('modelConfig.fetchFailed'), {
			icon: 'mdi-alert-circle',
			color: 'error',
		});
		configs.value = [];
	} finally {
		loading.value = false;
	}
};

const openCreateDialog = (type: ModelType) => {
	dialog.mode = 'create';
	dialog.visible = true;
	dialog.presetTab = type;
	resetForm(type);
};

const handleEdit = (model: ModelConfig) => {
	dialog.mode = 'edit';
	dialog.visible = true;
	dialog.presetTab = model.modelType;
	storedApiKeyMask.value = model.apiKey || '';
	showApiKey.value = false;
	Object.assign(form, model, { apiKey: '' });
};

const closeDialog = () => {
	dialog.visible = false;
	showApiKey.value = false;
	storedApiKeyMask.value = '';
};

const submitConfig = async (isUpdate: boolean) => {
	saving.value = true;
	try {
		let result;
		if (isUpdate) {
			result = await modelConfigService.update(form);
		} else {
			result = await modelConfigService.add(form);
		}

		if (result.success) {
			$tip(
				isUpdate
					? t('modelConfig.updateSuccess')
					: t('modelConfig.createSuccess'),
			);
			closeDialog();
			fetchConfigs();
		} else {
			$tip(result.message || t('modelConfig.operationFailedRetry'), {
				icon: 'mdi-alert-circle',
				color: 'error',
			});
		}
	} catch {
		$tip(t('modelConfig.requestFailedNetwork'), {
			icon: 'mdi-alert-circle',
			color: 'error',
		});
	} finally {
		saving.value = false;
	}
};

const handleSubmit = async () => {
	const validateResult = await formRef.value?.validate();
	if (!validateResult?.valid) return;
	await submitConfig(dialog.mode === 'edit');
};

const handleDelete = async (model: ModelConfig) => {
	if (!model.id) {
		$tip(t('modelConfig.modelIdMissing'), {
			icon: 'mdi-alert-circle',
			color: 'error',
		});
		return;
	}
	deletingId.value = model.id ?? null;
	showConfirm({
		title: t('modelConfig.deleteConfirmTitle'),
		message: t('modelConfig.deleteConfirmMessage', { name: model.modelName }),
		icon: 'mdi-help-circle',
		confirmText: t('modelConfig.confirm'),
		onConfirm: async () => {
			const result = await modelConfigService.delete(
				model.id as unknown as number,
			);
			if (result.success) {
				$tip(t('modelConfig.deleteSuccess'));
				fetchConfigs();
			} else {
				$tip(result.message || t('modelConfig.deleteFailed'), {
					icon: 'mdi-alert-circle',
					color: 'error',
				});
			}
			deletingId.value = null;
		},
	});
};

const handleActivate = async (model: ModelConfig) => {
	if (!model.id) return;
	if (
		model.modelType === 'EMBEDDING' &&
		!window.confirm(t('modelConfig.switchEmbeddingWarning'))
	) {
		return;
	}

	activatingId.value = model.id;
	try {
		const result = await modelConfigService.activate(model.id);
		if (result.success) {
			$tip(t('modelConfig.activateSuccess'));
			fetchConfigs();
		} else {
			$tip(result.message || t('modelConfig.activateFailed'), {
				icon: 'mdi-alert-circle',
				color: 'error',
			});
		}
	} catch {
		$tip(t('modelConfig.operationFailedNetwork'), {
			icon: 'mdi-alert-circle',
			color: 'error',
		});
	} finally {
		activatingId.value = null;
	}
};

const handleTestConnection = async (model: ModelConfig) => {
	if (!model.id) {
		$tip(t('modelConfig.modelIdMissing'), {
			icon: 'mdi-alert-circle',
			color: 'error',
		});
		return;
	}
	testingId.value = model.id;
	try {
		const result = await modelConfigService.testConnection(model.id);
		if (result.success) {
			$tip(result.message || t('modelConfig.testSuccess'));
		} else {
			$tip(result.message || t('modelConfig.testFailed'), {
				icon: 'mdi-alert-circle',
				color: 'error',
			});
		}
	} catch {
		$tip(t('modelConfig.testFailedNetwork'), {
			icon: 'mdi-alert-circle',
			color: 'error',
		});
	} finally {
		testingId.value = null;
	}
};

const watchProviderChange = (value: string) => {
	if (value && value !== 'custom') {
		form.baseUrl = providerBaseUrlMap[value] || '';
	}
};

watch(
	() => form.provider,
	(value) => watchProviderChange(value),
);

onMounted(fetchConfigs);
</script>

<style scoped>
.model-config-container {
	background-color: var(--da-surface-soft);
	min-height: 100%;
}

.page-title {
	color: var(--da-text);
}

/* 浅色下近似原来的 black 按钮，深色下自动反相保证可读 */
.btn-inverse {
	background-color: var(--da-text) !important;
	color: var(--da-surface) !important;
}

.model-item-card {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid var(--da-border) !important;
	background-color: var(--da-surface) !important;
}

.model-item-card:hover {
	border-color: var(--da-text-faint) !important;
	transform: translateY(-2px);
	box-shadow: 0 4px 20px var(--da-shadow-faint);
}

.model-item-card.is-active {
	border-color: var(--da-primary-strong) !important;
	background-color: var(--da-primary-soft) !important;
}

.border-dashed {
	border: 2px dashed var(--da-border) !important;
}

.empty-state {
	background-color: var(--da-surface);
}

.empty-icon {
	color: var(--da-border);
}

.empty-title {
	color: var(--da-text-muted);
}

.empty-text {
	color: var(--da-text-faint);
}

.v-tabs {
	border-bottom: 1px solid var(--da-border);
}

.v-tab {
	text-transform: none !important;
	font-weight: 500 !important;
	letter-spacing: 0 !important;
}

/* 列表容器需要相对定位，方便子元素离开时绝对定位 */
.list-container {
	position: relative;
}

/* 所有的过渡和位移都在 0.4s 内完成 */
.list-enter-active,
.list-leave-active,
.list-move {
	transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 入场动画：透明度增加 + 从下方滑入 */
.list-enter-from {
	opacity: 0;
	transform: scale(0.9) translateY(20px);
}

/* 离场动画：透明度减少 + 向上滑出 */
.list-leave-to {
	opacity: 0;
	transform: scale(0.9) translateY(-20px);
}

/* 关键修复：离开时的元素必须绝对定位，否则下方元素无法平滑位移 */
.list-leave-active {
	position: absolute;
	width: 100%; /* 保持宽度一致，防止绝对定位后缩成一团 */
}

/* 分段开关样式优化 */
.segmented-control {
	background-color: var(--da-surface-mute) !important;
	padding: 4px !important;
	height: 48px !important;
	border: none !important;
}

.segmented-control .v-btn {
	border: none !important;
	height: 40px !important;
	font-weight: 600 !important;
	letter-spacing: 0.02em !important;
	color: var(--da-text-muted) !important;
}

.segmented-control .v-btn--selected {
	background-color: var(--da-surface) !important;
	color: var(--da-text) !important;
	box-shadow: 0 2px 8px var(--da-shadow-faint) !important;
}
</style>
