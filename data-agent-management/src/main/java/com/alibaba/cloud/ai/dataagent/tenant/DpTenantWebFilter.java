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

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Reads the data-pilot identity headers injected by the reverse proxy and exposes them via
 * {@link DpTenantContext} for the duration of the request. Only active when
 * {@code dataagent.tenant.enabled=true}; otherwise the app runs standalone with no isolation.
 */
@Component
@ConditionalOnProperty(name = "dataagent.tenant.enabled", havingValue = "true")
public class DpTenantWebFilter implements WebFilter {

	public static final String HEADER_USER_ID = "X-Dp-User-Id";

	public static final String HEADER_WORKSPACE_ID = "X-Dp-Workspace-Id";

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
		DpTenantContext.set(userId(exchange), workspaceId(exchange));
		return chain.filter(exchange).doFinally(signal -> DpTenantContext.clear());
	}

	public static Long userId(ServerWebExchange exchange) {
		return parseLong(exchange.getRequest().getHeaders().getFirst(HEADER_USER_ID));
	}

	public static Long workspaceId(ServerWebExchange exchange) {
		return parseLong(exchange.getRequest().getHeaders().getFirst(HEADER_WORKSPACE_ID));
	}

	private static Long parseLong(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return Long.parseLong(value.trim());
		}
		catch (NumberFormatException e) {
			return null;
		}
	}

}
