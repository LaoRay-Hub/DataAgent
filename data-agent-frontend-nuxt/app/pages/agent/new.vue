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
			:title="t('agentEditor.pageTitle')"
			:subtitle="t('agentEditor.pageSubtitle')"
		>
			<template #actions>
				<v-btn
					class="text-none back-btn"
					variant="outlined"
					prepend-icon="mdi-arrow-left"
					@click="goBack"
				>
					{{ t('agentEditor.backToList') }}
				</v-btn>
				<v-btn
					color="var(--da-primary-heading)"
					prepend-icon="mdi-plus"
					class="text-none px-6"
					elevation="0"
					:loading="loading"
					@click="createAgent"
				>
					{{ loading ? t('agentEditor.creating') : t('agentEditor.createAgent') }}
				</v-btn>
			</template>
		</KnowledgePageHeader>

		<v-card variant="flat" border class="rounded-lg pa-6">
			<v-form ref="formRef">
				<div class="mb-6">
					<p class="text-body-2 font-weight-medium field-label mb-2">
						{{ t('agentEditor.avatarSection') }}
					</p>
					<div class="d-flex align-center ga-4 flex-wrap">
						<v-avatar size="88" rounded="lg" class="avatar-preview">
							<v-img :src="agentForm.avatar" cover @error="handleImageError" />
						</v-avatar>
						<div class="d-flex ga-2">
							<v-btn
								variant="outlined"
								prepend-icon="mdi-refresh"
								class="text-none"
								@click="regenerateAvatar"
							>
								{{ t('agentEditor.regenerateAvatar') }}
							</v-btn>
							<v-btn
								variant="outlined"
								prepend-icon="mdi-upload"
								class="text-none"
								:loading="uploading"
								@click="triggerFileUpload"
							>
								{{ uploading ? t('agentEditor.uploading') : t('agentEditor.uploadImage') }}
							</v-btn>
							<input
								ref="fileInput"
								type="file"
								accept="image/*"
								style="display: none"
								@change="handleFileUpload"
							/>
						</div>
					</div>
				</div>

				<v-row>
					<v-col cols="12" md="6">
						<p class="text-body-2 font-weight-medium field-label mb-2">
							{{ t('agentEditor.nameLabel') }} <span class="text-error">*</span>
						</p>
						<v-text-field
							v-model="agentForm.name"
							:placeholder="t('agentEditor.namePlaceholder')"
							variant="outlined"
							density="compact"
							:rules="[(v) => !!v?.trim() || t('agentEditor.nameRequired')]"
							hide-details="auto"
						/>
					</v-col>
					<v-col cols="12" md="6">
						<p class="text-body-2 font-weight-medium field-label mb-2">
							{{ t('agentEditor.categoryLabel') }} <span class="text-error">*</span>
						</p>
						<v-text-field
							v-model="agentForm.category"
							:placeholder="t('agentEditor.categoryPlaceholder')"
							variant="outlined"
							density="compact"
							:rules="[(v) => !!v?.trim() || t('agentEditor.categoryRequired')]"
							hide-details="auto"
						/>
					</v-col>
					<v-col cols="12">
						<p class="text-body-2 font-weight-medium field-label mb-2">
							{{ t('agentEditor.descriptionLabel') }}
						</p>
						<v-textarea
							v-model="agentForm.description"
							:placeholder="t('agentEditor.descriptionPlaceholder')"
							variant="outlined"
							density="compact"
							rows="3"
							hide-details="auto"
						/>
					</v-col>
					<v-col cols="12">
						<p class="text-body-2 font-weight-medium field-label mb-2">
							{{ t('agentEditor.promptLabel') }}
						</p>
						<v-textarea
							v-model="agentForm.prompt"
							:placeholder="t('agentEditor.promptPlaceholder')"
							variant="outlined"
							density="compact"
							rows="4"
							hide-details="auto"
						/>
					</v-col>
					<v-col cols="12" md="6">
						<p class="text-body-2 font-weight-medium field-label mb-2">
							{{ t('agentEditor.tagsLabel') }} <span class="text-error">*</span>
						</p>
						<v-text-field
							v-model="agentForm.tags"
							:placeholder="t('agentEditor.tagsPlaceholder')"
							variant="outlined"
							density="compact"
							:rules="[(v) => !!v?.trim() || t('agentEditor.tagsRequired')]"
							hide-details="auto"
						/>
					</v-col>
					<v-col cols="12" md="6">
						<p class="text-body-2 font-weight-medium field-label mb-2">
							{{ t('agentEditor.statusLabel') }}
						</p>
						<v-select
							v-model="agentForm.status"
							:items="statusOptions"
							item-title="label"
							item-value="value"
							variant="outlined"
							density="compact"
							hide-details="auto"
						/>
					</v-col>
				</v-row>
			</v-form>
		</v-card>
	</section>
