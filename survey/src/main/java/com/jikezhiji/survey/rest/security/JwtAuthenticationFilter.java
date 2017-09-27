package com.jikezhiji.survey.rest.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by liusizuo on 2017/6/17.
 */
public class JwtAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
    public JwtAuthenticationFilter() {
        super("/**");
        super.setAuthenticationSuccessHandler((request, response, authentication) -> {});
    }

    @Override
    protected boolean requiresAuthentication(HttpServletRequest request, HttpServletResponse response) {
        String header = request.getHeader("Authorization");
        return header != null && header.startsWith("Bearer ");
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String token = request.getHeader("Authorization").substring(7);
        Claims claims = Jwts.checkToken(token);
        return new JwtAuthenticationToken(claims,request);

    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult)
            throws IOException, ServletException {
        super.successfulAuthentication(request, response, chain, authResult);

        chain.doFilter(request, response);
    }
}
