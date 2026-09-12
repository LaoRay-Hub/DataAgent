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

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

/**
 * 带 {@code @RequestBody} 的处理器方法可能在另一条事件循环线程上被调用，
 * {@link DpTenantWebFilter} 在过滤链线程上设置的 ThreadLocal 到那时已经读不到。
 * 因此凡是把 {@link ServerWebExchange} 声明为最后一个参数的控制器方法，
 * 都在真正执行处理器的那条线程上重新绑定一次租户上下文。
 */
@Aspect
@Component
@ConditionalOnProperty(name = "dataagent.tenant.enabled", havingValue = "true")
public class DpTenantAspect {

	@Around(argNames = "joinPoint,exchange",
			value = "within(com.alibaba.cloud.ai.dataagent.controller..*) && args(.., exchange)")
	public Object bindTenantContext(ProceedingJoinPoint joinPoint, ServerWebExchange exchange) throws Throwable {
		DpTenantContext.set(DpTenantWebFilter.userId(exchange), DpTenantWebFilter.workspaceId(exchange));
		try {
			return joinPoint.proceed();
		}
		finally {
			DpTenantContext.clear();
		}
	}

}
