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

const EMBED_INIT_TYPE = 'dp-embed-init';
const EMBED_PREFS_TYPE = 'dp-embed-prefs';
const TOKEN_COOKIE = 'dp_token';
const WORKSPACE_COOKIE = 'dp_workspace';

interface EmbedMessage {
	type?: string;
	token?: string;
	workspace?: string;
	locale?: string;
	theme?: string;
}

// 与写入时保持同样的原始格式，不做编解码，避免比较时出现假不相等
function readCookie(name: string): string {
	const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
	return match ? match[1] : '';
}

// 宿主没配 dpEmbedParentOrigin 或压根不发消息时的兜底，避免把页面永久卡在挂载前
const IDENTITY_TIMEOUT_MS = 3000;

// 被 data-pilot 以 iframe 嵌入时，父窗口通过 postMessage 下发登录身份。
// 聊天与图谱流式接口用 EventSource，浏览器不允许它带自定义头，所以身份写入同源 cookie，
// 随 Nitro 代理透传给 data-pilot 反代，由其 DataAgentEmbedAuthFilter 还原成请求头校验。
// 语言与皮肤同样由宿主下发（dp-embed-init 携带、切换时用 dp-embed-prefs 增量推送）。
export default defineNuxtPlugin(async () => {
	if (import.meta.server) return;
	const embed = useEmbedStore();
	const allowedOrigin = useRuntimeConfig().public.dpEmbedParentOrigin || window.location.origin;
	// 嵌入态下首屏请求必须等身份到位：布局挂载后会立刻拉智能体列表，
	// 抢在 postMessage 之前发出去就会带着上一个用户残留的 cookie 把别人的数据渲染出来。
	// Nuxt 会 await 插件返回的 promise 再挂载应用，因此这道门对所有页面生效。
	const framed = window.self !== window.top;
	let releaseIdentity: (() => void) | undefined;
	const identityArrived = framed
		? new Promise<void>((resolve) => {
				releaseIdentity = resolve;
			})
		: Promise.resolve();

	window.addEventListener('message', (event) => {
		const data = event.data as EmbedMessage | null;
		const isEmbedMessage = data?.type === EMBED_INIT_TYPE || data?.type === EMBED_PREFS_TYPE;
		if (event.origin !== allowedOrigin) {
			// 宿主 origin 没配对时消息会被丢掉，只对自己认识的类型告警，免得扩展/devtools 的 postMessage 刷屏
			if (isEmbedMessage) {
				console.warn(
					`[dp-embed] 已丢弃来自 ${event.origin} 的消息，dpEmbedParentOrigin 当前为 ${allowedOrigin}`,
				);
			}
			return;
		}
		if (!data || !isEmbedMessage) return;
		if (data.type === EMBED_INIT_TYPE && data.token) {
			const previousToken = readCookie(TOKEN_COOKIE);
			const previousWorkspace = readCookie(WORKSPACE_COOKIE);
			document.cookie = `${TOKEN_COOKIE}=${data.token}; path=/; SameSite=Strict`;
			if (data.workspace) {
				document.cookie = `${WORKSPACE_COOKIE}=${data.workspace}; path=/; SameSite=Strict`;
			}
			// 宿主换了用户或工作空间：内存里的智能体列表、会话与消息都属于旧身份，
			// 只有整页重载才能让新用户看到全新页面。cookie 已先写好，重载后身份一致不会再触发；
			// 写入被浏览器拦截时读到空值，同样不触发，避免重载死循环。
			const identityChanged =
				(previousToken !== '' && previousToken !== data.token) ||
				(previousWorkspace !== '' && !!data.workspace && previousWorkspace !== data.workspace);
			if (identityChanged) {
				window.location.reload();
				return;
			}
			releaseIdentity?.();
		}
		embed.applyPrefs(data);
	});

	if (framed) {
		await Promise.race([
			identityArrived,
			new Promise<void>((resolve) => setTimeout(resolve, IDENTITY_TIMEOUT_MS)),
		]);
	}
});
