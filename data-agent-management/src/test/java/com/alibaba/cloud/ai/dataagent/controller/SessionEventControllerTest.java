/*
 * Copyright 2024-2026 the original author or authors.
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
package com.alibaba.cloud.ai.dataagent.controller;

import com.alibaba.cloud.ai.dataagent.service.agent.AgentService;
import com.alibaba.cloud.ai.dataagent.service.chat.SessionEventPublisher;
import com.alibaba.cloud.ai.dataagent.tenant.DpTenantContext;
import com.alibaba.cloud.ai.dataagent.vo.SessionUpdateEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionEventControllerTest {

	@Mock
	private SessionEventPublisher sessionEventPublisher;

	@Mock
	private AgentService agentService;

	private SessionEventController controller;

	@BeforeEach
	void setUp() {
		controller = new SessionEventController(sessionEventPublisher, agentService);
	}

	@Test
	void streamSessionUpdates_subscribesAndReturnsFlux() {
		ServerHttpResponse response = mock(ServerHttpResponse.class);
		HttpHeaders headers = new HttpHeaders();
		when(response.getHeaders()).thenReturn(headers);

		SessionUpdateEvent event = SessionUpdateEvent.titleUpdated("session-1", "New Title");
		ServerSentEvent<SessionUpdateEvent> sse = ServerSentEvent.<SessionUpdateEvent>builder()
			.data(event)
			.event(event.getType())
			.build();
		when(sessionEventPublisher.register(1, null)).thenReturn(Flux.just(sse));

		Flux<ServerSentEvent<SessionUpdateEvent>> result = controller.streamSessionUpdates(1, response,
				mock(ServerWebExchange.class));

		StepVerifier.create(result)
			.expectNextMatches(e -> e.data() != null && "session-1".equals(e.data().getSessionId()))
			.verifyComplete();
	}

	@Test
	void streamSessionUpdates_subscribesToCurrentUserPartition() {
		ServerHttpResponse response = mock(ServerHttpResponse.class);
		when(response.getHeaders()).thenReturn(new HttpHeaders());
		when(sessionEventPublisher.register(1, 7L)).thenReturn(Flux.empty());
		DpTenantContext.set(7L, 3L);
		try {
			controller.streamSessionUpdates(1, response, mock(ServerWebExchange.class));
			verify(sessionEventPublisher).register(1, 7L);
		}
		finally {
			DpTenantContext.clear();
		}
	}

	@Test
	void streamSessionUpdates_setsResponseHeaders() {
		ServerHttpResponse response = mock(ServerHttpResponse.class);
		HttpHeaders headers = new HttpHeaders();
		when(response.getHeaders()).thenReturn(headers);
		when(sessionEventPublisher.register(1, null)).thenReturn(Flux.empty());

		controller.streamSessionUpdates(1, response, mock(ServerWebExchange.class));

		assertEquals(3, headers.size());
		assertTrue(headers.containsKey("Cache-Control"));
		assertTrue(headers.containsKey("Connection"));
		assertTrue(headers.containsKey("Access-Control-Allow-Origin"));
	}

	@Test
	void streamSessionUpdates_rejectsAgentOutsideWorkspace() {
		ServerHttpResponse response = mock(ServerHttpResponse.class);
		doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)).when(agentService).requireAccessible(1L);

		assertThrows(ResponseStatusException.class,
				() -> controller.streamSessionUpdates(1, response, mock(ServerWebExchange.class)));
		verify(sessionEventPublisher, never()).register(anyInt(), any());
	}

}
