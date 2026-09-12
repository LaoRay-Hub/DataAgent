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
	<div class="welcome-wrap">
		<!-- Agent Avatar -->
		<div class="agent-avatar-wrap">
			<v-avatar
				:image="store.currentAgentAvatar || undefined"
				:color="store.currentAgentAvatar ? undefined : 'grey-lighten-3'"
				size="80"
				rounded="xl"
				class="agent-avatar"
			>
				<span v-if="!store.currentAgentAvatar" class="agent-avatar-emoji">🤖</span>
			</v-avatar>
		</div>

		<!-- Agent Name -->
		<h2 class="welcome-title">
			{{ t('chat.greeting') }}
			<span class="agent-name">{{
				store.currentAgentName || t('chat.defaultAgentName')
			}}</span>
		</h2>

		<!-- Agent Description -->
		<p class="welcome-desc">
			{{ store.currentAgentDescription || t('chat.defaultAgentDescription') }}
		</p>
	</div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat';
const store = useChatStore();
const { t } = useI18n();
</script>

<style scoped>
.welcome-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	padding: 40px 24px;
	text-align: center;
}

.agent-avatar-wrap {
	margin-bottom: 24px;
}

.agent-avatar {
	box-shadow: 0 4px 16px var(--da-shadow-faint);
}

.agent-avatar-emoji {
	font-size: 36px;
	line-height: 1;
}

.welcome-title {
	font-size: 26px;
	font-weight: 700;
	color: var(--da-text);
	margin-bottom: 12px;
	letter-spacing: -0.3px;
}

.agent-name {
	color: var(--da-text-strong);
}

.welcome-desc {
	font-size: 14.5px;
	color: var(--da-text-muted);
	max-width: 480px;
	line-height: 1.7;
}
</style>