</template>

<script setup lang="ts">
import agentService from '~/services/agent/index';
import { fileUploadApi } from '~/services/fileUpload/index';

const router = useRouter();
const { $tip } = useNuxtApp();
const { t } = useI18n();

const loading = ref(false);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const formRef = ref();

// value 是提交给后端的枚举，label 需随语言切换，因此用 computed
const statusOptions = computed(() => [
	{ label: t('agentEditor.statusDraft'), value: 'draft' },
	{ label: t('agentEditor.statusPublished'), value: 'published' },
	{ label: t('agentEditor.statusOffline'), value: 'offline' },
]);

const agentForm = reactive({
	name: '',
	description: '',
	avatar: '',
	category: '',
	tags: '',
	prompt: '',
	status: 'draft',
	humanReviewEnabled: false,
});

// 兜底头像会被写入数据库成为业务数据，其中的文案与配色保持原样、不做多语言处理
function generateFallbackAvatar(): string {
	const colors = ['3B82F6', '8B5CF6', '10B981', 'F59E0B', 'EF4444', '6366F1'];
	const letters = ['AI', '数据', '智能', 'DA', 'BI', 'ML'];
	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const randomLetter = letters[Math.floor(Math.random() * letters.length)];
	const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#${randomColor}"/><text x="100" y="120" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${randomLetter}</text></svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function regenerateAvatar() {
	agentForm.avatar = generateFallbackAvatar();
}

function handleImageError() {
	agentForm.avatar = generateFallbackAvatar();
}

function triggerFileUpload() {
	fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;
	if (!file.type.startsWith('image/')) {
		$tip(t('agentEditor.tipSelectImage'), { color: 'error', icon: 'mdi-alert-circle' });
		return;
	}
	if (file.size > 5 * 1024 * 1024) {
		$tip(t('agentEditor.tipImageTooLarge'), { color: 'error', icon: 'mdi-alert-circle' });
		return;
	}

	try {
		uploading.value = true;
		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result) agentForm.avatar = String(e.target.result);
		};
		reader.readAsDataURL(file);

		const response = await fileUploadApi.uploadAvatar(file);
		if (response.success && response.url) {
			agentForm.avatar = response.url;
			$tip(t('agentEditor.tipAvatarUploaded'));
		} else {
			throw new Error(response.message || t('agentEditor.uploadFailed'));
		}
	} catch (error) {
		$tip(
			t('agentEditor.avatarUploadFailed', {
				message: error instanceof Error ? error.message : t('agentEditor.unknownError'),
			}),
			{
				color: 'error',
				icon: 'mdi-alert-circle',
			},
		);
		agentForm.avatar = generateFallbackAvatar();
	} finally {
		uploading.value = false;
		if (fileInput.value) fileInput.value.value = '';
	}
}

function goBack() {
	router.push('/system/agents');
}

async function createAgent() {
	const validateResult = await formRef.value?.validate();
	const valid = validateResult?.valid;
	if (!valid) return;

	loading.value = true;
	try {
		const payload = {
			name: agentForm.name.trim(),
			description: agentForm.description.trim(),
			avatar: agentForm.avatar.trim(),
			category: agentForm.category.trim(),
			tags: agentForm.tags.trim(),
			prompt: agentForm.prompt.trim(),
			status: agentForm.status,
			humanReviewEnabled: agentForm.humanReviewEnabled ? 1 : 0,
		};
		const result = await agentService.create(payload);
		$tip(
			payload.status === 'published'
				? t('agentEditor.createSuccessPublished')
				: t('agentEditor.createSuccessDraft'),
		);
		await router.push({ path: '/chat', query: { agentId: result.id } });
	} catch {
		$tip(t('agentEditor.createFailed'), { color: 'error', icon: 'mdi-alert-circle' });
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	agentForm.avatar = generateFallbackAvatar();
});
</script>

<style scoped>
.page-shell {
	padding: 32px;
}

/* 原 bg-white + border-color: #e2e8f0，改用语义变量以适配深色；加 .v-btn 前缀压过 Vuetify 变体样式 */
.v-btn.back-btn {
	background-color: var(--da-surface);
	border-color: var(--da-border);
}

/* 原 text-grey-darken-2（#616161），--da-text-muted 浅色值 #64748b 视觉等价 */
.field-label {
	color: var(--da-text-muted);
}

.avatar-preview {
	/* 原 #e5e7eb，与 --da-border 浅色值 #e2e8f0 视觉等价 */
	border: 2px solid var(--da-border);
}
</style>
