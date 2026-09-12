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
	title: 'Data Source Configuration',
	subtitle:
		'Manage global database connections, configure connection details and logical foreign keys.',
	refresh: 'Refresh',
	addDatasource: 'Add Data Source',
	initializing: 'Initializing...',
	initCurrentAgent: 'Initialize Current Agent Data Source',

	name: 'Name',
	type: 'Type',
	status: 'Status',
	connectionStatus: 'Connection Status',
	actions: 'Actions',

	itemsPerPage: 'Items per page:',
	pageText: '{0}-{1} of {2}',

	statusActive: 'Enabled',
	statusInactive: 'Disabled',
	connSuccess: 'Connected',
	connFail: 'Connection Failed',
	connUntested: 'Not Tested',

	inUse: 'In Use',
	setAsCurrent: 'Set as Current',
	actionDisable: 'Disable',
	actionEnable: 'Enable',
	testConnection: 'Test Connection',
	logicalForeignKey: 'Logical Foreign Keys',

	fetchListFailed: 'Failed to load data sources',
	createSuccess: 'Created successfully',
	updateSuccess: 'Updated successfully',
	operationFailedCheck:
		'Operation failed. Please check your network or parameters',
	operationFailed: 'Operation failed',
	alreadyInUse: 'This is already the data source in use by the agent',
	setAsCurrentSuccess: 'Set as the current agent data source',
	bindFailed: 'Binding failed',
	enabledTip: 'Enabled',
	disabledTip: 'Disabled',
	testConnSuccess: 'Connection test succeeded',
	testConnFail: 'Connection test failed',
	testConnRequestFail: 'Connection test request failed',
	updateFailed: 'Update failed',
	savedTables: 'Saved {count} table(s)',

	expandNeedBoth:
		'Enable the data source and test the connection successfully before expanding',
	expandNeedActive: 'Enable the data source before expanding table management',
	expandNeedTest:
		'Test the connection successfully before expanding table management',

	missingAgentId: 'Missing agent ID; cannot initialize the data source',
	noBoundDatasource:
		'The current agent has no available data source bound. Please bind and enable one first',
	noSelectedTables:
		'The bound data source has no tables selected. Please select tables and update first',
	initSuccess: 'Data source initialized successfully',
	initFailed: 'Failed to initialize the data source',

	deleteConfirmTitle: 'Confirm Deletion',
	deleteConfirmMessage:
		'Are you sure you want to delete the data source "{name}"? This action cannot be undone.',
	delete: 'Delete',
	deleteSuccess: 'Deleted successfully',
	deleteFailed: 'Deletion failed',

	editDatasource: 'Edit Data Source',
	fieldName: 'Data Source Name',
	fieldType: 'Database Type',
	fieldHost: 'Host Address',
	fieldPort: 'Port',
	fieldDatabaseName: 'Database Name',
	fieldSchemaName: 'Schema Name',
	fieldConnectionUrl: 'JDBC Connection URL (Optional)',
	fieldUsername: 'Username',
	fieldPassword: 'Password',
	fieldDescription: 'Description',
	placeholderName: 'Enter a name',
	placeholderHost: 'localhost or IP address',
	placeholderDatabaseName: 'Database Name',
	placeholderSchemaName: 'e.g. public',
	placeholderConnectionUrl: 'Auto-generated if left blank',
	placeholderUsername: 'Username',
	placeholderPassword: 'Password',
	placeholderDescription: 'Optional description',
	cancel: 'Cancel',
	save: 'Save',
	create: 'Create',
	ruleRequired: 'This field is required',

	tableManagement: 'Table Management',
	selectedCount: '{count} table(s) selected',
	selectAll: 'Select All',
	clearAll: 'Clear',
	updateTables: 'Update Tables',
	searchTablesLabel: 'Search tables',
	searchTablesPlaceholder: 'Enter a table name',
	fetchFailed: 'Failed to load data',
	fetchFailedHint:
		'Unable to fetch the table list. Please check the connection and retry',
	retry: 'Retry',
	noMatchedTables: 'No tables matching "{keyword}"',
	noTableData:
		'No tables available. Ensure the data source connection is working, then refresh',

	fkConfig: 'Logical Foreign Key Configuration',
	activeRelations: 'Active Relations',
	sourceTableCol: 'Source Table',
	targetTableCol: 'Target Table',
	relation: 'Relation',
	noRelations: 'No logical foreign keys configured',
	labelSourceTable: 'Source Table',
	labelSourceColumn: 'Source Column',
	labelTargetTable: 'Target Table',
	labelTargetColumn: 'Target Column',
	placeholderSelectSourceTable: 'Select a source table',
	placeholderSelectSourceFirst: 'Select the source table first',
	placeholderSelectTargetTable: 'Select a target table',
	placeholderSelectTargetFirst: 'Select the target table first',
	addRelation: 'Add Relation',
	loadFkFailed: 'Failed to load foreign key configuration',
	addRelationSuccess: 'Relation added successfully',
	addFailed: 'Failed to add',
	deleteFkConfirmMessage:
		'Are you sure you want to delete this logical foreign key?',
};
