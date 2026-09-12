/*
 * Copyright 2026 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.alibaba.cloud.ai.dataagent.tenant;

/**
 * Holds the data-pilot identity (user / workspace) injected by the reverse proxy for the
 * current request. Null values mean "standalone mode" (no tenant isolation).
 */
public final class DpTenantContext {

	private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();

	private static final ThreadLocal<Long> WORKSPACE_ID = new ThreadLocal<>();

	private DpTenantContext() {
	}

	public static void set(Long userId, Long workspaceId) {
		USER_ID.set(userId);
		WORKSPACE_ID.set(workspaceId);
	}

	public static Long userId() {
		return USER_ID.get();
	}

	public static Long workspaceId() {
		return WORKSPACE_ID.get();
	}

	public static boolean active() {
		return USER_ID.get() != null || WORKSPACE_ID.get() != null;
	}

	public static void clear() {
		USER_ID.remove();
		WORKSPACE_ID.remove();
	}

}
