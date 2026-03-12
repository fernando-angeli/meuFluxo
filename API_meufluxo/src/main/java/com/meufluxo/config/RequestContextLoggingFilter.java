package com.meufluxo.config;

import com.meufluxo.service.CurrentUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class RequestContextLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestContextLoggingFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    private final CurrentUserService currentUserService;

    public RequestContextLoggingFilter(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long startedAt = System.currentTimeMillis();

        String requestId = resolveRequestId(request);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        MDC.put("requestId", requestId);
        MDC.put("path", request.getRequestURI());
        MDC.put("method", request.getMethod());

        try {
            Long userId = currentUserService.getCurrentUserId();
            if (userId != null) {
                MDC.put("userId", userId.toString());
            }

            Long workspaceId = currentUserService.getCurrentWorkspaceId();
            if (workspaceId != null) {
                MDC.put("workspaceId", workspaceId.toString());
            }
        } catch (RuntimeException ignored) {
            // Requests like login or anonymous access do not have a resolved user/workspace yet.
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = System.currentTimeMillis() - startedAt;
            log.info("request completed status={} durationMs={}", response.getStatus(), durationMs);
            MDC.clear();
        }
    }

    private String resolveRequestId(HttpServletRequest request) {
        return Optional.ofNullable(request.getHeader(REQUEST_ID_HEADER))
                .filter(value -> !value.isBlank())
                .orElse(UUID.randomUUID().toString());
    }
}
