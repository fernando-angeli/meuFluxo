package com.meufluxo.service;

import com.meufluxo.model.RefreshTokenSession;
import com.meufluxo.model.workspaceAndUsers.User;
import com.meufluxo.repository.RefreshTokenSessionRepository;
import com.meufluxo.security.RefreshTokenProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenSessionServiceTest {

    @Mock
    private RefreshTokenSessionRepository repository;

    private RefreshTokenSessionService service;

    @BeforeEach
    void setUp() {
        RefreshTokenProperties properties = new RefreshTokenProperties(
                2_592_000_000L,
                "mf_refresh_token",
                "/auth",
                "Lax",
                false,
                true,
                ""
        );
        service = new RefreshTokenSessionService(repository, properties);
    }

    @Test
    void issueShouldPersistHashedTokenAndReturnRawToken() {
        User user = buildUser(1L);
        when(repository.save(any(RefreshTokenSession.class))).thenAnswer(invocation -> {
            RefreshTokenSession session = invocation.getArgument(0);
            session.setId(10L);
            return session;
        });

        RefreshTokenSessionService.IssuedRefreshToken issued = service.issue(user, "Browser", "127.0.0.1");

        assertNotNull(issued.rawToken());
        assertTrue(issued.rawToken().length() > 40);
        assertNotNull(issued.session().getId());

        ArgumentCaptor<RefreshTokenSession> captor = ArgumentCaptor.forClass(RefreshTokenSession.class);
        verify(repository).save(captor.capture());
        assertEquals(user, captor.getValue().getUser());
        assertNotNull(captor.getValue().getTokenHash());
        assertNotEquals(issued.rawToken(), captor.getValue().getTokenHash());
    }

    @Test
    void refreshWithExpiredTokenShouldFail() {
        RefreshTokenSession session = new RefreshTokenSession();
        session.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        session.setRevokedAt(null);

        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(session));

        assertThrows(BadCredentialsException.class, () -> service.validateActiveSession("expired-token"));
    }

    @Test
    void refreshWithRevokedTokenShouldFail() {
        RefreshTokenSession session = new RefreshTokenSession();
        session.setExpiresAt(LocalDateTime.now().plusDays(1));
        session.setRevokedAt(LocalDateTime.now().minusSeconds(1));

        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(session));

        assertThrows(BadCredentialsException.class, () -> service.validateActiveSession("revoked-token"));
    }

    @Test
    void rotateShouldRevokeCurrentSessionAndIssueNewOne() {
        User user = buildUser(2L);

        RefreshTokenSession currentSession = new RefreshTokenSession();
        currentSession.setId(21L);
        currentSession.setUser(user);
        currentSession.setExpiresAt(LocalDateTime.now().plusDays(1));
        currentSession.setRevokedAt(null);

        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(currentSession));
        when(repository.save(any(RefreshTokenSession.class))).thenAnswer(invocation -> {
            RefreshTokenSession session = invocation.getArgument(0);
            if (session.getId() == null) {
                session.setId(30L);
            }
            return session;
        });

        RefreshTokenSessionService.IssuedRefreshToken rotated = service.rotate("valid-refresh-token", "Browser 2", "127.0.0.2");

        assertNotNull(rotated.rawToken());
        assertEquals(30L, rotated.session().getId());
        assertNotNull(currentSession.getRevokedAt());
        assertEquals(30L, currentSession.getReplacedBySessionId());
    }

    @Test
    void rotateShouldGenerateDifferentTokenFromOriginal() {
        User user = buildUser(3L);
        when(repository.save(any(RefreshTokenSession.class))).thenAnswer(invocation -> {
            RefreshTokenSession session = invocation.getArgument(0);
            if (session.getId() == null) {
                session.setId(40L);
            }
            return session;
        });

        RefreshTokenSessionService.IssuedRefreshToken issued = service.issue(user, "UA", "10.0.0.1");

        RefreshTokenSession currentSession = issued.session();
        currentSession.setExpiresAt(LocalDateTime.now().plusDays(1));
        currentSession.setRevokedAt(null);

        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(currentSession));
        RefreshTokenSessionService.IssuedRefreshToken rotated = service.rotate(issued.rawToken(), "UA", "10.0.0.1");

        assertNotEquals(issued.rawToken(), rotated.rawToken());
    }

    private static User buildUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setName("User " + id);
        user.setEmail("user" + id + "@mail.com");
        user.setPassword("encrypted");
        user.setEnabled(true);
        user.setActive(true);
        return user;
    }
}
