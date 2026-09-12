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
		// 与宿主 data-pilot 的 menu.smartQuery 保持一致
		title: 'Smart Query',
	},
	menu: {
		chat: 'Data Chat',
		dashboard: 'Dashboard',
		promptConfig: 'Prompt Config',
		knowledge: 'Knowledge Base',
		businessKnowledge: 'Business Knowledge',
		agentKnowledge: 'Agent Knowledge',
		semanticModels: 'Semantic Models',
		settings: 'Settings',
		agentManage: 'Agents',
		dataSources: 'Data Sources',
		modelConfig: 'Model Config',
		newAgent: 'New Agent',
	},
	page: {
		agentDetail: 'Agent Details',
		dashboardTitle: 'Dashboard',
		dashboardSubtitle: 'Business dashboards will appear here.',
	},
	agent: {
		current: 'Current Agent',
		selectPlaceholder: 'Select an agent',
	},
	ui: {
		copy: 'Copy',
		copied: 'Copied!',
		copySuccess: 'Copied to clipboard',
		copyFailed: 'Copy failed',
		chartGenerating: 'Generating chart...',
		confirm: 'Confirm',
		cancel: 'Cancel',
	},
	report: {
		docTitle: 'Analysis Report',
		markedLoadFailed: 'Failed to load the Marked library. Please check your network connection.',
		chartRenderError: 'Chart render error',
	},
	errorPage: {
		status400: 'Bad request parameters',
		status401: 'Authentication failed',
		status403: 'You do not have access',
		status404: 'Page not found',
		status500: 'Internal server error',
		status502: 'Gateway error',
		status503: 'Service temporarily unavailable',
		unknown: 'An unknown error occurred',
		backHome: 'Back to Home',
		reload: 'Reload Page',
	},
	error: {
		saveMessageFailed: 'Failed to save the message',
		operationFailed: 'Operation failed',
		pinParamRequired: 'The isPinned parameter is required',
		titleRequired: 'Title cannot be empty',
		renameFailed: 'Rename failed',
		deleteFailed: 'Delete failed',
		downloadFailed: 'Download failed: {detail}',
		backendError: 'Backend error',
		initSchemaFailed: 'Failed to initialize the schema: {detail}',
		datasourceListFailed: 'Failed to load data sources: {detail}',
		addDatasourceFailed: 'Failed to add the data source: {detail}',
		removeDatasourceFailed: 'Failed to remove the data source: {detail}',
		toggleDatasourceFailed: 'Failed to toggle the data source status: {detail}',
		updateDatasourceTablesFailed: 'Failed to update the data source tables: {detail}',
		generateApiKeyFailed: 'Failed to generate the API key',
		resetApiKeyFailed: 'Failed to reset the API key',
		deleteApiKeyFailed: 'Failed to delete the API key',
		updateApiKeyStatusFailed: 'Failed to update the API key status',
	},
};
