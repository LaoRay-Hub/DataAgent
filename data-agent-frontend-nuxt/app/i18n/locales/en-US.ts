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

import agentEditor from './parts/en-US/agentEditor';
import agentKnowledge from './parts/en-US/agentKnowledge';
import agentManage from './parts/en-US/agentManage';
import chat from './parts/en-US/chat';
import common from './parts/en-US/common';
import dataSource from './parts/en-US/dataSource';
import knowledge from './parts/en-US/knowledge';
import modelConfig from './parts/en-US/modelConfig';
import promptConfig from './parts/en-US/promptConfig';
import shared from './parts/en-US/shared';

export default {
	...common,
	chat,
	modelConfig,
	dataSource,
	knowledge,
	agentKnowledge,
	promptConfig,
	agentEditor,
	agentManage,
	shared,
};
