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

import agentEditor from './parts/zh-CN/agentEditor';
import agentKnowledge from './parts/zh-CN/agentKnowledge';
import agentManage from './parts/zh-CN/agentManage';
import chat from './parts/zh-CN/chat';
import common from './parts/zh-CN/common';
import dataSource from './parts/zh-CN/dataSource';
import knowledge from './parts/zh-CN/knowledge';
import modelConfig from './parts/zh-CN/modelConfig';
import promptConfig from './parts/zh-CN/promptConfig';
import shared from './parts/zh-CN/shared';

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
