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

export default {
	brand: {
		title: '智能问数',
	},
	menu: {
		chat: '数据问答',
		dashboard: '数据看板',
		promptConfig: '提示词配置',
		knowledge: '知识库管理',
		businessKnowledge: '业务知识配置',
		agentKnowledge: '智能体知识库',
		semanticModels: '语义模型配置',
		settings: '通用设置',
		agentManage: '智能体管理',
		dataSources: '数据连接',
		modelConfig: '模型配置',
		newAgent: '新建智能体',
	},
	page: {
		agentDetail: '智能体详情',
		dashboardTitle: '数据看板',
		dashboardSubtitle: '这里将呈现业务可视化看板。',
	},
	agent: {
		current: '当前选择智能体',
		selectPlaceholder: '请选择智能体',
	},
	ui: {
		copy: '复制',
		copied: '已复制!',
		copySuccess: '复制成功',
		copyFailed: '复制失败',
		chartGenerating: '图表生成中...',
		confirm: '确认',
		cancel: '取消',
	},
	report: {
		docTitle: '分析报告',
		markedLoadFailed: 'Marked库加载失败，请检查网络',
		chartRenderError: '图表渲染错误',
	},
	errorPage: {
		status400: '请求参数错误',
		status401: '身份认证失败',
		status403: '没有访问权限',
		status404: '页面不存在',
		status500: '服务器内部错误',
		status502: '网关错误',
		status503: '服务暂时不可用',
		unknown: '发生了未知错误',
		backHome: '返回首页',
		reload: '刷新页面',
	},
	error: {
		saveMessageFailed: '保存消息失败',
		operationFailed: '操作失败',
		pinParamRequired: 'isPinned参数不能为空',
		titleRequired: '标题不能为空',
		renameFailed: '重命名失败',
		deleteFailed: '删除失败',
		downloadFailed: '下载失败: {detail}',
		backendError: '后端错误',
		initSchemaFailed: '初始化Schema失败: {detail}',
		datasourceListFailed: '获取数据源列表失败: {detail}',
		addDatasourceFailed: '添加数据源失败: {detail}',
		removeDatasourceFailed: '移除数据源失败: {detail}',
		toggleDatasourceFailed: '切换数据源状态失败: {detail}',
		updateDatasourceTablesFailed: '更新数据源表列表失败: {detail}',
		generateApiKeyFailed: '生成 API Key 失败',
		resetApiKeyFailed: '重置 API Key 失败',
		deleteApiKeyFailed: '删除 API Key 失败',
		updateApiKeyStatusFailed: '更新 API Key 状态失败',
	},
};
