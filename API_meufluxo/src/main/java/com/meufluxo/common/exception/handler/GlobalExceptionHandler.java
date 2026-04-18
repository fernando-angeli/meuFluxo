package com.meufluxo.common.exception.handler;

import com.meufluxo.common.exception.BusinessException;
import com.meufluxo.common.exception.NotFoundException;
import com.meufluxo.common.exception.model.FieldError;
import com.meufluxo.common.exception.model.StandardError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private ResponseEntity<StandardError> buildError(
            HttpStatus status,
            String title,
            String detail,
            List<FieldError> errors,
            HttpServletRequest request
    ) {
        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                title,
                detail,
                request.getRequestURI(),
                errors
        );
        return ResponseEntity.status(status).body(err);
    }

    // =========================
    // Bean Validation (DTO)
    // =========================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardError> validationError(
            MethodArgumentNotValidException e,
            HttpServletRequest request
    ) {
        List<FieldError> errors = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> new FieldError(
                        err.getField(),
                        err.getDefaultMessage()
                ))
                .collect(Collectors.toList());

        return buildError(
                HttpStatus.BAD_REQUEST,
                "Validation error",
                "One or more fields are invalid.",
                errors,
                request
        );
    }

    // =========================
    // Not Found
    // =========================
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<StandardError> handleNotFound(
            NotFoundException e,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "Resource not found",
                e.getMessage(),
                List.of(),
                request
        );
    }

    // =========================
    // Business Rule
    // =========================
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<StandardError> handleBusiness(
            BusinessException e,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Business rule violation",
                e.getMessage(),
                List.of(),
                request
        );
    }

    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<StandardError> handleAuthentication(
            RuntimeException e,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                "Invalid email or password.",
                List.of(),
                request
        );
    }

    // =========================
    // Data Integrity (fallback)
    // =========================
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<StandardError> handleDataIntegrity(
            DataIntegrityViolationException e,
            HttpServletRequest request
    ) {
        String rootMessage = e.getMostSpecificCause() != null ? e.getMostSpecificCause().getMessage() : e.getMessage();
        log.warn("Data integrity violation at {}: {}", request.getRequestURI(), rootMessage);
        return buildError(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Data integrity violation",
                "Operação inválida para os dados informados.",
                List.of(),
                request
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<StandardError> handleConstraintViolation(
            ConstraintViolationException e,
            HttpServletRequest request
    ) {
        List<FieldError> errors = e.getConstraintViolations().stream()
                .map(v -> new FieldError(v.getPropertyPath().toString(), v.getMessage()))
                .collect(Collectors.toList());

        return buildError(
                HttpStatus.BAD_REQUEST,
                "Validation error",
                "One or more fields are invalid.",
                errors,
                request
        );
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<StandardError> handleNoResourceFound(
            NoResourceFoundException e,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "Resource not found",
                "Rota não encontrada: " + request.getRequestURI(),
                List.of(),
                request
        );
    }

    // =========================
    // Generic fallback
    // =========================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardError> handleGeneric(
            Exception e,
            HttpServletRequest request
    ) {
        log.error("Unexpected error at {}", request.getRequestURI(), e);
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error",
                "An unexpected error occurred.",
                List.of(),
                request
        );
    }

    // =========================
    // Invalid Format
    // =========================
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<StandardError> handleInvalidFormat(
            org.springframework.http.converter.HttpMessageNotReadableException e,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.BAD_REQUEST,
                "Malformed JSON request",
                "Request body is invalid or contains incorrect field values.",
                List.of(),
                request
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<StandardError> handleTypeMismatch(
            MethodArgumentTypeMismatchException e,
            HttpServletRequest request
    ) {
        String parameter = e.getName();
        String value = e.getValue() == null ? "null" : e.getValue().toString();
        return buildError(
                HttpStatus.BAD_REQUEST,
                "Invalid parameter format",
                "Parâmetro '" + parameter + "' com valor inválido: '" + value + "'.",
                List.of(),
                request
        );
    }

    // =========================
    // PasswordValidation - IMPLEMENTAÇÃO FUTURA QUANDO ADICIONAR AUTENTICAÇÃO JWT
    // =========================
    //    @ExceptionHandler(PasswordException.class)
    //    public ResponseEntity<StandardError> invalidPassword(PasswordException e, HttpServletRequest request) {
    //        HttpStatus status = HttpStatus.BAD_REQUEST;
    //        StandardError err = new StandardError(
    //                Instant.now(),
    //                status.value(),
    //                "Invalid password",
    //                Map.of("password", e.getMessage()),
    //                request.getRequestURI()
    //        );
    //        return ResponseEntity.status(status).body(err);
    //    }

}
