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
	title: '模型服务',
	subtitle: '连接 LLM 供应商，支持对话生成与向量检索。',
	refresh: '刷新',
	addChatModel: '添加对话模型',
	addEmbeddingModel: '添加嵌入模型',
	tabChat: '对话模型',
	tabEmbedding: '嵌入模型',
	defaultBadge: '默认',
	defaultEndpoint: '默认终端地址',
	setDefault: '设为默认',
	testConnection: '测试连接',
	emptyTitle: '暂无配置',
	emptyText: '您还没有在该分类下添加任何供应商',
	addNow: '立即添加',
	dialogEditTitle: '编辑模型配置',
	dialogCreateTitle: '新增模型配置',
	labelProvider: '模型供应商',
	labelModelName: '模型名称',
	modelNamePlaceholder: '例如: gpt-4o 或 deepseek-chat',
	labelApiKey: 'API 密钥 (API Key)',
	apiKeySavedPlaceholder: '{mask} 已保存，留空表示不修改',
	apiKeySecurityHint: '出于安全考虑，已保存的完整密钥不会回显；输入新密钥可进行替换。',
	labelBaseUrl: '接口地址 (Base URL)',
	labelCompletionsPath: 'Completions 路径',
	completionsPathPlaceholder: '默认 /v1/chat/completions',
	labelEmbeddingsPath: 'Embeddings 路径',
	embeddingsPathPlaceholder: '默认 /v1/embeddings',
	labelTemperature: '温度系数: {value}',
	labelMaxTokens: '最大 Token 数',
	cancel: '取消',
	confirmSave: '确认保存',
	ruleRequired: '该字段为必填项',
	ruleMaxTokens: 'Token 范围需在 100 - 10000 之间',
	fetchFailed: '获取模型配置失败，请稍后重试',
	createSuccess: '配置创建成功',
	updateSuccess: '配置更新成功',
	operationFailedRetry: '操作失败，请重试',
	requestFailedNetwork: '请求失败，请检查网络',
	modelIdMissing: '模型ID不存在',
	deleteConfirmTitle: '确认删除',
	deleteConfirmMessage: '你确认要删除 {name} 吗？',
	confirm: '确认',
	deleteSuccess: '模型已删除',
	deleteFailed: '删除失败',
	switchEmbeddingWarning: '切换嵌入模型会导致现有向量数据失效，确定继续吗？',
	activateSuccess: '已设置为默认模型',
	activateFailed: '设置失败',
	operationFailedNetwork: '操作失败，请检查网络',
	testSuccess: '连接测试成功',
	testFailed: '连接测试失败',
	testFailedNetwork: '连接测试失败，请检查网络',
};
