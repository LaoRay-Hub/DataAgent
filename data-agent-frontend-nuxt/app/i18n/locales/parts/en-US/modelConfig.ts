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
	title: 'Model Services',
	subtitle: 'Connect LLM providers for chat generation and vector retrieval.',
	refresh: 'Refresh',
	addChatModel: 'Add Chat Model',
	addEmbeddingModel: 'Add Embedding Model',
	tabChat: 'Chat Models',
	tabEmbedding: 'Embedding Models',
	defaultBadge: 'Default',
	defaultEndpoint: 'Default endpoint',
	setDefault: 'Set as Default',
	testConnection: 'Test Connection',
	emptyTitle: 'No Configurations',
	emptyText: 'You have not added any providers in this category yet',
	addNow: 'Add Now',
	dialogEditTitle: 'Edit Model Configuration',
	dialogCreateTitle: 'New Model Configuration',
	labelProvider: 'Model Provider',
	labelModelName: 'Model Name',
	modelNamePlaceholder: 'e.g. gpt-4o or deepseek-chat',
	labelApiKey: 'API Key',
	apiKeySavedPlaceholder: '{mask} saved. Leave blank to keep unchanged',
	apiKeySecurityHint:
		'For security reasons, the saved key is not shown in full. Enter a new key to replace it.',
	labelBaseUrl: 'Base URL',
	labelCompletionsPath: 'Completions Path',
	completionsPathPlaceholder: 'Default /v1/chat/completions',
	labelEmbeddingsPath: 'Embeddings Path',
	embeddingsPathPlaceholder: 'Default /v1/embeddings',
	labelTemperature: 'Temperature: {value}',
	labelMaxTokens: 'Max Tokens',
	cancel: 'Cancel',
	confirmSave: 'Save',
	ruleRequired: 'This field is required',
	ruleMaxTokens: 'Token count must be between 100 and 10000',
	fetchFailed: 'Failed to load model configurations. Please try again later',
	createSuccess: 'Configuration created',
	updateSuccess: 'Configuration updated',
	operationFailedRetry: 'Operation failed. Please try again',
	requestFailedNetwork: 'Request failed. Please check your network',
	modelIdMissing: 'Model ID does not exist',
	deleteConfirmTitle: 'Confirm Deletion',
	deleteConfirmMessage: 'Are you sure you want to delete {name}?',
	confirm: 'Confirm',
	deleteSuccess: 'Model deleted',
	deleteFailed: 'Deletion failed',
	switchEmbeddingWarning:
		'Switching the embedding model will invalidate existing vector data. Continue?',
	activateSuccess: 'Set as default model',
	activateFailed: 'Failed to set as default',
	operationFailedNetwork: 'Operation failed. Please check your network',
	testSuccess: 'Connection test succeeded',
	testFailed: 'Connection test failed',
	testFailedNetwork: 'Connection test failed. Please check your network',
};
