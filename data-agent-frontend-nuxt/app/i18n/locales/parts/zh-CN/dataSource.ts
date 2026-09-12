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
	// 页面头部
	title: '数据源配置',
	subtitle: '管理全局数据库连接资源，配置连接信息与逻辑外键。',
	refresh: '刷新',
	addDatasource: '添加数据源',
	initializing: '初始化中...',
	initCurrentAgent: '初始化当前智能体数据源',

	// 数据表表头
	name: '名称',
	type: '类型',
	status: '状态',
	connectionStatus: '连接状态',
	actions: '操作',

	// 数据表分页脚
	itemsPerPage: '每页显示：',
	pageText: '{0}-{1} 共 {2} 条',

	// 状态与连接状态标签
	statusActive: '启用',
	statusInactive: '禁用',
	connSuccess: '连接成功',
	connFail: '连接失败',
	connUntested: '未测试',

	// 行内操作
	inUse: '当前使用中',
	setAsCurrent: '设为当前',
	actionDisable: '禁用',
	actionEnable: '启用',
	testConnection: '测试连接',
	logicalForeignKey: '逻辑外键',

	// 提示与反馈
	fetchListFailed: '获取数据源列表失败',
	createSuccess: '创建成功',
	updateSuccess: '更新成功',
	operationFailedCheck: '操作失败，请检查网络或参数',
	operationFailed: '操作失败',
	alreadyInUse: '当前已是该智能体正在使用的数据源',
	setAsCurrentSuccess: '已设为当前智能体数据源',
	bindFailed: '绑定失败',
	enabledTip: '已启用',
	disabledTip: '已禁用',
	testConnSuccess: '连接测试成功',
	testConnFail: '连接测试失败',
	testConnRequestFail: '连接测试请求失败',
	updateFailed: '更新失败',
	savedTables: '已保存 {count} 个表',

	// 展开行前置校验
	expandNeedBoth: '请先启用数据源并测试连接成功后再展开',
	expandNeedActive: '请先启用数据源后再展开数据表管理',
	expandNeedTest: '请先测试连接成功后再展开数据表管理',

	// 初始化
	missingAgentId: '缺少智能体ID，无法初始化数据源',
	noBoundDatasource: '当前智能体没有绑定可用的数据源！请先绑定并启用数据源',
	noSelectedTables: '当前绑定的数据源没有选择相应的数据表！请先选择数据表并更新',
	initSuccess: '初始化数据源成功',
	initFailed: '初始化数据源失败',

	// 删除确认
	deleteConfirmTitle: '删除确认',
	deleteConfirmMessage: '确定要删除数据源「{name}」吗？此操作不可恢复。',
	delete: '删除',
	deleteSuccess: '删除成功',
	deleteFailed: '删除失败',

	// 表单弹窗
	editDatasource: '编辑数据源',
	fieldName: '数据源名称',
	fieldType: '数据库类型',
	fieldHost: '主机地址',
	fieldPort: '端口号',
	fieldDatabaseName: '数据库名',
	fieldSchemaName: 'Schema 名',
	fieldConnectionUrl: 'JDBC 连接地址 (可选)',
	fieldUsername: '用户名',
	fieldPassword: '密码',
	fieldDescription: '描述信息',
	placeholderName: '请输入名称',
	placeholderHost: 'localhost 或 IP 地址',
	placeholderDatabaseName: 'Database Name',
	placeholderSchemaName: '如 public',
	placeholderConnectionUrl: '若不填则自动生成',
	placeholderUsername: 'Username',
	placeholderPassword: 'Password',
	placeholderDescription: '可选描述',
	cancel: '取消',
	save: '保存',
	create: '创建',
	ruleRequired: '此项必填',

	// 展开行数据表管理
	tableManagement: '数据表管理',
	selectedCount: '已选择 {count} 个表',
	selectAll: '全选',
	clearAll: '清空',
	updateTables: '更新数据表',
	searchTablesLabel: '搜索数据表',
	searchTablesPlaceholder: '输入表名',
	fetchFailed: '数据获取失败',
	fetchFailedHint: '无法拉取数据表列表，请检查连接后重试',
	retry: '重试',
	noMatchedTables: '没有匹配“{keyword}”的数据表',
	noTableData: '暂无表数据，请确保数据源连接正常后刷新',

	// 逻辑外键弹窗
	fkConfig: '逻辑外键配置',
	activeRelations: '已生效的关系列表',
	sourceTableCol: '主表 (Source)',
	targetTableCol: '关联表 (Target)',
	relation: '关系',
	noRelations: '暂无逻辑外键配置',
	labelSourceTable: '主表',
	labelSourceColumn: '主表字段',
	labelTargetTable: '关联表',
	labelTargetColumn: '关联字段',
	placeholderSelectSourceTable: '请选择主表',
	placeholderSelectSourceFirst: '先选择主表',
	placeholderSelectTargetTable: '请选择关联表',
	placeholderSelectTargetFirst: '先选择关联表',
	addRelation: '添加关系',
	loadFkFailed: '加载外键配置失败',
	addRelationSuccess: '添加关系成功',
	addFailed: '添加失败',
	deleteFkConfirmMessage: '确定要删除该逻辑外键吗？',
};
