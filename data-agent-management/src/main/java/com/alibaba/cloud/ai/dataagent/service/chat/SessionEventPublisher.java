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
package com.alibaba.cloud.ai.dataagent.service.chat;

import com.alibaba.cloud.ai.dataagent.vo.SessionUpdateEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.core.publisher.SignalType;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Manage SSE streams that push session updates to frontend. sink 按 agent + 用户分区：
 * 开启租户隔离后同一 agent 下的不同用户各有自己的 sink，互不接收对方的会话事件。
 * userId 为 null（未开启隔离/独立部署）时退化为每个 agent 一个共享 sink。
 */
@Slf4j
@Service
public class SessionEventPublisher {

	private final Map<String, AgentSessionSink> sinks = new ConcurrentHashMap<>();

	public Flux<ServerSentEvent<SessionUpdateEvent>> register(Integer agentId, Long userId) {
		String key = sinkKey(agentId, userId);
		return Flux.defer(() -> {
			AgentSessionSink sink = sinks.computeIfAbsent(key, id -> new AgentSessionSink());
			Flux<ServerSentEvent<SessionUpdateEvent>> heartbeat = Flux.interval(Duration.ofSeconds(2))
				.map(i -> ServerSentEvent.<SessionUpdateEvent>builder().comment("heartbeat").build());
			sink.increment();
			log.debug("Registered subscriber for {}, current count: {}", key, sink.subscribers.get());
			return Flux.merge(heartbeat, sink.sink.asFlux()).doFinally(signalType -> cleanup(key, sink, signalType));
		});
	}

	public void publishTitleUpdated(Integer agentId, Long userId, String sessionId, String title) {
		if (agentId == null) {
			return;
		}
		String key = sinkKey(agentId, userId);
		SessionUpdateEvent event = SessionUpdateEvent.titleUpdated(sessionId, title);
		AgentSessionSink sink = sinks.get(key);
		if (sink == null) {
			log.debug("No active subscribers for {}, skip pushing session title update", key);
			return;
		}
		Sinks.EmitResult result = sink.sink.tryEmitNext(ServerSentEvent.builder(event).event(event.getType()).build());
		if (result.isFailure()) {
			log.warn("Failed to emit session title update for {}, session {}, reason {}", key, sessionId, result);
		}
	}

	private static String sinkKey(Integer agentId, Long userId) {
		return userId == null ? String.valueOf(agentId) : agentId + ":" + userId;
	}

	private void cleanup(String key, AgentSessionSink sink, SignalType signalType) {
		int current = sink.decrement();
		log.debug("Cleanup called for {}, signal: {}, remaining subscribers: {}", key, signalType, current);
		if (current <= 0) {
			// 使用 remove(key, value) 确保只移除当前的 sink 实例，防止并发问题
			if (sinks.remove(key, sink)) {
				sink.sink.tryEmitComplete();
				log.debug("Removed session update sink for {}", key);
			}
		}
	}

	private static class AgentSessionSink {

		private final AtomicInteger subscribers = new AtomicInteger(0);

		private final Sinks.Many<ServerSentEvent<SessionUpdateEvent>> sink = Sinks.many()
			.multicast()
			.onBackpressureBuffer();

		private void increment() {
			subscribers.incrementAndGet();
		}

		private int decrement() {
			return subscribers.decrementAndGet();
		}

	}

}
