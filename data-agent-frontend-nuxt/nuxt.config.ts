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

// Vuetify 的 locale adapter 默认只打包 en，不显式给 messages 就会全部回落英文
import zhHans from 'vuetify/lib/locale/zh-Hans.js';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: ['vuetify-nuxt-module', '@pinia/nuxt', '@nuxt/eslint'],
	//基于组件名称自动导入
	components: [
		{
			path: '~/components', // 扫描 components 目录
			extensions: ['.vue'], // 确保只扫描 .vue 文件
			pathPrefix: false, // 禁用文件夹路径前缀
		},
	],
	imports: {
		dirs: [
			// 递归扫描所有的 index.ts，这样文件夹名就是函数名
			'composables/**/index.ts',
			'app/services/**/index.ts', // 匹配你规范中的 app/services/
			'composables/*.ts',
			'app/services/*.ts',
		],
	},
	vuetify: {
		vuetifyOptions: {
			defaults: {
				VBtn: { variant: 'outlined' },
			},
			locale: {
				locale: 'zh-Hans',
				fallback: 'en',
				messages: { 'zh-Hans': zhHans },
			},
			theme: {
				// 浅色沿用 Vuetify 内置 light，避免改动既有观感；实际皮肤由宿主下发后切换
				defaultTheme: 'light',
				themes: {
					dark: {
						dark: true,
						colors: {
							background: '#0e1420',
							surface: '#151c2c',
							'surface-light': '#1a2232',
							'surface-variant': '#212a3d',
							'on-surface-variant': '#aab5c8',
							primary: '#4f8cff',
							secondary: '#8d99ad',
							info: '#6aa5ff',
							// 数据源状态 chip 是 flat 填充配白字，#3fbf63 只有 2.37:1；
							// 这里与浅色 #28a745 的 3.13:1 持平，tonal/文字用法仍有 5.2:1 以上
							success: '#3aa757',
							warning: '#f0a72f',
							error: '#f2685f',
							// VBtn 默认 outlined，这几个色号在页面里是当作前景文字用的，
							// Vuetify 内置值落在深色底上只有 2.5~4.6:1，过不了 AA，这里改亮；
							// 层级与浅色相反：darken-3 最亮，因为它标记的是主操作
							'blue-darken-1': '#6aa5ff',
							'blue-darken-2': '#7fb0ff',
							'blue-darken-3': '#9cc4ff',
						},
					},
				},
			},
		},
	},
	vite: {
		build: {
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes('/node_modules/zrender/')) return 'vendor-zrender';
						if (id.includes('/node_modules/echarts/')) return 'vendor-echarts';
						if (id.includes('/node_modules/highlight.js/'))
							return 'vendor-highlight';
					},
				},
			},
		},
	},
	//全局关闭ssr
	ssr: false,
	runtimeConfig: {
		public: {
			// 允许哪个父窗口通过 postMessage 下发登录态与偏好。
			// 跨域嵌入（data-pilot 在 5173、本应用在 3000）必须显式给出宿主 origin，否则消息会被全部丢弃；
			// 生产环境用 NUXT_PUBLIC_DP_EMBED_PARENT_ORIGIN 覆盖，置空则退化为只接受同源（走 data-pilot 反代）的部署。
			dpEmbedParentOrigin: 'http://localhost:5173',
		},
	},
	// /路由重定向到/create-agent
	routeRules: {
		'/': { redirect: '/agent/new' },
		// 代理所有 /api/** 的请求到 Java 后端；嵌入 data-pilot 时指向其反代以复用登录态与租户隔离
		'/api/**': { proxy: `${process.env.DATAAGENT_API_UPSTREAM || 'http://localhost:8065/api'}/**` },
		'/nl2sql/**': { proxy: `${process.env.DATAAGENT_NL2SQL_UPSTREAM || 'http://localhost:8065/nl2sql'}/**` },
	},
	//全局动画配置
	app: {
		// 经宿主 nginx 以路径前缀反代时必须设置（如 /dataagent-ui/），否则 vue-router 的 base
		// 与浏览器地址栏不一致：首屏路由匹配不上，内部跳转还会跳到宿主根路径去。构建期烘焙。
		baseURL: process.env.DATAAGENT_BASE_URL || '/',
		pageTransition: { name: 'page', mode: 'out-in' },
	},
	css: ['@/assets/css/main.css'],
});
