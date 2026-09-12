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
		max-width="400"
		@update:model-value="$emit('update:modelValue', $event)"
	>
		<v-card :prepend-icon="prependIcon" :title="title">
			<v-card-text style="white-space: pre-line">{{ message }}</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn
					:text="t('ui.cancel')"
					variant="plain"
					@click="$emit('update:modelValue', false)"
				></v-btn>
				<!-- 子组件传入事件 -->
				<v-btn
					color="primary"
					:text="confirmLabel"
					variant="tonal"
					@click="
						$emit('confirm');
						$emit('update:modelValue', false);
					"
				></v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup lang="ts">
/**
 * @description 通用确认对话框组件，用于二次确认操作
 */

interface Props {
	/** 是否显示对话框 */
	modelValue: boolean;
	/** 对话框标题 */
	title: string;
	/** 提示消息内容 */
	message: string;
	/** 标题前的图标 */
	prependIcon?: string;
	/** 确认按钮的文字，缺省时按当前语言取「确认」 */
	confirmText?: string;
}

const props = withDefaults(defineProps<Props>(), {
	prependIcon: 'mdi-help-circle',
	confirmText: undefined,
});

const { t } = useI18n();

const confirmLabel = computed(() => props.confirmText || t('ui.confirm'));

defineEmits<{
	/** 更新显示状态 */
	'update:modelValue': [value: boolean];
	/** 点击确认按钮事件 */
	confirm: [];
}>();
</script>
