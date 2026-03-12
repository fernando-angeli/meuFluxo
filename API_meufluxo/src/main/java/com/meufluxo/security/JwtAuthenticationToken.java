package com.meufluxo.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class JwtAuthenticationToken extends UsernamePasswordAuthenticationToken {

    public JwtAuthenticationToken(
            CustomUserDetails principal,
            Collection<? extends GrantedAuthority> authorities
    ) {
        super(principal, null, authorities);
    }
}
